import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';

const TOKEN_KEY = 'ftn_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    currentUser = signal<User | null>(null);

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<{ data: AuthResponse }>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            tap((res) => {
                localStorage.setItem(TOKEN_KEY, res.data.access_token);
                if (res.data.user) this.currentUser.set(res.data.user);
            }),
            map((res) => res.data)
        );
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    loadCurrentUser(): Observable<User> {
        return this.http.get<{ data: User }>(`${environment.apiUrl}/auth/me`).pipe(
            map((res) => res.data),
            tap((user) => this.currentUser.set(user))
        );
    }
}
