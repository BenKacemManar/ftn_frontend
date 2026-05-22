import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClubService } from '../../services/club.service';

@Component({
  selector: 'app-clubs-list',
  templateUrl: './clubs-list.component.html',
  styleUrls: ['./clubs-list.component.scss']
})
export class ClubsListComponent implements OnInit {
  clubs: any[] = [];
  total = 0;
  loading = false;
  search = '';

  constructor(private clubService: ClubService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: 0, size: 50 };
    if (this.search) params.search = this.search;
    this.clubService.getAll(params).subscribe({
      next: (r: any) => {
        const content = r?.content ?? r?.data ?? [];
        this.clubs = content;
        this.total = r?.totalElements ?? r?.total ?? content.length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/athletes/clubs', id]);
  }

  getColorForClub(index: number): string {
    const colors = ['#0057FF', '#00C48C', '#7C3AED', '#F59E0B', '#FF2D46', '#00C8F0'];
    return colors[index % colors.length];
  }
}
