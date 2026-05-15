import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PoolService } from '../../../core/services/pool.service';
import { CreatePool, Pool, PoolType } from '../../../core/models/pool.model';

@Component({
    selector: 'app-pools-list',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, TagModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Swimming Pools</h2>
            <p-button label="New Pool" icon="pi pi-plus" (onClick)="openNew()" />
        </div>

        @if (loading()) {
            <div class="text-center py-12"><i class="pi pi-spin pi-spinner text-4xl text-primary"></i></div>
        } @else if (pools().length === 0) {
            <div class="text-center py-12 text-color-secondary">No pools found.</div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (pool of pools(); track pool.id) {
                    <div class="rounded-xl border overflow-hidden" style="background: var(--surface-card); border-color: var(--surface-border);">
                        <!-- Card header with type badge -->
                        <div class="px-5 py-4 flex items-start justify-between" style="border-bottom: 1px solid var(--surface-border);">
                            <div>
                                <h3 class="text-base font-semibold m-0">{{ pool.nom }}</h3>
                                <div class="text-sm text-color-secondary mt-1">
                                    <i class="pi pi-map-marker mr-1"></i>{{ pool.ville }}
                                </div>
                            </div>
                            <div class="flex flex-col items-end gap-1">
                                <p-tag [value]="pool.type" [severity]="pool.type === 'INDOOR' ? 'info' : 'success'" />
                                <p-tag [value]="pool.actif ? 'Active' : 'Inactive'" [severity]="pool.actif ? 'success' : 'danger'" />
                            </div>
                        </div>

                        <!-- Pool specs -->
                        <div class="px-5 py-4 grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div class="text-2xl font-bold" style="color: var(--p-primary-color);">{{ pool.longueur }}m</div>
                                <div class="text-xs text-color-secondary">Length</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold" style="color: var(--p-primary-color);">{{ pool.nb_couloirs }}</div>
                                <div class="text-xs text-color-secondary">Lanes</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold" style="color: var(--p-primary-color);">
                                    <i class="pi pi-waves text-xl"></i>
                                </div>
                                <div class="text-xs text-color-secondary">Pool</div>
                            </div>
                        </div>

                        @if (pool.adresse) {
                            <div class="px-5 pb-2 text-xs text-color-secondary">
                                <i class="pi pi-building mr-1"></i>{{ pool.adresse }}
                            </div>
                        }

                        <!-- Actions -->
                        <div class="px-5 py-3 flex gap-2 justify-end" style="border-top: 1px solid var(--surface-border);">
                            <p-button icon="pi pi-pencil" label="Edit" [text]="true" [rounded]="true" size="small" (onClick)="editPool(pool)" />
                            <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="deletePool(pool)" />
                        </div>
                    </div>
                }
            </div>
        }

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Pool' : 'New Pool'" [modal]="true" [style]="{width: '450px'}">
            <div class="flex flex-col gap-4 mt-4">
                <div>
                    <label class="block mb-1 font-medium">Name *</label>
                    <input pInputText [(ngModel)]="form.nom" class="w-full" placeholder="Pool name" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">City</label>
                    <input pInputText [(ngModel)]="form.ville" class="w-full" placeholder="City" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Address</label>
                    <input pInputText [(ngModel)]="form.adresse" class="w-full" placeholder="Address" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block mb-1 font-medium">Length (m)</label>
                        <p-inputnumber [(ngModel)]="form.longueur" [min]="25" [max]="50" class="w-full" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Lanes</label>
                        <p-inputnumber [(ngModel)]="form.nb_couloirs" [min]="1" [max]="10" class="w-full" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Type</label>
                    <p-select [(ngModel)]="form.type" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select type" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Save" (onClick)="savePool()" [loading]="saving()" />
            </ng-template>
        </p-dialog>
    `
})
export class PoolsList implements OnInit {
    private poolService = inject(PoolService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    pools = signal<Pool[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    selectedId: number | null = null;
    form: CreatePool = { nom: '' };

    typeOptions = [
        { label: 'Indoor', value: 'INDOOR' as PoolType },
        { label: 'Outdoor', value: 'OUTDOOR' as PoolType }
    ];

    ngOnInit(): void {
        this.loadPools();
    }

    loadPools(): void {
        this.loading.set(true);
        this.poolService.getAll().subscribe({
            next: (page) => { this.pools.set(page.data ?? []); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pools' }); }
        });
    }

    openNew(): void {
        this.form = { nom: '' };
        this.editMode = false;
        this.selectedId = null;
        this.dialogVisible = true;
    }

    editPool(pool: Pool): void {
        this.form = { nom: pool.nom, ville: pool.ville, adresse: pool.adresse, longueur: pool.longueur, nb_couloirs: pool.nb_couloirs, type: pool.type, actif: pool.actif };
        this.editMode = true;
        this.selectedId = pool.id;
        this.dialogVisible = true;
    }

    savePool(): void {
        if (!this.form.nom) { this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Pool name is required' }); return; }
        this.saving.set(true);
        const op = this.editMode && this.selectedId
            ? this.poolService.update(this.selectedId, this.form)
            : this.poolService.create(this.form);
        op.subscribe({
            next: () => { this.saving.set(false); this.dialogVisible = false; this.loadPools(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Pool saved' }); },
            error: () => { this.saving.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save pool' }); }
        });
    }

    deletePool(pool: Pool): void {
        this.confirmationService.confirm({
            message: `Delete pool "${pool.nom}"?`,
            accept: () => {
                this.poolService.delete(pool.id).subscribe({
                    next: () => { this.loadPools(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Pool deleted' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete pool' })
                });
            }
        });
    }
}
