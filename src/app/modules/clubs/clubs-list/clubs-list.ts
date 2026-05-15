import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ClubService } from '../../../core/services/club.service';
import { Club, CreateClub } from '../../../core/models/club.model';

@Component({
    selector: 'app-clubs-list',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, TagModule, DialogModule, InputTextModule, ConfirmDialogModule, ToastModule, TooltipModule, RouterModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Clubs Management</h2>
            <p-button label="New Club" icon="pi pi-plus" (onClick)="openNew()" />
        </div>

        @if (loading()) {
            <div class="text-center py-12"><i class="pi pi-spin pi-spinner text-4xl" style="color: var(--p-primary-color);"></i></div>
        } @else if (clubs().length === 0) {
            <div class="text-center py-12 text-color-secondary">No clubs found.</div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (club of clubs(); track club.id) {
                    <div class="rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md"
                         style="background: var(--surface-card); border-color: var(--surface-border);"
                         (click)="viewAthletes(club)">
                        <!-- Club color header -->
                        <div class="h-2" style="background: linear-gradient(90deg, var(--p-primary-500), var(--p-primary-300));"></div>

                        <div class="p-5">
                            <!-- Name & Status -->
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <h3 class="text-base font-semibold m-0 leading-tight">{{ club.nom }}</h3>
                                <p-tag [value]="club.actif ? 'Active' : 'Inactive'"
                                       [severity]="club.actif ? 'success' : 'danger'"
                                       class="flex-shrink-0" />
                            </div>

                            <!-- Info rows -->
                            <div class="flex flex-col gap-2 text-sm text-color-secondary">
                                @if (club.ville) {
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-map-marker w-4 text-center"></i>
                                        <span>{{ club.ville }}@if (club.region) {, {{ club.region }}}</span>
                                    </div>
                                }
                                @if (club.president_nom) {
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-user w-4 text-center"></i>
                                        <span>{{ club.president_nom }}</span>
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Card footer actions -->
                        <div class="px-4 py-3 flex items-center justify-between"
                             style="border-top: 1px solid var(--surface-border); background: var(--surface-ground);">
                            <span class="text-xs text-color-secondary">
                                <i class="pi pi-users mr-1"></i>View athletes
                            </span>
                            <div class="flex gap-1" (click)="$event.stopPropagation()">
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" size="small"
                                          pTooltip="Edit" (onClick)="editClub(club)" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" size="small"
                                          severity="danger" pTooltip="Delete" (onClick)="deleteClub(club)" />
                            </div>
                        </div>
                    </div>
                }
            </div>
        }

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Club' : 'New Club'" [modal]="true" [style]="{width: '450px'}">
            <div class="flex flex-col gap-4 mt-4">
                <div>
                    <label class="block mb-1 font-medium">Name *</label>
                    <input pInputText [(ngModel)]="form.nom" class="w-full" placeholder="Club name" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block mb-1 font-medium">City</label>
                        <input pInputText [(ngModel)]="form.ville" class="w-full" placeholder="City" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Region</label>
                        <input pInputText [(ngModel)]="form.region" class="w-full" placeholder="Region" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">President</label>
                    <input pInputText [(ngModel)]="form.president_nom" class="w-full" placeholder="President name" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Save" (onClick)="saveClub()" [loading]="saving()" />
            </ng-template>
        </p-dialog>
    `
})
export class ClubsList implements OnInit {
    private clubService = inject(ClubService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    clubs = signal<Club[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    selectedId: number | null = null;
    form: CreateClub = { nom: '' };

    ngOnInit(): void {
        this.loadClubs();
    }

    viewAthletes(club: Club): void {
        this.router.navigate(['/clubs', club.id]);
    }

    loadClubs(): void {
        this.loading.set(true);
        this.clubService.getAll().subscribe({
            next: (page) => { this.clubs.set(page.data); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load clubs' }); }
        });
    }

    openNew(): void {
        this.form = { nom: '' };
        this.editMode = false;
        this.selectedId = null;
        this.dialogVisible = true;
    }

    editClub(club: Club): void {
        this.form = { nom: club.nom, ville: club.ville, president_nom: club.president_nom, region: club.region, actif: club.actif };
        this.editMode = true;
        this.selectedId = club.id;
        this.dialogVisible = true;
    }

    saveClub(): void {
        if (!this.form.nom) { this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Club name is required' }); return; }
        this.saving.set(true);
        const op = this.editMode && this.selectedId
            ? this.clubService.update(this.selectedId, this.form)
            : this.clubService.create(this.form);
        op.subscribe({
            next: () => { this.saving.set(false); this.dialogVisible = false; this.loadClubs(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Club saved' }); },
            error: () => { this.saving.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save club' }); }
        });
    }

    deleteClub(club: Club): void {
        this.confirmationService.confirm({
            message: `Delete club "${club.nom}"?`,
            accept: () => {
                this.clubService.delete(club.id).subscribe({
                    next: () => { this.loadClubs(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Club deleted' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete club' })
                });
            }
        });
    }
}
