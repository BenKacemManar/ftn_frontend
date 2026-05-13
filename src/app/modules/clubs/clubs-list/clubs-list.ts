import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-clubs-list',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TableModule, TagModule],
    template: `
        <div class="ftn-page-header">
            <h2 class="ftn-page-title">Clubs Management</h2>
            <p-button label="New Club" icon="pi pi-plus" />
        </div>
        <p-card>
            <p-table [value]="[]" [paginator]="true" [rows]="10" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>President</th>
                        <th>Members</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center p-4">No clubs found</td></tr>
                </ng-template>
            </p-table>
        </p-card>
    `
})
export class ClubsList {}
