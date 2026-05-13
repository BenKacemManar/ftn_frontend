import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="ftn-page-header">
                    <h2 class="ftn-page-title">Dashboard</h2>
                    <span class="ftn-page-subtitle">Welcome to the FTN platform</span>
                </div>
            </div>

            <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="ftn-stat-card">
                    <div class="ftn-stat">
                        <i class="pi pi-users ftn-stat-icon"></i>
                        <div class="ftn-stat-info">
                            <span class="ftn-stat-value">0</span>
                            <span class="ftn-stat-label">Athletes</span>
                        </div>
                    </div>
                </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="ftn-stat-card">
                    <div class="ftn-stat">
                        <i class="pi pi-calendar ftn-stat-icon"></i>
                        <div class="ftn-stat-info">
                            <span class="ftn-stat-value">0</span>
                            <span class="ftn-stat-label">Competitions</span>
                        </div>
                    </div>
                </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="ftn-stat-card">
                    <div class="ftn-stat">
                        <i class="pi pi-building ftn-stat-icon"></i>
                        <div class="ftn-stat-info">
                            <span class="ftn-stat-value">0</span>
                            <span class="ftn-stat-label">Clubs</span>
                        </div>
                    </div>
                </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-3">
                <p-card styleClass="ftn-stat-card">
                    <div class="ftn-stat">
                        <i class="pi pi-map-marker ftn-stat-icon"></i>
                        <div class="ftn-stat-info">
                            <span class="ftn-stat-value">0</span>
                            <span class="ftn-stat-label">Swimming Pools</span>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class Dashboard {}
