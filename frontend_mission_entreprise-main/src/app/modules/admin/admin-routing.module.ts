import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ScrapingComponent } from './components/scraping/scraping.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'scraping', component: ScrapingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
