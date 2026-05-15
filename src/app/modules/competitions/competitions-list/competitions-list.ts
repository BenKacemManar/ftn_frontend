import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompetitionService } from '../../../core/services/competition.service';
import { Competition, CompetitionStatut, CompetitionType, CreateCompetition } from '../../../core/models/competition.model';

type FilterTab = 'ALL' | CompetitionStatut;

@Component({
    selector: 'app-competitions-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, CardModule, DialogModule, InputTextModule, SelectModule, DatePickerModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Competitions & Events</h2>
            <p-button label="New Competition" icon="pi pi-plus" (onClick)="openNew()" />
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2 mb-4 flex-wrap">
            @for (tab of filterTabs; track tab.value) {
                <button
                    class="px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer"
                    [style]="activeFilter() === tab.value
                        ? 'background: var(--p-primary-color); color: white; border-color: var(--p-primary-color);'
                        : 'background: var(--surface-card); color: var(--text-color); border-color: var(--surface-border);'"
                    (click)="setFilter(tab.value)">
                    {{ tab.label }}
                    <span class="ml-1 text-xs opacity-70">({{ countByStatus(tab.value) }})</span>
                </button>
            }
        </div>

        <p-card>
            <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Pool</th>
                        <th>Participants</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-comp>
                    <tr>
                        <td class="font-medium">{{ comp.nom }}</td>
                        <td>
                            <p-tag [value]="comp.type" [severity]="getTypeSeverity(comp.type)" />
                        </td>
                        <td>{{ comp.date_debut | date:'dd/MM/yyyy' }}</td>
                        <td>{{ comp.date_fin | date:'dd/MM/yyyy' }}</td>
                        <td>{{ comp.pool_nom }}</td>
                        <td class="text-center">{{ comp.nb_participants ?? '—' }}</td>
                        <td>
                            <p-tag [value]="getStatutLabel(comp.statut)" [severity]="getStatutSeverity(comp.statut)" />
                        </td>
                        <td>
                            @if (comp.statut === 'A_VENIR') {
                                <p-button icon="pi pi-play" [rounded]="true" [text]="true" severity="success" pTooltip="Start" (onClick)="demarrer(comp)" />
                            }
                            @if (comp.statut === 'EN_COURS') {
                                <p-button icon="pi pi-stop-circle" [rounded]="true" [text]="true" severity="warn" pTooltip="End" (onClick)="terminer(comp)" />
                            }
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" pTooltip="Edit" (onClick)="editCompetition(comp)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Delete" (onClick)="deleteCompetition(comp)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8" class="text-center p-4">No competitions found</td></tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Competition' : 'New Competition'" [modal]="true" [style]="{width: '500px'}">
            <div class="flex flex-col gap-4 mt-4">
                <div>
                    <label class="block mb-1 font-medium">Name *</label>
                    <input pInputText [(ngModel)]="form.nom" class="w-full" placeholder="Competition name" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Type</label>
                    <p-select [(ngModel)]="form.type" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select type" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block mb-1 font-medium">Start Date</label>
                        <p-datepicker [(ngModel)]="startDate" dateFormat="dd/mm/yy" [showIcon]="true" class="w-full" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">End Date</label>
                        <p-datepicker [(ngModel)]="endDate" dateFormat="dd/mm/yy" [showIcon]="true" class="w-full" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Description</label>
                    <input pInputText [(ngModel)]="form.description" class="w-full" placeholder="Description" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Save" (onClick)="saveCompetition()" [loading]="saving()" />
            </ng-template>
        </p-dialog>
    `
})
export class CompetitionsList implements OnInit {
    private competitionService = inject(CompetitionService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    competitions = signal<Competition[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    selectedId: number | null = null;
    form: CreateCompetition = { nom: '' };
    startDate: Date | null = null;
    endDate: Date | null = null;
    activeFilter = signal<FilterTab>('ALL');

    filterTabs: { label: string; value: FilterTab }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Upcoming', value: 'A_VENIR' },
        { label: 'In Progress', value: 'EN_COURS' },
        { label: 'Completed', value: 'TERMINE' },
        { label: 'Cancelled', value: 'ANNULE' }
    ];

    filtered = computed(() => {
        const f = this.activeFilter();
        return f === 'ALL' ? this.competitions() : this.competitions().filter(c => c.statut === f);
    });

    countByStatus(filter: FilterTab): number {
        return filter === 'ALL' ? this.competitions().length : this.competitions().filter(c => c.statut === filter).length;
    }

    setFilter(f: FilterTab): void {
        this.activeFilter.set(f);
    }

    typeOptions = [
        { label: 'National', value: 'NATIONAL' as CompetitionType },
        { label: 'Regional', value: 'REGIONAL' as CompetitionType },
        { label: 'International', value: 'INTERNATIONAL' as CompetitionType }
    ];

    getStatutLabel(statut: CompetitionStatut): string {
        const map = { A_VENIR: 'Upcoming', EN_COURS: 'In Progress', TERMINE: 'Completed', ANNULE: 'Cancelled' };
        return map[statut] ?? statut;
    }

    getStatutSeverity(statut: CompetitionStatut): 'info' | 'success' | 'secondary' | 'danger' {
        const map: Record<CompetitionStatut, 'info' | 'success' | 'secondary' | 'danger'> = { A_VENIR: 'info', EN_COURS: 'success', TERMINE: 'secondary', ANNULE: 'danger' };
        return map[statut];
    }

    getTypeSeverity(type: CompetitionType): 'info' | 'warn' | 'danger' {
        const map: Record<CompetitionType, 'info' | 'warn' | 'danger'> = { NATIONAL: 'info', REGIONAL: 'warn', INTERNATIONAL: 'danger' };
        return map[type];
    }

    ngOnInit(): void {
        this.loadCompetitions();
    }

    loadCompetitions(): void {
        this.loading.set(true);
        this.competitionService.getAll(0, 100).subscribe({
            next: (page) => { this.competitions.set(page.data ?? []); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load competitions' }); }
        });
    }

    openNew(): void {
        this.form = { nom: '' };
        this.startDate = null;
        this.endDate = null;
        this.editMode = false;
        this.selectedId = null;
        this.dialogVisible = true;
    }

    editCompetition(comp: Competition): void {
        this.form = { nom: comp.nom, type: comp.type, description: comp.description };
        this.startDate = comp.date_debut ? new Date(comp.date_debut) : null;
        this.endDate = comp.date_fin ? new Date(comp.date_fin) : null;
        this.editMode = true;
        this.selectedId = comp.id;
        this.dialogVisible = true;
    }

    saveCompetition(): void {
        if (!this.form.nom) { this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Competition name is required' }); return; }
        if (this.startDate) this.form.date_debut = this.startDate.toISOString().split('T')[0];
        if (this.endDate) this.form.date_fin = this.endDate.toISOString().split('T')[0];
        this.saving.set(true);
        const op = this.editMode && this.selectedId
            ? this.competitionService.update(this.selectedId, this.form)
            : this.competitionService.create(this.form);
        op.subscribe({
            next: () => { this.saving.set(false); this.dialogVisible = false; this.loadCompetitions(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Competition saved' }); },
            error: () => { this.saving.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save competition' }); }
        });
    }

    demarrer(comp: Competition): void {
        this.competitionService.demarrer(comp.id).subscribe({
            next: () => { this.loadCompetitions(); this.messageService.add({ severity: 'success', summary: 'Started', detail: `"${comp.nom}" is now in progress` }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start competition' })
        });
    }

    terminer(comp: Competition): void {
        this.confirmationService.confirm({
            message: `Mark "${comp.nom}" as completed?`,
            accept: () => {
                this.competitionService.terminer(comp.id).subscribe({
                    next: () => { this.loadCompetitions(); this.messageService.add({ severity: 'success', summary: 'Completed', detail: `"${comp.nom}" is now completed` }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to end competition' })
                });
            }
        });
    }

    deleteCompetition(comp: Competition): void {
        this.confirmationService.confirm({
            message: `Delete competition "${comp.nom}"?`,
            accept: () => {
                this.competitionService.delete(comp.id).subscribe({
                    next: () => { this.loadCompetitions(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Competition deleted' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete competition' })
                });
            }
        });
    }
}
