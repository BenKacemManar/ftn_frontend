import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ForumService, Topic } from '../forum.service';

@Component({
    selector: 'app-forum-home',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, AvatarModule, TagModule, InputTextModule, SelectModule, DialogModule],
    template: `
        <div class="ftn-page-enter">
            <div class="ftn-page-header">
                <h2 class="ftn-page-title">Community Forum</h2>
            </div>

            <div class="flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
                <div class="flex flex-wrap gap-3 align-items-center">
                    <span class="relative">
                        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-color-secondary"></i>
                        <input pInputText [(ngModel)]="searchQuery" placeholder="Search topics..." style="padding-left: 2.75rem; min-width: 220px;" />
                    </span>
                    <p-select
                        [options]="categoryOptions"
                        [(ngModel)]="selectedCategory"
                        optionLabel="label"
                        optionValue="value"
                        styleClass="min-w-11rem" />
                    <p-select
                        [options]="sortOptions"
                        [(ngModel)]="selectedSort"
                        optionLabel="label"
                        optionValue="value"
                        styleClass="min-w-8rem" />
                </div>
                <p-button label="New Topic" icon="pi pi-plus" severity="primary" (click)="newTopicDialog = true" />
            </div>

            <div class="grid">
                @for (topic of filteredTopics; track topic.id) {
                    <div class="col-12">
                        <p-card styleClass="ftn-topic-card" (click)="goToTopic(topic.id)">
                            <div class="flex align-items-start gap-3">
                                <p-avatar icon="pi pi-user" shape="circle" styleClass="mt-1" size="large" />
                                <div class="flex-1 min-w-0">
                                    <div class="flex align-items-center gap-2 mb-1 flex-nowrap">
                                        <span class="font-bold text-xl text-900 hover:text-primary transition-duration-150 truncate">
                                            {{ topic.title }}
                                        </span>
                                        <p-tag [value]="topic.category" [severity]="getSeverity(topic.category)" styleClass="shrink-0" />
                                    </div>
                                    @if (topic.isRepost) {
                                        <div class="flex align-items-center gap-1 text-xs text-color-secondary mb-1">
                                            <i class="pi pi-replay"></i>
                                            <span>Reposted from {{ topic.repostAuthor }}</span>
                                        </div>
                                    }
                                    <p class="m-0 text-color-secondary line-height-3 text-sm">{{ topic.description }}</p>
                                    <div class="flex flex-nowrap gap-4 align-items-center mt-2 text-sm text-color-secondary">
                                        <span class="flex align-items-center gap-1"><i class="pi pi-user"></i>{{ topic.author }}</span>
                                        <span class="flex align-items-center gap-1"><i class="pi pi-calendar"></i>{{ topic.createdAt | date : 'MMM d, yyyy' }}</span>
                                        <span class="flex align-items-center gap-1"><i class="pi pi-comment"></i>{{ topic.replyCount }}</span>
                                        <span class="flex align-items-center gap-1"><i class="pi pi-eye"></i>{{ topic.viewCount }}</span>
                                    </div>
                                </div>
                                <i class="pi pi-chevron-right text-color-secondary mt-3 shrink-0"></i>
                            </div>
                        </p-card>
                    </div>
                }
                @empty {
                    <div class="col-12">
                        <p-card>
                            <div class="text-center py-5">
                                <i class="pi pi-search text-5xl text-color-secondary mb-3 block"></i>
                                <p class="text-color-secondary m-0">No topics found matching "{{ searchQuery }}"</p>
                            </div>
                        </p-card>
                    </div>
                }
            </div>
        </div>

        <p-dialog header="Create New Topic" [(visible)]="newTopicDialog" [modal]="true" [style]="{ width: '520px' }" [draggable]="false" [resizable]="false">
            <div class="flex flex-column gap-4">
                <div>
                    <label for="topic-title" class="font-semibold text-sm mb-1 block text-color">Title</label>
                    <input id="topic-title" pInputText [(ngModel)]="newTopic.title" class="w-full" placeholder="Give your topic a title..." />
                </div>
                <div>
                    <label for="topic-desc" class="font-semibold text-sm mb-1 block text-color">Description</label>
                    <textarea id="topic-desc" [(ngModel)]="newTopic.description" class="w-full p-3 border-1 border-solid border-gray-300 dark:border-gray-600 border-round bg-transparent text-color" rows="4" placeholder="Describe your topic in detail..." style="resize: vertical;"></textarea>
                </div>
                <div>
                    <label class="font-semibold text-sm mb-1 block text-color">Category</label>
                    <p-select
                        [options]="categoryOptions.slice(1)"
                        [(ngModel)]="newTopic.category"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select a category"
                        styleClass="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-content-end">
                    <p-button label="Cancel" severity="secondary" (click)="newTopicDialog = false" />
                    <p-button label="Create" severity="primary" (click)="createTopic()" [disabled]="!newTopic.title.trim() || !newTopic.description.trim() || !newTopic.category" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class ForumHome {
    private forumService = inject(ForumService);
    private router = inject(Router);

    searchQuery = '';
    selectedCategory = '';
    selectedSort = 'newest';
    newTopicDialog = false;

    newTopic = { title: '', description: '', category: '' };

    categoryOptions = [
        { label: 'All Categories', value: '' },
        { label: 'Competitions', value: 'Competitions' },
        { label: 'Training', value: 'Training' },
        { label: 'News', value: 'News' },
        { label: 'General', value: 'General' }
    ];

    sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Popular', value: 'popular' }
    ];

    get topics(): Topic[] {
        return this.forumService.getTopics();
    }

    get filteredTopics(): Topic[] {
        let result = this.topics;
        const q = this.searchQuery.toLowerCase().trim();
        if (q) result = result.filter(t => t.title.toLowerCase().includes(q));
        if (this.selectedCategory) result = result.filter(t => t.category === this.selectedCategory);
        result = [...result];
        if (this.selectedSort === 'newest') {
            result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (this.selectedSort === 'oldest') {
            result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        } else {
            result.sort((a, b) => b.viewCount - a.viewCount);
        }
        return result;
    }

    getSeverity(category: string): 'info' | 'success' | 'warn' | 'contrast' {
        const map: Record<string, 'info' | 'success' | 'warn' | 'contrast'> = {
            Competitions: 'info',
            Training: 'success',
            News: 'warn',
            General: 'contrast'
        };
        return map[category] ?? 'contrast';
    }

    goToTopic(id: number): void {
        this.router.navigate(['/forum/topic', id]);
    }

    createTopic(): void {
        const t = this.newTopic;
        if (!t.title.trim() || !t.description.trim() || !t.category) return;
        this.forumService.addTopic(t.title, t.description, t.category, 'You');
        this.newTopic = { title: '', description: '', category: '' };
        this.newTopicDialog = false;
    }
}
