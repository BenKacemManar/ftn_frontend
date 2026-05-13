import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-competitions-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, CardModule],
    template: `
        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Competitions & Events</h2>
            <p-button label="New Competition" icon="pi pi-plus" />
        </div>
        <p-card>
            <p-table [value]="[]" [paginator]="true" [rows]="10" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Pool</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center p-4">No competitions found</td></tr>
                </ng-template>
            </p-table>
        </p-card>
    `
})
export class CompetitionsList {}
