import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EvenementsRoutingModule } from './evenements-routing.module';
import { EvenementsListComponent } from './components/evenements-list/evenements-list.component';

@NgModule({
  declarations: [EvenementsListComponent],
  imports: [SharedModule, EvenementsRoutingModule],
})
export class EvenementsModule {}
