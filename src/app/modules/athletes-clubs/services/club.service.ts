import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Club, ClubMembership } from '../../../core/models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, any> = {}): Observable<{ data: Club[]; total: number }> {
    return this.api.get<any>('/clubs', params);
  }

  getById(id: number): Observable<Club> {
    return this.api.get<any>(`/clubs/${id}`).pipe(map(r => r?.data ?? r));
  }

  getMembers(clubId: number): Observable<ClubMembership[]> {
    return this.api.get<any>(`/clubs/${clubId}/members`).pipe(map(r => r?.data ?? r));
  }

  getAthletes(clubId: number): Observable<any[]> {
    return this.api.get<any>(`/clubs/${clubId}/athletes`).pipe(map(r => Array.isArray(r) ? r : (r?.data ?? [])));
  }

  create(dto: Partial<Club>): Observable<Club> {
    return this.api.post<any>('/clubs', dto).pipe(map(r => r?.data ?? r));
  }

  update(id: number, dto: Partial<Club>): Observable<Club> {
    return this.api.put<any>(`/clubs/${id}`, dto).pipe(map(r => r?.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/clubs/${id}`);
  }
}
