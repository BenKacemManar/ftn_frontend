import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-results-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, CardModule, SelectModule],
    template: `
        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Results & Rankings</h2>
        </div>
        <p-card>
            <p-table [value]="[]" [paginator]="true" [rows]="10" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Athlete</th>
                        <th>Competition</th>
                        <th>Event</th>
                        <th>Time</th>
                        <th>Rank</th>
                        <th>Status</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center p-4">No results found</td></tr>
                </ng-template>
            </p-table>
        </p-card>
    `
})
export class ResultsList {}
