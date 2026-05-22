import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Actualite, NewsFilter } from '../../../core/models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private api: ApiService) {}

  getAll(filter: NewsFilter = {}): Observable<{ data: Actualite[]; total: number }> {
    return this.api.get<any>('/actualites', filter as any);
  }

  getById(id: number): Observable<Actualite> {
    return this.api.get<any>(`/actualites/${id}`).pipe(map(r => r?.data ?? r));
  }

  /** Fetches IDs 1..max in parallel, silently drops 404s */
  fetchAllById(max: number = 50): Observable<Actualite[]> {
    const requests = Array.from({ length: max }, (_, i) => i + 1).map(id =>
      this.getById(id).pipe(catchError(() => of(null)))
    );
    return forkJoin(requests).pipe(
      map(results => results.filter((a): a is Actualite => a !== null && a.id != null))
    );
  }

  create(dto: Partial<Actualite>): Observable<Actualite> {
    return this.api.post<any>('/actualites', dto).pipe(map(r => r?.data ?? r));
  }

  update(id: number, dto: Partial<Actualite>): Observable<Actualite> {
    return this.api.put<any>(`/actualites/${id}`, dto).pipe(map(r => r?.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/actualites/${id}`);
  }
}
