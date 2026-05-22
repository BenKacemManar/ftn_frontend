import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, AuthResponse, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ftn_token';
  private readonly USER_KEY  = 'ftn_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(credentials: LoginRequest): Observable<any> {
    return this.api.post<any>('/auth/login', credentials).pipe(
      tap((res: any) => {
        const payload = res?.data ?? res;
        const token: string = payload?.accessToken ?? payload?.access_token ?? payload?.token;
        const user: User = {
          id: payload?.id ?? '',
          email: payload?.email ?? '',
          firstName: payload?.firstName ?? payload?.first_name ?? '',
          lastName: payload?.lastName ?? payload?.last_name ?? '',
          role: payload?.role ?? 'ATHLETE',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
