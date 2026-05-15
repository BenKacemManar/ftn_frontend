import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Club, CreateClub, UpdateClub } from '../models/club.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/clubs`;

    getAll(page = 0, size = 20): Observable<Page<Club>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<Club>>(this.base, { params });
    }

    getById(id: number): Observable<{ data: Club }> {
        return this.http.get<{ data: Club }>(`${this.base}/${id}`);
    }

    create(dto: CreateClub): Observable<{ data: Club }> {
        return this.http.post<{ data: Club }>(this.base, dto);
    }

    update(id: number, dto: UpdateClub): Observable<{ data: Club }> {
        return this.http.put<{ data: Club }>(`${this.base}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
