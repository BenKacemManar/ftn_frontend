import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReponse, CreateSujet, Forum, Reponse, Sujet } from '../models/forum.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/forums`;

    getAll(): Observable<Page<Forum>> {
        return this.http.get<Page<Forum>>(this.base);
    }

    getById(id: number): Observable<{ data: Forum }> {
        return this.http.get<{ data: Forum }>(`${this.base}/${id}`);
    }

    getSujets(forumId: number): Observable<Sujet[]> {
        return this.http.get<Sujet[]>(`${environment.apiUrl}/sujets/forum/${forumId}`);
    }

    createSujet(dto: CreateSujet): Observable<{ data: Sujet }> {
        return this.http.post<{ data: Sujet }>(`${environment.apiUrl}/sujets`, dto);
    }

    getReponses(sujetId: number): Observable<Reponse[]> {
        return this.http.get<Reponse[]>(`${environment.apiUrl}/reponses/sujet/${sujetId}`);
    }

    createReponse(dto: CreateReponse): Observable<{ data: Reponse }> {
        return this.http.post<{ data: Reponse }>(`${environment.apiUrl}/reponses`, dto);
    }
}
