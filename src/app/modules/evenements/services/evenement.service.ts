import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Evenement } from '../../../core/models/evenement.model';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, any> = {}): Observable<any> {
    return this.api.get<any>('/evenements', params);
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`/evenements/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.api.post<any>('/evenements', dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.api.put<any>(`/evenements/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`/evenements/${id}`);
  }

  getParticipations(id: number): Observable<any> {
    return this.api.get<any>(`/evenements/${id}/participations`);
  }

  register(evenementId: number, dto: { userId: number; message?: string }): Observable<any> {
    return this.api.post<any>(`/evenements/${evenementId}/participations`, dto);
  }

  // Backend exposes PATCH .../participations/{id}/status?status=ACCEPTEE|REFUSEE (query param, not a body).
  updateParticipationStatus(participationId: number, status: 'ACCEPTEE' | 'REFUSEE'): Observable<any> {
    return this.api.patch<any>(`/evenements/participations/${participationId}/status`, { status });
  }

  deleteParticipation(participationId: number): Observable<any> {
    return this.api.delete<any>(`/evenements/participations/${participationId}`);
  }
}
