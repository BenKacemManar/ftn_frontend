import { Routes } from '@angular/router';
import { ClubsList } from './clubs-list/clubs-list';
import { ClubDetail } from './club-detail/club-detail';
import { AthleteDetail } from './athlete-detail/athlete-detail';

export default [
    { path: '', component: ClubsList },
    { path: ':id', component: ClubDetail },
    { path: ':id/athletes/:athleteId', component: AthleteDetail }
] as Routes;
