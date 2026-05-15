import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ForumService, FlatReply } from '../forum.service';

@Component({
    selector: 'app-forum-topic',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, AvatarModule, TagModule, DividerModule, InputTextModule],
    template: `
        <div class="ftn-page-enter">
            <div class="mb-3">
                <p-button label="Back to Forum" icon="pi pi-arrow-left" severity="secondary" text="true" routerLink="/forum" />
            </div>

            @if (topic(); as topic) {
                <p-card styleClass="mb-4">
                    <div class="flex align-items-center gap-2 mb-2">
                        <span class="font-bold text-2xl text-900">{{ topic.title }}</span>
                        <p-tag [value]="topic.category" [severity]="getSeverity(topic.category)" styleClass="shrink-0" />
                    </div>
                    @if (topic.isRepost) {
                        <div class="flex align-items-center gap-1 text-xs text-color-secondary mb-2">
                            <i class="pi pi-replay"></i>
                            <span>Reposted from {{ topic.repostAuthor }}</span>
                        </div>
                    }
                    <p class="text-color-secondary line-height-3 mb-3">{{ topic.description }}</p>
                    <div class="flex flex-nowrap gap-4 align-items-center text-sm text-color-secondary">
                        <span class="flex align-items-center gap-1"><i class="pi pi-user"></i>{{ topic.author }}</span>
                        <span class="flex align-items-center gap-1"><i class="pi pi-calendar"></i>{{ topic.createdAt | date : 'MMM d, yyyy' }}</span>
                        <span class="flex align-items-center gap-1"><i class="pi pi-eye"></i>{{ topic.viewCount }}</span>
                        <span class="flex align-items-center gap-1"><i class="pi pi-comment"></i>{{ topic.replyCount }}</span>
                    </div>
                </p-card>

                <p-card header="Replies">
                    @for (item of flatReplies; track item.id) {
                        <div [style.marginLeft.px]="item.depth * 32" class="flex align-items-start gap-3 py-3" [class.pl-3]="item.depth > 0">
                            @if (item.depth > 0) {
                                <div class="w-1px bg-gray-300 dark:bg-gray-600 align-self-stretch shrink-0" style="opacity: 0.4;"></div>
                            }
                            <div class="flex flex-column align-items-center gap-1 shrink-0">
                                <p-avatar icon="pi pi-user" shape="circle" size="large" styleClass="mt-1" />
                                @if (item.isPinned) {
                                    <i class="pi pi-bookmark text-primary text-xs" title="Pinned"></i>
                                }
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex align-items-center gap-2 mb-1">
                                    <span class="font-semibold text-900 text-sm">{{ item.author }}</span>
                                    @if (item.isPinned) {
                                        <p-tag value="Pinned" severity="info" styleClass="text-xs" />
                                    }
                                    <span class="text-xs text-color-secondary">{{ item.createdAt | date : 'MMM d, yyyy · h:mm a' }}</span>
                                </div>
                                <p class="m-0 text-color line-height-3 mb-2">{{ item.content }}</p>
                                <div class="flex align-items-center gap-3">
                                    <div class="reaction-container">
                                        <div class="reaction-popup">
                                            <button class="reaction-btn" (click)="react(item.id)" title="Like">&#x1F44D;</button>
                                            <button class="reaction-btn" (click)="react(item.id)" title="Love">&#x2764;&#xFE0F;</button>
                                            <button class="reaction-btn" (click)="react(item.id)" title="Laugh">&#x1F604;</button>
                                            <button class="reaction-btn" (click)="react(item.id)" title="Wow">&#x1F62E;</button>
                                            <button class="reaction-btn" (click)="react(item.id)" title="Sad">&#x1F622;</button>
                                        </div>
                                        <button pButton icon="pi pi-thumbs-up" [rounded]="true" [text]="true" severity="secondary" size="small" class="p-button-sm reaction-trigger"></button>
                                        <span class="text-sm text-color-secondary font-medium ml-1">{{ item.reactionCount }}</span>
                                    </div>
                                    <span class="text-sm text-color-secondary flex align-items-center gap-1"><i class="pi pi-eye"></i>{{ item.viewCount }}</span>
                                    @if (item.depth === 0) {
                                        <button pButton icon="pi pi-reply" [rounded]="true" [text]="true" severity="secondary" size="small" class="p-button-sm" (click)="replyTo(item.id)" title="Reply to this comment"></button>
                                    }
                                </div>
                            </div>
                        </div>
                        @if (!$last) {
                            <p-divider styleClass="my-0" />
                        }
                    }
                    @empty {
                        <div class="text-center py-5">
                            <i class="pi pi-comments text-4xl text-color-secondary mb-2 block"></i>
                            <p class="text-color-secondary m-0">No replies yet. Be the first to respond!</p>
                        </div>
                    }
                </p-card>

                <p-card styleClass="mt-4">
                    <div class="flex flex-column gap-3">
                        <span class="font-semibold text-color">
                            @if (replyingTo) {
                                <span>Replying to comment</span>
                                <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" size="small" (click)="cancelReply()" class="ml-2"></button>
                            } @else {
                                <span>Post a comment</span>
                            }
                        </span>
                        <div class="flex gap-2 align-items-start">
                            <p-avatar icon="pi pi-user" shape="circle" size="large" />
                            <div class="flex-1">
                                <textarea
                                    [(ngModel)]="newCommentText"
                                    class="w-full p-3 border-1 border-solid border-gray-300 dark:border-gray-600 border-round bg-transparent text-color text-sm"
                                    rows="3"
                                    [placeholder]="replyingTo ? 'Write your reply...' : 'Share your thoughts...'"
                                    style="resize: none;"></textarea>
                                @if (attachedFile) {
                                    <div class="flex align-items-center gap-2 mt-2 p-2 border-1 border-solid border-gray-300 dark:border-gray-600 border-round bg-surface-50 dark:bg-surface-800">
                                        <i class="pi pi-file text-primary"></i>
                                        <span class="text-sm text-color flex-1 truncate">{{ attachedFile.name }}</span>
                                        <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" size="small" (click)="attachedFile = null"></button>
                                    </div>
                                }
                                <div class="flex justify-content-between align-items-center mt-2">
                                    <div class="flex align-items-center gap-2">
                                        <input #fileInput type="file" [hidden]="true" (change)="onFileSelected($event)" accept="image/*,.pdf,.doc,.docx,.txt" />
                                        <button pButton icon="pi pi-paperclip" [rounded]="true" [text]="true" severity="secondary" (click)="fileInput.click()" title="Attach file"></button>
                                        <span class="text-xs text-color-secondary">Attach an image or document</span>
                                    </div>
                                    <p-button label="Submit" icon="pi pi-send" severity="primary" (click)="submitComment()" [disabled]="!newCommentText.trim()" />
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>
            } @else {
                <p-card>
                    <div class="text-center py-5">
                        <i class="pi pi-exclamation-triangle text-4xl text-color-secondary mb-2 block"></i>
                        <p class="text-color-secondary m-0">Topic not found.</p>
                    </div>
                </p-card>
            }
        </div>
    `
})
export class ForumTopic {
    private forumService = inject(ForumService);
    private route = inject(ActivatedRoute);

    private topicId = Number(this.route.snapshot.paramMap.get('id'));
    topic = computed(() => this.forumService.getTopicById(this.topicId));
    flatReplies: FlatReply[] = this.forumService.getFlatReplies(this.topicId);
    newCommentText = '';
    replyingTo: number | null = null;
    attachedFile: File | null = null;

    getSeverity(category: string): 'info' | 'success' | 'warn' | 'contrast' {
        const map: Record<string, 'info' | 'success' | 'warn' | 'contrast'> = {
            Competitions: 'info',
            Training: 'success',
            News: 'warn',
            General: 'contrast'
        };
        return map[category] ?? 'contrast';
    }

    react(replyId: number): void {
        this.forumService.incrementReaction(replyId);
        this.flatReplies = this.forumService.getFlatReplies(this.topicId);
    }

    replyTo(replyId: number): void {
        this.replyingTo = replyId;
        document.querySelector('textarea')?.focus();
    }

    cancelReply(): void {
        this.replyingTo = null;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.attachedFile = input.files[0];
        }
    }

    submitComment(): void {
        const text = this.newCommentText.trim();
        if (!text) return;
        this.forumService.addReply(this.topicId, this.replyingTo, 'You', text);
        this.flatReplies = this.forumService.getFlatReplies(this.topicId);
        this.newCommentText = '';
        this.attachedFile = null;
        this.replyingTo = null;
    }
}
