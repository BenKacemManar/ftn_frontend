import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Athlete } from '../../../core/models/user.model';
import { Licence } from '../../../core/models/club.model';

@Injectable({ providedIn: 'root' })
export class AthleteService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, any> = {}): Observable<{ data: any[]; total: number }> {
    return this.api.get<any>('/athletes', params);
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`/athletes/${id}`).pipe(map(r => r?.data ?? r));
  }

  getLicences(athleteId: number): Observable<Licence[]> {
    return this.api.get<any>(`/athletes/${athleteId}/licences`).pipe(map(r => Array.isArray(r) ? r : (r?.data ?? [])));
  }

  create(dto: any): Observable<any> {
    return this.api.post<any>('/athletes', dto).pipe(map(r => r?.data ?? r));
  }

  update(id: number, dto: any): Observable<any> {
    return this.api.put<any>(`/athletes/${id}`, dto).pipe(map(r => r?.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/athletes/${id}`);
  }
}
