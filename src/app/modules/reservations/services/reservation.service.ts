import { Injectable, signal } from '@angular/core';
import { Observable, Subscription, interval, startWith, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reservation, CreateReservationDto } from '../../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  readonly unseenCount = signal(0);   // red dot for regular users
  readonly pendingCount = signal(0);  // badge count for admins

  private pollSub?: Subscription;

  constructor(private api: ApiService, private auth: AuthService) {
    this.auth.currentUser$.subscribe(user => {
      this.pollSub?.unsubscribe();
      if (!user) {
        this.unseenCount.set(0);
        this.pendingCount.set(0);
        return;
      }
      const isAdmin = user.role === 'ADMIN';
      const request$ = isAdmin ? this.getPendingCount() : this.getUnseenCount();
      this.pollSub = interval(30000).pipe(
        startWith(0),
        switchMap(() => request$.pipe(catchError(() => of({ count: 0 }))))
      ).subscribe(res => isAdmin ? this.pendingCount.set(res.count) : this.unseenCount.set(res.count));
    });
  }

  getByPool(poolId: number): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(`/reservations/pool/${poolId}`);
  }

  getByUser(email: string): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(`/reservations/user/${email}`);
  }

  getAll(params: Record<string, any> = {}): Observable<any> {
    return this.api.get<any>('/reservations', params);
  }

  approve(id: number, lanes: number[]): Observable<{ data: Reservation }> {
    return this.api.put<{ data: Reservation }>(`/reservations/${id}/approve`, { lanes });
  }

  deny(id: number): Observable<{ data: Reservation }> {
    return this.api.put<{ data: Reservation }>(`/reservations/${id}/deny`, {});
  }

  create(dto: CreateReservationDto): Observable<{ data: Reservation }> {
    return this.api.post<{ data: Reservation }>('/reservations', dto);
  }

  cancel(id: number): Observable<void> {
    return this.api.delete<void>(`/reservations/${id}`);
  }

  getUnseenCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('/reservations/unseen-count');
  }

  getPendingCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('/reservations/pending-count');
  }

  markSeen(): Observable<void> {
    return this.api.put<void>('/reservations/mark-seen', {});
  }
}