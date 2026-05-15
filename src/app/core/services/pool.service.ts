import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePool, Pool, UpdatePool } from '../models/pool.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PoolService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/pools`;

    getAll(page = 0, size = 20): Observable<Page<Pool>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<Pool>>(this.base, { params });
    }

    getActives(): Observable<Pool[]> {
        return this.http.get<Pool[]>(`${this.base}/actives`);
    }

    getById(id: number): Observable<{ data: Pool }> {
        return this.http.get<{ data: Pool }>(`${this.base}/${id}`);
    }

    create(dto: CreatePool): Observable<{ data: Pool }> {
        return this.http.post<{ data: Pool }>(this.base, dto);
    }

    update(id: number, dto: UpdatePool): Observable<{ data: Pool }> {
        return this.http.put<{ data: Pool }>(`${this.base}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
