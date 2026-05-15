import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul>`
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Main',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Sports Management',
                items: [
                    { label: 'Competitions', icon: 'pi pi-fw pi-calendar', routerLink: ['/competitions'] },
                    { label: 'Results & Rankings', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/results'] }
                ]
            },
            {
                label: 'Structure',
                items: [
                    { label: 'Clubs', icon: 'pi pi-fw pi-building', routerLink: ['/clubs'] },
                    { label: 'Swimming Pools', icon: 'pi pi-fw pi-map-marker', routerLink: ['/pools'] }
                ]
            },
            {
                label: 'Community',
                items: [
                    { label: 'Forum', icon: 'pi pi-fw pi-comments', routerLink: ['/forum'] }
                ]
            }
        ];
    }
}
