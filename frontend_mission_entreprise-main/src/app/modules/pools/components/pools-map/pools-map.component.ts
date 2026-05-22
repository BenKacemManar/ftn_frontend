import { Component, OnInit } from '@angular/core';
import { PoolService } from '../../services/pool.service';
import { Pool, PoolSchedule } from '../../../../core/models/pool.model';

@Component({
  selector: 'app-pools-map',
  templateUrl: './pools-map.component.html',
  styleUrls: ['./pools-map.component.scss']
})
export class PoolsMapComponent implements OnInit {
  pools: any[] = [];
  loading = false;
  selectedPool: any = null;
  schedules: PoolSchedule[] = [];
  loadingSchedules = false;
  showModal = false;

  constructor(private poolService: PoolService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.poolService.getAll().subscribe({
      next: (r: any) => {
        const content = r?.content ?? r?.data ?? (Array.isArray(r) ? r : []);
        this.pools = content;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openSchedule(pool: any): void {
    this.selectedPool = pool;
    this.showModal = true;
    this.loadingSchedules = true;
    this.poolService.getSchedules(pool.id).subscribe({
      next: s => { this.schedules = Array.isArray(s) ? s : []; this.loadingSchedules = false; },
      error: () => { this.loadingSchedules = false; }
    });
  }

  closeModal(): void { this.showModal = false; this.selectedPool = null; this.schedules = []; }

  formatDt(dt?: string): string {
    if (!dt) return '';
    return new Date(dt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
