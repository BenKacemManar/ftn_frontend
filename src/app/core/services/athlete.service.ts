import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Athlete, CreateAthlete, Licence, UpdateAthlete } from '../models/athlete.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AthleteService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/athletes`;
    private clubBase = `${environment.apiUrl}/clubs`;

    getAll(page = 0, size = 20): Observable<Page<Athlete>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<Athlete>>(this.base, { params });
    }

    getById(id: number): Observable<{ data: Athlete }> {
        return this.http.get<{ data: Athlete }>(`${this.base}/${id}`);
    }

    getByClub(clubId: number): Observable<Athlete[]> {
        return this.http.get<Athlete[]>(`${this.clubBase}/${clubId}/athletes`);
    }

    getLicences(id: number): Observable<Licence[]> {
        return this.http.get<Licence[]>(`${this.base}/${id}/licences`);
    }

    create(dto: CreateAthlete): Observable<{ data: Athlete }> {
        return this.http.post<{ data: Athlete }>(this.base, dto);
    }

    update(id: number, dto: UpdateAthlete): Observable<{ data: Athlete }> {
        return this.http.put<{ data: Athlete }>(`${this.base}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
