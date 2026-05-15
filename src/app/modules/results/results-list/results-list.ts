import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ResultService } from '../../../core/services/result.service';
import { Result, ResultStatut } from '../../../core/models/result.model';

@Component({
    selector: 'app-results-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, CardModule, TagModule, SelectModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Results & Rankings</h2>
        </div>

        <!-- Filter by competition -->
        <div class="mb-4 flex items-center gap-3">
            <p-select
                [(ngModel)]="selectedCompetition"
                [options]="competitionOptions()"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by competition"
                [showClear]="true"
                class="min-w-64"
                (onChange)="onCompetitionFilter()" />
            <span class="text-color-secondary text-sm">{{ filtered().length }} results</span>
        </div>

        <p-card>
            <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="15"
                     styleClass="p-datatable-gridlines" [sortField]="'rang'" [sortOrder]="1">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="rang" style="width: 80px;">Rank <p-sortIcon field="rang" /></th>
                        <th pSortableColumn="athlete_nom">Athlete <p-sortIcon field="athlete_nom" /></th>
                        <th>Competition</th>
                        <th pSortableColumn="epreuve">Event <p-sortIcon field="epreuve" /></th>
                        <th pSortableColumn="temps">Time <p-sortIcon field="temps" /></th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-result>
                    <tr>
                        <td class="text-center">
                            @if (result.rang === 1) {
                                <span class="text-xl">🥇</span>
                            } @else if (result.rang === 2) {
                                <span class="text-xl">🥈</span>
                            } @else if (result.rang === 3) {
                                <span class="text-xl">🥉</span>
                            } @else if (result.rang) {
                                <span class="font-bold text-color-secondary">{{ result.rang }}</span>
                            } @else {
                                <span class="text-color-secondary">—</span>
                            }
                        </td>
                        <td class="font-medium">{{ result.athlete_nom }}</td>
                        <td class="text-sm text-color-secondary">{{ result.competition_nom }}</td>
                        <td>
                            <span class="px-2 py-1 rounded text-xs font-medium" style="background: var(--p-primary-100); color: var(--p-primary-700);">
                                {{ result.epreuve }}
                            </span>
                        </td>
                        <td class="font-mono font-semibold">{{ result.temps }}</td>
                        <td>
                            <p-tag [value]="getStatutLabel(result.statut)" [severity]="getStatutSeverity(result.statut)" />
                        </td>
                        <td>
                            @if (result.statut === 'EN_ATTENTE') {
                                <p-button icon="pi pi-check" [rounded]="true" [text]="true" severity="success" pTooltip="Validate" (onClick)="valider(result)" />
                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" pTooltip="Reject" (onClick)="rejeter(result)" />
                            }
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Delete" (onClick)="deleteResult(result)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center p-4">No results found</td></tr>
                </ng-template>
            </p-table>
        </p-card>
    `
})
export class ResultsList implements OnInit {
    private resultService = inject(ResultService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    results = signal<Result[]>([]);
    loading = signal(false);
    selectedCompetition: string | null = null;

    competitionOptions = computed(() => {
        const names = [...new Set(this.results().map(r => r.competition_nom).filter(Boolean))];
        return names.map(n => ({ label: n, value: n }));
    });

    filtered = computed(() => {
        if (!this.selectedCompetition) return this.results();
        return this.results().filter(r => r.competition_nom === this.selectedCompetition);
    });

    onCompetitionFilter(): void {}

    getStatutLabel(statut: ResultStatut): string {
        const map: Record<ResultStatut, string> = { EN_ATTENTE: 'Pending', VALIDE: 'Validated', REJETE: 'Rejected' };
        return map[statut] ?? statut;
    }

    getStatutSeverity(statut: ResultStatut): 'warn' | 'success' | 'danger' {
        const map: Record<ResultStatut, 'warn' | 'success' | 'danger'> = { EN_ATTENTE: 'warn', VALIDE: 'success', REJETE: 'danger' };
        return map[statut];
    }

    ngOnInit(): void {
        this.loadResults();
    }

    loadResults(): void {
        this.loading.set(true);
        this.resultService.getAll(0, 200).subscribe({
            next: (page) => { this.results.set(page.data ?? []); this.loading.set(false); },
            error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load results' }); }
        });
    }

    valider(result: Result): void {
        this.resultService.valider(result.id).subscribe({
            next: () => { this.loadResults(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Result validated' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to validate result' })
        });
    }

    rejeter(result: Result): void {
        this.resultService.rejeter(result.id).subscribe({
            next: () => { this.loadResults(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Result rejected' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject result' })
        });
    }

    deleteResult(result: Result): void {
        this.confirmationService.confirm({
            message: 'Delete this result?',
            accept: () => {
                this.resultService.delete(result.id).subscribe({
                    next: () => { this.loadResults(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Result deleted' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete result' })
                });
            }
        });
    }
}
