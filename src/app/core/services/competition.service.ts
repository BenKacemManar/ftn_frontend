import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Competition, CreateCompetition, UpdateCompetition } from '../models/competition.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/competitions`;

    getAll(page = 0, size = 20): Observable<Page<Competition>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<Competition>>(this.base, { params });
    }

    getById(id: number): Observable<{ data: Competition }> {
        return this.http.get<{ data: Competition }>(`${this.base}/${id}`);
    }

    create(dto: CreateCompetition): Observable<{ data: Competition }> {
        return this.http.post<{ data: Competition }>(this.base, dto);
    }

    update(id: number, dto: UpdateCompetition): Observable<{ data: Competition }> {
        return this.http.put<{ data: Competition }>(`${this.base}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    demarrer(id: number): Observable<{ data: Competition }> {
        return this.http.put<{ data: Competition }>(`${this.base}/${id}/demarrer`, {});
    }

    terminer(id: number): Observable<{ data: Competition }> {
        return this.http.put<{ data: Competition }>(`${this.base}/${id}/terminer`, {});
    }
}
