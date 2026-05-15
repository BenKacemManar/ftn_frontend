import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AthleteService } from '../../../core/services/athlete.service';
import { Athlete, Licence, StatutLicence } from '../../../core/models/athlete.model';

@Component({
    selector: 'app-athlete-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TableModule, TagModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />

        @if (loading()) {
            <div class="flex justify-center items-center py-20">
                <i class="pi pi-spin pi-spinner text-4xl" style="color: var(--p-primary-color);"></i>
            </div>
        } @else if (athlete()) {
            <!-- Athlete Header -->
            <div class="rounded-xl mb-4 overflow-hidden" style="background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white;">
                <div class="p-6 flex items-start gap-4">
                    <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true"
                              styleClass="text-white hover:bg-white/20"
                              (onClick)="back()" />
                    <div class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                         style="background: rgba(255,255,255,0.2);">
                        {{ initials() }}
                    </div>
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold m-0">{{ athlete()!.nom }} {{ athlete()!.prenom }}</h2>
                        <div class="flex items-center gap-4 mt-2 text-sm opacity-90">
                            @if (athlete()!.club_nom) {
                                <span><i class="pi pi-building mr-1"></i>{{ athlete()!.club_nom }}</span>
                            }
                            @if (athlete()!.categorie) {
                                <span><i class="pi pi-tag mr-1"></i>{{ athlete()!.categorie }}</span>
                            }
                            @if (athlete()!.nationalite) {
                                <span><i class="pi pi-flag mr-1"></i>{{ athlete()!.nationalite }}</span>
                            }
                        </div>
                    </div>
                    <div class="text-center text-sm opacity-80">
                        @if (athlete()!.sexe === 'MASCULIN') {
                            <i class="pi pi-user text-2xl block mb-1"></i>
                            <span>Masculin</span>
                        } @else if (athlete()!.sexe === 'FEMININ') {
                            <i class="pi pi-user text-2xl block mb-1"></i>
                            <span>Féminin</span>
                        }
                    </div>
                </div>
            </div>

            <!-- Personal Information Card -->
            <p-card styleClass="mb-4">
                <ng-template pTemplate="header">
                    <div class="px-5 pt-4 pb-2 font-semibold text-base flex items-center gap-2">
                        <i class="pi pi-id-card" style="color: var(--p-primary-color);"></i>
                        Personal Information
                    </div>
                </ng-template>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5 px-1">
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Last Name</span>
                        <span class="font-semibold">{{ athlete()!.nom }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">First Name</span>
                        <span class="font-semibold">{{ athlete()!.prenom }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Date of Birth</span>
                        <span>{{ (athlete()!.date_naissance | date:'dd MMMM yyyy') || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Nationality</span>
                        <span>{{ athlete()!.nationalite || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Category</span>
                        <span>{{ athlete()!.categorie || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Gender</span>
                        <span>{{ athlete()!.sexe || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Club</span>
                        <span>{{ athlete()!.club_nom || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-color-secondary uppercase tracking-wide">Registered On</span>
                        <span>{{ (athlete()!.created_at | date:'dd/MM/yyyy') || '—' }}</span>
                    </div>
                </div>
            </p-card>

            <!-- Licences Card -->
            <p-card>
                <ng-template pTemplate="header">
                    <div class="px-5 pt-4 pb-2 font-semibold text-base flex items-center gap-2">
                        <i class="pi pi-verified" style="color: var(--p-primary-color);"></i>
                        Licences ({{ licences().length }})
                    </div>
                </ng-template>
                <p-table [value]="licences()" [loading]="loadingLicences()" styleClass="p-datatable-gridlines">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Number</th>
                            <th>Type</th>
                            <th>Start Date</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-lic>
                        <tr>
                            <td class="font-mono font-medium">{{ lic.numero }}</td>
                            <td>{{ lic.type }}</td>
                            <td>{{ lic.date_debut | date:'dd/MM/yyyy' }}</td>
                            <td>{{ lic.date_expiration | date:'dd/MM/yyyy' }}</td>
                            <td>
                                <p-tag [value]="getLicenceLabel(lic.statut)"
                                       [severity]="getLicenceSeverity(lic.statut)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5" class="text-center p-8 text-color-secondary">
                                No licences found for this athlete.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        }
    `
})
export class AthleteDetail implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private athleteService = inject(AthleteService);
    private messageService = inject(MessageService);

    athlete = signal<Athlete | null>(null);
    licences = signal<Licence[]>([]);
    loading = signal(true);
    loadingLicences = signal(false);
    clubId!: number;

    initials(): string {
        const a = this.athlete();
        if (!a) return '?';
        return `${(a.nom?.[0] ?? '').toUpperCase()}${(a.prenom?.[0] ?? '').toUpperCase()}`;
    }

    ngOnInit(): void {
        this.clubId = Number(this.route.snapshot.paramMap.get('id'));
        const athleteId = Number(this.route.snapshot.paramMap.get('athleteId'));
        this.loadAthlete(athleteId);
        this.loadLicences(athleteId);
    }

    loadAthlete(id: number): void {
        this.athleteService.getById(id).subscribe({
            next: (res) => { this.athlete.set(res.data); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Athlete not found' }); }
        });
    }

    loadLicences(id: number): void {
        this.loadingLicences.set(true);
        this.athleteService.getLicences(id).subscribe({
            next: (list) => { this.licences.set(list); this.loadingLicences.set(false); },
            error: () => this.loadingLicences.set(false)
        });
    }

    back(): void {
        this.router.navigate(['/clubs', this.clubId]);
    }

    getLicenceLabel(statut: StatutLicence): string {
        const map: Record<StatutLicence, string> = { VALIDEE: 'Valid', EN_ATTENTE: 'Pending', REJETEE: 'Rejected', EXPIREE: 'Expired' };
        return map[statut] ?? statut;
    }

    getLicenceSeverity(statut: StatutLicence): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<StatutLicence, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            VALIDEE: 'success', EN_ATTENTE: 'warn', REJETEE: 'danger', EXPIREE: 'secondary'
        };
        return map[statut] ?? 'info';
    }
}
