import { Injectable, signal } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reservation, CreateReservationDto, CreateRecurringReservationDto } from '../../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  readonly unseenCount = signal(0);
  readonly pendingCount = signal(0);

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
      ).subscribe((res: any) =>
        isAdmin ? this.pendingCount.set(res.count ?? 0) : this.unseenCount.set(res.count ?? 0)
      );
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

  create(dto: CreateReservationDto): Observable<any> {
    return this.api.post<any>('/reservations', dto);
  }

  createRecurring(dto: CreateRecurringReservationDto): Observable<Reservation[]> {
    return this.api.post<Reservation[]>('/reservations/recurring', dto);
  }

  approve(id: number, lanes: number[]): Observable<any> {
    return this.api.put<any>(`/reservations/${id}/approve`, { lanes });
  }

  deny(id: number): Observable<any> {
    return this.api.put<any>(`/reservations/${id}/deny`, {});
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
