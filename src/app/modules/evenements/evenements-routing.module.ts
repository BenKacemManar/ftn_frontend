import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvenementsListComponent } from './components/evenements-list/evenements-list.component';

const routes: Routes = [
  { path: '', component: EvenementsListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvenementsRoutingModule {}
