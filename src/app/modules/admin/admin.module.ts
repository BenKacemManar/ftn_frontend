import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ScrapingComponent } from './components/scraping/scraping.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ScrapingComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
