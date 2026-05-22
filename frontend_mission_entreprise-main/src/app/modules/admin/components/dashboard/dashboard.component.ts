import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

interface StatCard { icon: string; label: string; value: number | string; color: string; bg: string; link: string; }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [
    { icon: '🏊', label: 'Athlètes',     value: '—', color: '#0057FF', bg: '#EEF4FF', link: '/athletes' },
    { icon: '🏆', label: 'Compétitions', value: '—', color: '#00C48C', bg: '#ECFDF5', link: '/competitions' },
    { icon: '🏛️', label: 'Clubs',        value: '—', color: '#7C3AED', bg: '#F3EEFF', link: '/athletes/clubs' },
    { icon: '🏊‍♂️', label: 'Piscines',   value: '—', color: '#F59E0B', bg: '#FFFBEB', link: '/pools' },
  ];
  quickLinks = [
    { icon: '➕', label: 'Nouvelle compétition', link: '/competitions/new', color: '#0057FF' },
    { icon: '🔄', label: 'Scraping données',      link: '/admin/scraping',   color: '#00C48C' },
    { icon: '📰', label: 'Publier actualité',     link: '/news',             color: '#7C3AED' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/dashboard/stats').subscribe({
      next: (r: any) => {
        const d = r?.data ?? r;
        if (d?.nbAthletes    != null) this.stats[0].value = d.nbAthletes;
        if (d?.nbCompetitions != null) this.stats[1].value = d.nbCompetitions;
        if (d?.nbClubs       != null) this.stats[2].value = d.nbClubs;
        if (d?.nbPiscines    != null) this.stats[3].value = d.nbPiscines;
      },
      error: () => {}
    });
  }
}
