import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ForumService } from '../../../core/services/forum.service';
import { Forum, Sujet, CreateSujet } from '../../../core/models/forum.model';

interface ForumWithSujets extends Forum {
    sujets: Sujet[];
    loadingSujets: boolean;
    expanded: boolean;
}

@Component({
    selector: 'app-forum-home',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CardModule, ButtonModule, TagModule, BadgeModule, DialogModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Community Forum</h2>
        </div>

        @if (loading()) {
            <div class="text-center py-12"><i class="pi pi-spin pi-spinner text-4xl" style="color: var(--p-primary-color);"></i></div>
        } @else if (forums().length === 0) {
            <div class="text-center py-12 text-color-secondary">No forum categories available yet.</div>
        } @else {
            <div class="flex flex-col gap-4">
                @for (forum of forums(); track forum.id) {
                    <div class="rounded-xl border overflow-hidden" style="background: var(--surface-card); border-color: var(--surface-border);">
                        <!-- Forum Header -->
                        <div class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-hover transition-colors"
                             (click)="toggleForum(forum)">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style="background: var(--p-primary-100);">
                                <i class="pi pi-comments text-xl" style="color: var(--p-primary-color);"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-base font-semibold m-0">{{ forum.nom }}</h3>
                                    <p-tag [value]="forum.categorie" severity="info" />
                                </div>
                                <p class="text-sm text-color-secondary m-0 mt-1">{{ forum.description }}</p>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-color-secondary flex-shrink-0">
                                <div class="text-center">
                                    <div class="font-semibold text-lg" style="color: var(--text-color);">{{ forum.nb_sujets }}</div>
                                    <div class="text-xs">Topics</div>
                                </div>
                                <i class="pi" [class.pi-chevron-down]="!forum.expanded" [class.pi-chevron-up]="forum.expanded"></i>
                            </div>
                        </div>

                        <!-- Topics List (expanded) -->
                        @if (forum.expanded) {
                            <div style="border-top: 1px solid var(--surface-border);">
                                @if (forum.loadingSujets) {
                                    <div class="text-center py-4"><i class="pi pi-spin pi-spinner"></i></div>
                                } @else if (forum.sujets.length === 0) {
                                    <div class="text-center py-6 text-color-secondary text-sm">No topics yet. Be the first to post!</div>
                                } @else {
                                    @for (sujet of forum.sujets.slice(0, 5); track sujet.id) {
                                        <div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-hover transition-colors"
                                             style="border-bottom: 1px solid var(--surface-border);">
                                            <div class="flex-shrink-0">
                                                @if (sujet.epingle) {
                                                    <i class="pi pi-thumbtack text-sm" style="color: var(--p-warning-color);"></i>
                                                } @else {
                                                    <i class="pi pi-comment text-sm text-color-secondary"></i>
                                                }
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <span class="font-medium text-sm truncate">{{ sujet.titre }}</span>
                                                    @if (sujet.ferme) {
                                                        <p-tag value="Closed" severity="secondary" />
                                                    }
                                                </div>
                                                <div class="text-xs text-color-secondary mt-0.5">
                                                    {{ sujet.date_creation | date:'dd MMM yyyy' }}
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4 text-xs text-color-secondary flex-shrink-0">
                                                <span><i class="pi pi-eye mr-1"></i>{{ sujet.nb_vues }}</span>
                                                <span><i class="pi pi-comment mr-1"></i>{{ sujet.nb_reponses }}</span>
                                            </div>
                                        </div>
                                    }
                                    @if (forum.sujets.length > 5) {
                                        <div class="px-5 py-3 text-sm text-center text-color-secondary">
                                            + {{ forum.sujets.length - 5 }} more topics
                                        </div>
                                    }
                                }
                                <div class="px-5 py-3 flex justify-end">
                                    <p-button label="New Topic" icon="pi pi-plus" size="small" (onClick)="openNewTopic(forum)" />
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        }

        <!-- New Topic Dialog -->
        <p-dialog [(visible)]="topicDialogVisible" header="New Topic" [modal]="true" [style]="{width: '500px'}">
            <div class="flex flex-col gap-4 mt-4">
                <div>
                    <label class="block mb-1 font-medium">Title *</label>
                    <input pInputText [(ngModel)]="newTopic.titre" class="w-full" placeholder="Topic title" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Content *</label>
                    <textarea pInputText [(ngModel)]="newTopic.contenu" class="w-full" rows="5"
                              placeholder="Write your message..." style="resize: vertical;"></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="topicDialogVisible = false" />
                <p-button label="Post" icon="pi pi-send" (onClick)="submitTopic()" [loading]="savingTopic()" />
            </ng-template>
        </p-dialog>
    `
})
export class ForumHome implements OnInit {
    private forumService = inject(ForumService);
    private messageService = inject(MessageService);

    forums = signal<ForumWithSujets[]>([]);
    loading = signal(false);
    topicDialogVisible = false;
    savingTopic = signal(false);
    newTopic: CreateSujet = { forum_id: 0, titre: '', contenu: '' };

    ngOnInit(): void {
        this.loading.set(true);
        this.forumService.getAll().subscribe({
            next: (page) => {
                const raw = page.data ?? [];
                this.forums.set(raw.map(f => ({ ...f, sujets: [], loadingSujets: false, expanded: false })));
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    toggleForum(forum: ForumWithSujets): void {
        forum.expanded = !forum.expanded;
        if (forum.expanded && forum.sujets.length === 0) {
            forum.loadingSujets = true;
            this.forumService.getSujets(forum.id).subscribe({
                next: (sujets) => { forum.sujets = sujets; forum.loadingSujets = false; },
                error: () => { forum.loadingSujets = false; }
            });
        }
    }

    openNewTopic(forum: ForumWithSujets): void {
        this.newTopic = { forum_id: forum.id, titre: '', contenu: '' };
        this.topicDialogVisible = true;
    }

    submitTopic(): void {
        if (!this.newTopic.titre || !this.newTopic.contenu) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Title and content are required' });
            return;
        }
        this.savingTopic.set(true);
        this.forumService.createSujet(this.newTopic).subscribe({
            next: () => {
                this.savingTopic.set(false);
                this.topicDialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Posted', detail: 'Topic created successfully' });
                const forum = this.forums().find(f => f.id === this.newTopic.forum_id);
                if (forum) {
                    forum.sujets = [];
                    forum.nb_sujets += 1;
                    this.forumService.getSujets(forum.id).subscribe({ next: (s) => forum.sujets = s, error: () => {} });
                }
            },
            error: () => {
                this.savingTopic.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create topic' });
            }
        });
    }
}
