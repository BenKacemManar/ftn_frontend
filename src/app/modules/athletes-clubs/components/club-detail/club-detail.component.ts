import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../../services/club.service';

@Component({
  selector: 'app-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.scss']
})
export class ClubDetailComponent implements OnInit {
  club: any = null;
  members: any[] = [];
  athletes: any[] = [];
  loading = false;
  activeTab: 'members' | 'athletes' = 'athletes';

  constructor(private route: ActivatedRoute, private router: Router, private clubService: ClubService) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.clubService.getById(id).subscribe({
      next: c => { this.club = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.clubService.getAthletes(id).subscribe({
      next: a => { this.athletes = Array.isArray(a) ? a : []; },
      error: () => {}
    });
    this.clubService.getMembers(id).subscribe({
      next: m => { this.members = Array.isArray(m) ? m : []; },
      error: () => {}
    });
  }

  getInitials(athlete: any): string {
    return `${(athlete.prenom || '')[0] ?? ''}${(athlete.nom || '')[0] ?? ''}`.toUpperCase();
  }

  goToAthlete(id: number): void {
    this.router.navigate(['/athletes', id]);
  }
}
