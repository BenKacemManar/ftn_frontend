import { Component, OnInit } from '@angular/core';
import { ScrapingService, ScrapingStatus, ScrapingLog } from '../../services/scraping.service';

@Component({
  selector: 'app-scraping',
  templateUrl: './scraping.component.html',
  styleUrls: ['./scraping.component.scss']
})
export class ScrapingComponent implements OnInit {
  sourceUrl = '';
  status: ScrapingStatus = { status: 'IDLE' };
  logs: ScrapingLog[] = [];
  loading = false;
  triggering = false;

  constructor(private scrapingService: ScrapingService) {}

  ngOnInit(): void {
    this.refreshStatus();
    this.refreshLogs();
  }

  trigger(): void {
    this.triggering = true;
    this.scrapingService.trigger(this.sourceUrl || undefined).subscribe({
      next: () => { this.triggering = false; setTimeout(() => this.refreshStatus(), 1000); },
      error: () => { this.triggering = false; }
    });
  }

  refreshStatus(): void {
    this.scrapingService.getStatus().subscribe({
      next: s => { this.status = s; },
      error: () => {}
    });
  }

  refreshLogs(): void {
    this.loading = true;
    this.scrapingService.getLogs().subscribe({
      next: l => { this.logs = Array.isArray(l) ? l : []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  statusColor(): string {
    return { IDLE: '#5B6880', RUNNING: '#F59E0B', SUCCESS: '#00C48C', ERROR: '#FF2D46' }[this.status.status] ?? '#5B6880';
  }

  statusBg(): string {
    return { IDLE: '#F0F2F5', RUNNING: '#FFFBEB', SUCCESS: '#ECFDF5', ERROR: '#FFF5F5' }[this.status.status] ?? '#F0F2F5';
  }
}
