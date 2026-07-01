import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';
const routes: Routes = [
  { path: '', component: ReservationListComponent, canActivate: [AuthGuard], data: { roles: ['COACH', 'ATHLETE'] } },
  { path: 'new', component: ReservationFormComponent, canActivate: [AuthGuard], data: { roles: ['COACH', 'ATHLETE'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule {}