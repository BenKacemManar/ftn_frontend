import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ReservationsRoutingModule } from './reservations-routing.module';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';

@NgModule({
  declarations: [ReservationListComponent, ReservationFormComponent],
  imports: [SharedModule, ReservationsRoutingModule],
})
export class ReservationsModule {}
