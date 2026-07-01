import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Reservation } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss']
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = true;
  error = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.error = 'Vous devez être connecté.';
      this.loading = false;
      return;
    }
    this.reservationService.getByUser(user.email).subscribe({
      next: (res) => { this.reservations = res; this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement.'; this.loading = false; }
    });

    // Clear the red dot: optimistic reset + tell the backend
    this.reservationService.unseenCount.set(0);
    this.reservationService.markSeen().subscribe();
  }

  formatTime(time: string): string {
    if (!time) return '—';
    return time.substring(0, 5);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const [year, month, day] = date.split('-');
    if (!year || !month || !day) return date;
    return `${day}/${month}/${year}`;
  }

  cancel(id: number): void {
    if (!confirm('Annuler cette reservation ?')) return;
    this.reservationService.cancel(id).subscribe({
      next: () => this.reservations = this.reservations.filter(r => r.id !== id),
      error: () => alert('Erreur lors de l annulation.')
    });
  }

  getLaneLabel(r: Reservation): string {
    if (r.numerosCouloirs?.length) return 'Couloirs ' + r.numerosCouloirs.join(', ');
    if (r.numeroCouloir) return 'Couloir ' + r.numeroCouloir;
    return 'Piscine entiere';
  }

  getStatusLabel(status: Reservation['statut']): string {
    const labels: Record<Reservation['statut'], string> = {
      EN_ATTENTE: 'En attente',
      CONFIRMEE: 'Confirmée',
      ANNULEE: 'Annulée'
    };
    return labels[status] || status;
  }
}