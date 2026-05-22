import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AthletesClubsRoutingModule } from './athletes-clubs-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { AthletesListComponent } from './components/athletes-list/athletes-list.component';
import { ClubsListComponent } from './components/clubs-list/clubs-list.component';
import { ClubDetailComponent } from './components/club-detail/club-detail.component';
import { AthleteDetailComponent } from './components/athlete-detail/athlete-detail.component';

@NgModule({
  declarations: [
    AthletesListComponent,
    ClubsListComponent,
    ClubDetailComponent,
    AthleteDetailComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AthletesClubsRoutingModule
  ]
})
export class AthletesClubsModule {}
