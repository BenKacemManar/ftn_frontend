import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClubService } from '../../../core/services/club.service';
import { AthleteService } from '../../../core/services/athlete.service';
import { Club } from '../../../core/models/club.model';
import { Athlete, Categorie, CreateAthlete, Sexe } from '../../../core/models/athlete.model';

@Component({
    selector: 'app-club-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        ButtonModule, CardModule, TableModule, TagModule,
        DialogModule, InputTextModule, SelectModule,
        ConfirmDialogModule, ToastModule, TooltipModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <!-- Club Header -->
        <div class="rounded-xl mb-4 overflow-hidden" style="background: linear-gradient(135deg, var(--p-primary-600), var(--p-primary-800)); color: white;">
            <div class="p-6 flex items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                    <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true"
                              styleClass="text-white hover:bg-white/20"
                              (onClick)="back()" />
                    <div class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                         style="background: rgba(255,255,255,0.2);">
                        <i class="pi pi-building text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold m-0">{{ club()?.nom || 'Loading…' }}</h2>
                        <div class="flex items-center gap-4 mt-2 text-sm opacity-90">
                            @if (club()?.ville) {
                                <span><i class="pi pi-map-marker mr-1"></i>{{ club()!.ville }}@if (club()?.region) {, {{ club()!.region }}}</span>
                            }
                            @if (club()?.president_nom) {
                                <span><i class="pi pi-user mr-1"></i>{{ club()!.president_nom }}</span>
                            }
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-center">
                        <div class="text-3xl font-bold">{{ athletes().length }}</div>
                        <div class="text-xs opacity-80">Athletes</div>
                    </div>
                    <p-button label="Add Athlete" icon="pi pi-plus"
                              styleClass="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                              (onClick)="openNew()" />
                </div>
            </div>
        </div>

        <!-- Athletes Table -->
        <p-card>
            <p-table [value]="athletes()" [loading]="loading()" [paginator]="true" [rows]="10"
                     styleClass="p-datatable-gridlines" sortField="nom">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Name <p-sortIcon field="nom" /></th>
                        <th>Date of Birth</th>
                        <th pSortableColumn="categorie">Category <p-sortIcon field="categorie" /></th>
                        <th>Gender</th>
                        <th>Nationality</th>
                        <th style="width: 9rem">Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-athlete>
                    <tr class="cursor-pointer hover:bg-surface-hover transition-colors"
                        (click)="viewFiche(athlete)">
                        <td class="font-medium">{{ athlete.nom }} {{ athlete.prenom }}</td>
                        <td>{{ athlete.date_naissance | date:'dd/MM/yyyy' }}</td>
                        <td>
                            <span class="px-2 py-0.5 rounded text-xs font-medium"
                                  [style]="getCategorieStyle(athlete.categorie)">
                                {{ athlete.categorie }}
                            </span>
                        </td>
                        <td>
                            @if (athlete.sexe === 'MASCULIN') {
                                <span class="text-blue-500"><i class="pi pi-user mr-1"></i>M</span>
                            } @else if (athlete.sexe === 'FEMININ') {
                                <span class="text-pink-500"><i class="pi pi-user mr-1"></i>F</span>
                            } @else {
                                <span class="text-color-secondary">—</span>
                            }
                        </td>
                        <td>{{ athlete.nationalite || '—' }}</td>
                        <td (click)="$event.stopPropagation()">
                            <p-button icon="pi pi-id-card" [rounded]="true" [text]="true"
                                      pTooltip="View Fiche" (onClick)="viewFiche(athlete)" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
                                      pTooltip="Edit" (onClick)="editAthlete(athlete)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true"
                                      severity="danger" pTooltip="Delete" (onClick)="deleteAthlete(athlete)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center p-8">
                            <div class="flex flex-col items-center gap-3 text-color-secondary">
                                <i class="pi pi-users text-5xl opacity-30"></i>
                                <span>No athletes registered in this club yet.</span>
                                <p-button label="Add First Athlete" icon="pi pi-plus" (onClick)="openNew()" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <!-- Add / Edit dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Athlete' : 'Add Athlete'"
                  [modal]="true" [style]="{width: '480px'}">
            <div class="flex flex-col gap-4 mt-2">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Last Name *</label>
                        <input pInputText [(ngModel)]="form.nom" class="w-full" placeholder="Nom" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">First Name *</label>
                        <input pInputText [(ngModel)]="form.prenom" class="w-full" placeholder="Prénom" />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Date of Birth</label>
                        <input pInputText [(ngModel)]="form.date_naissance" type="date" class="w-full" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Nationality</label>
                        <input pInputText [(ngModel)]="form.nationalite" class="w-full" placeholder="e.g. Tunisian" />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Category</label>
                        <p-select [(ngModel)]="form.categorie" [options]="categoryOptions"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Select category" styleClass="w-full" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Gender</label>
                        <p-select [(ngModel)]="form.sexe" [options]="genderOptions"
                                  optionLabel="label" optionValue="value"
                                  placeholder="Select gender" styleClass="w-full" />
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Save" (onClick)="saveAthlete()" [loading]="saving()" />
            </ng-template>
        </p-dialog>
    `
})
export class ClubDetail implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private clubService = inject(ClubService);
    private athleteService = inject(AthleteService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    club = signal<Club | null>(null);
    athletes = signal<Athlete[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    selectedId: number | null = null;
    clubId!: number;

    form: CreateAthlete = { nom: '', prenom: '' };

    categoryOptions = [
        { label: 'Poussin', value: 'POUSSIN' as Categorie },
        { label: 'Benjamin', value: 'BENJAMIN' as Categorie },
        { label: 'Minime', value: 'MINIME' as Categorie },
        { label: 'Cadet', value: 'CADET' as Categorie },
        { label: 'Junior', value: 'JUNIOR' as Categorie },
        { label: 'Senior', value: 'SENIOR' as Categorie }
    ];

    genderOptions = [
        { label: 'Masculin', value: 'MASCULIN' as Sexe },
        { label: 'Féminin', value: 'FEMININ' as Sexe }
    ];

    getCategorieStyle(cat: string): string {
        const colors: Record<string, string> = {
            POUSSIN: 'background:#fef9c3;color:#713f12',
            BENJAMIN: 'background:#dbeafe;color:#1e3a8a',
            MINIME: 'background:#dcfce7;color:#14532d',
            CADET: 'background:#ede9fe;color:#3b0764',
            JUNIOR: 'background:#ffedd5;color:#7c2d12',
            SENIOR: 'background:#fee2e2;color:#7f1d1d'
        };
        return colors[cat] ?? 'background:var(--surface-ground);color:var(--text-color)';
    }

    ngOnInit(): void {
        this.clubId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadClub();
        this.loadAthletes();
    }

    loadClub(): void {
        this.clubService.getById(this.clubId).subscribe({
            next: (res) => this.club.set(res.data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Club not found' })
        });
    }

    loadAthletes(): void {
        this.loading.set(true);
        this.athleteService.getByClub(this.clubId).subscribe({
            next: (list) => { this.athletes.set(list); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load athletes' }); }
        });
    }

    back(): void {
        this.router.navigate(['/clubs']);
    }

    viewFiche(athlete: Athlete): void {
        this.router.navigate(['/clubs', this.clubId, 'athletes', athlete.id]);
    }

    openNew(): void {
        this.form = { nom: '', prenom: '', club_id: this.clubId };
        this.editMode = false;
        this.selectedId = null;
        this.dialogVisible = true;
    }

    editAthlete(athlete: Athlete): void {
        this.form = {
            nom: athlete.nom,
            prenom: athlete.prenom,
            club_id: this.clubId,
            date_naissance: athlete.date_naissance ?? undefined,
            nationalite: athlete.nationalite ?? undefined,
            categorie: athlete.categorie ?? undefined,
            sexe: athlete.sexe ?? undefined
        };
        this.editMode = true;
        this.selectedId = athlete.id;
        this.dialogVisible = true;
    }

    saveAthlete(): void {
        if (!this.form.nom?.trim() || !this.form.prenom?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Name and first name are required' });
            return;
        }
        this.saving.set(true);
        const op = this.editMode && this.selectedId
            ? this.athleteService.update(this.selectedId, this.form)
            : this.athleteService.create({ ...this.form, club_id: this.clubId });
        op.subscribe({
            next: () => {
                this.saving.set(false);
                this.dialogVisible = false;
                this.loadAthletes();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Athlete saved' });
            },
            error: () => { this.saving.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save athlete' }); }
        });
    }

    deleteAthlete(athlete: Athlete): void {
        this.confirmationService.confirm({
            message: `Delete athlete ${athlete.nom} ${athlete.prenom}?`,
            accept: () => {
                this.athleteService.delete(athlete.id).subscribe({
                    next: () => { this.loadAthletes(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Athlete deleted' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete athlete' })
                });
            }
        });
    }
}
