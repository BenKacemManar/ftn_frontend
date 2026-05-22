import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

export interface ScrapingStatus {
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  lastRun?: string;
  message?: string;
}

export interface ScrapingLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  source?: string;
}

@Injectable({ providedIn: 'root' })
export class ScrapingService {
  constructor(private api: ApiService) {}

  trigger(sourceUrl?: string): Observable<any> {
    return this.api.post<any>('/scraping/trigger', { sourceUrl }).pipe(map(r => r?.data ?? r));
  }

  getStatus(): Observable<ScrapingStatus> {
    return this.api.get<any>('/scraping/status').pipe(map(r => r?.data ?? r));
  }

  getLogs(): Observable<ScrapingLog[]> {
    return this.api.get<any>('/scraping/logs').pipe(map(r => r?.data ?? r));
  }
}
