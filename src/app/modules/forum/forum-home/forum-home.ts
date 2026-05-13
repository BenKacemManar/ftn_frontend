import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-forum-home',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, AvatarModule, BadgeModule],
    template: `
        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Community Forum</h2>
            <p-button label="New Topic" icon="pi pi-plus" />
        </div>

        <div class="grid">
            @for (category of categories; track category.name) {
                <div class="col-12">
                    <p-card [header]="category.name" styleClass="ftn-forum-card">
                        <div class="flex align-items-center justify-content-between">
                            <p class="m-0 text-color-secondary">{{ category.description }}</p>
                            <div class="flex gap-3 text-color-secondary text-sm">
                                <span><i class="pi pi-comments mr-1"></i>0 topics</span>
                                <span><i class="pi pi-clock mr-1"></i>—</span>
                            </div>
                        </div>
                    </p-card>
                </div>
            }
        </div>
    `
})
export class ForumHome {
    categories = [
        { name: 'Competitions', description: 'Discussions about competitions and events' },
        { name: 'Training', description: 'Training tips and workout programs' },
        { name: 'News', description: 'News from the federation and Tunisian swimming' },
        { name: 'General', description: 'General discussions about swimming' }
    ];
}
