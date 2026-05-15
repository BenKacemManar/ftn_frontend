import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateResult, Result, UpdateResult } from '../models/result.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ResultService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/results`;

    getAll(page = 0, size = 20): Observable<Page<Result>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<Result>>(this.base, { params });
    }

    getById(id: number): Observable<{ data: Result }> {
        return this.http.get<{ data: Result }>(`${this.base}/${id}`);
    }

    create(dto: CreateResult): Observable<{ data: Result }> {
        return this.http.post<{ data: Result }>(this.base, dto);
    }

    update(id: number, dto: UpdateResult): Observable<{ data: Result }> {
        return this.http.put<{ data: Result }>(`${this.base}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    valider(id: number): Observable<{ data: Result }> {
        return this.http.put<{ data: Result }>(`${this.base}/${id}/valider`, {});
    }

    rejeter(id: number): Observable<{ data: Result }> {
        return this.http.put<{ data: Result }>(`${this.base}/${id}/rejeter`, {});
    }
}
