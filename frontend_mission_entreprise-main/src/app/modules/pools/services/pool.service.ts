import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Pool, PoolSchedule } from '../../../core/models/pool.model';

@Injectable({ providedIn: 'root' })
export class PoolService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, any> = {}): Observable<Pool[]> {
    return this.api.get<any>('/pools', params).pipe(map(r => r?.data ?? r));
  }

  getById(id: number): Observable<Pool> {
    return this.api.get<any>(`/pools/${id}`).pipe(map(r => r?.data ?? r));
  }

  getSchedules(poolId: number): Observable<PoolSchedule[]> {
    return this.api.get<any>(`/pools/${poolId}/schedules`).pipe(map(r => r?.data ?? r));
  }

  createSchedule(dto: Partial<PoolSchedule>): Observable<PoolSchedule> {
    return this.api.post<any>('/pool-schedules', dto).pipe(map(r => r?.data ?? r));
  }

  deleteSchedule(id: number): Observable<void> {
    return this.api.delete<void>(`/pool-schedules/${id}`);
  }
}
