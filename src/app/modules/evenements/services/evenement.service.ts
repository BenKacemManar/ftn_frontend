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

  publish(id: number): Observable<any> {
    return this.api.put<any>(`/evenements/${id}/publish`, {});
  }

  getParticipations(id: number): Observable<any> {
    return this.api.get<any>(`/evenements/${id}/participations`);
  }

  updateParticipationStatus(participationId: number, status: string): Observable<any> {
    return this.api.put<any>(`/evenements/participations/${participationId}/status`, { status });
  }
}
