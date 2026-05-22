import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AthleteService } from '../../services/athlete.service';

@Component({
  selector: 'app-athlete-detail',
  templateUrl: './athlete-detail.component.html',
  styleUrls: ['./athlete-detail.component.scss']
})
export class AthleteDetailComponent implements OnInit {
  athlete: any = null;
  licences: any[] = [];
  loading = false;

  constructor(private route: ActivatedRoute, private athleteService: AthleteService) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.athleteService.getById(id).subscribe({
      next: a => { this.athlete = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.athleteService.getLicences(id).subscribe({
      next: l => { this.licences = Array.isArray(l) ? l : []; },
      error: () => {}
    });
  }

  getInitials(): string {
    if (!this.athlete) return '?';
    return `${(this.athlete.prenom || '')[0] ?? ''}${(this.athlete.nom || '')[0] ?? ''}`.toUpperCase();
  }
}
