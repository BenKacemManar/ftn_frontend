import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DashboardService } from '../../core/services/dashboard.service';
import { CompetitionService } from '../../core/services/competition.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { Competition, CompetitionStatut } from '../../core/models/competition.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, TagModule, ButtonModule, DividerModule],
    template: `
        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Dashboard</h2>
            <span class="text-color-secondary">Welcome to the FTN platform</span>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="rounded-xl p-5 flex items-center gap-4" style="background: linear-gradient(135deg, var(--p-primary-500), var(--p-primary-700)); color: white;">
                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
                    <i class="pi pi-users text-2xl"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold">{{ stats()?.nb_athletes ?? 0 }}</div>
                    <div class="text-sm opacity-80">Athletes</div>
                </div>
            </div>

            <div class="rounded-xl p-5 flex items-center gap-4" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
                    <i class="pi pi-flag text-2xl"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold">{{ stats()?.nb_competitions ?? 0 }}</div>
                    <div class="text-sm opacity-80">Competitions</div>
                </div>
            </div>

            <div class="rounded-xl p-5 flex items-center gap-4" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
                    <i class="pi pi-building text-2xl"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold">{{ stats()?.nb_clubs ?? 0 }}</div>
                    <div class="text-sm opacity-80">Clubs</div>
                </div>
            </div>

            <div class="rounded-xl p-5 flex items-center gap-4" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;">
                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
                    <i class="pi pi-map-marker text-2xl"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold">{{ stats()?.nb_piscines ?? 0 }}</div>
                    <div class="text-sm opacity-80">Swimming Pools</div>
                </div>
            </div>
        </div>

        <!-- Competitions Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Upcoming -->
            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex items-center justify-between px-5 pt-4 pb-2">
                        <h3 class="text-lg font-semibold m-0">Upcoming Competitions</h3>
                        <a routerLink="/competitions" class="text-sm" style="color: var(--p-primary-color);">View all</a>
                    </div>
                </ng-template>
                @if (upcoming().length === 0) {
                    <div class="text-center py-6 text-color-secondary">No upcoming competitions</div>
                } @else {
                    <div class="flex flex-col gap-3">
                        @for (comp of upcoming(); track comp.id) {
                            <div class="flex items-center gap-3 p-3 rounded-lg" style="background: var(--surface-ground);">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--p-primary-100);">
                                    <i class="pi pi-calendar" style="color: var(--p-primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">{{ comp.nom }}</div>
                                    <div class="text-sm text-color-secondary">{{ comp.date_debut | date:'dd MMM yyyy' }} — {{ comp.pool_nom }}</div>
                                </div>
                                <p-tag [value]="comp.type" severity="info" />
                            </div>
                        }
                    </div>
                }
            </p-card>

            <!-- In Progress -->
            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex items-center justify-between px-5 pt-4 pb-2">
                        <h3 class="text-lg font-semibold m-0">Live Now</h3>
                        <span class="text-sm text-color-secondary">{{ inProgress().length }} active</span>
                    </div>
                </ng-template>
                @if (inProgress().length === 0) {
                    <div class="text-center py-6 text-color-secondary">No competitions in progress</div>
                } @else {
                    <div class="flex flex-col gap-3">
                        @for (comp of inProgress(); track comp.id) {
                            <div class="flex items-center gap-3 p-3 rounded-lg" style="background: var(--surface-ground);">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background: #dcfce7;">
                                    <i class="pi pi-bolt" style="color: #16a34a;"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">{{ comp.nom }}</div>
                                    <div class="text-sm text-color-secondary">{{ comp.pool_nom }}</div>
                                </div>
                                <p-tag value="LIVE" severity="success" />
                            </div>
                        }
                    </div>
                }
            </p-card>
        </div>
    `
})
export class Dashboard implements OnInit {
    private dashboardService = inject(DashboardService);
    private competitionService = inject(CompetitionService);

    stats = signal<DashboardStats | null>(null);
    competitions = signal<Competition[]>([]);

    upcoming = computed(() => this.competitions().filter(c => c.statut === 'A_VENIR').slice(0, 4));
    inProgress = computed(() => this.competitions().filter(c => c.statut === 'EN_COURS'));

    ngOnInit(): void {
        this.dashboardService.getStats().subscribe({
            next: (data) => this.stats.set(data),
            error: (err) => console.error('Failed to load dashboard stats', err)
        });
        this.competitionService.getAll(0, 50).subscribe({
            next: (page) => this.competitions.set(page.data ?? []),
            error: () => {}
        });
    }
}
