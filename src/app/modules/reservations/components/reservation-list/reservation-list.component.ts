import { Component, OnInit, signal } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { ReservationExportService } from '../../services/reservation-export.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Reservation } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-list',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">

        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-4 mb-6">
              <span class="h-px w-10 bg-accent"></span>
              <span class="text-xs tracking-[0.3em] uppercase text-white/50">Tableau de bord</span>
            </div>
            <h1 class="font-serif text-5xl lg:text-6xl leading-[0.95]">
              Mes <span class="italic text-gold">réservations.</span>
            </h1>
          </div>
          @if (!isAdmin) {
            <button (click)="showModal.set(true)"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
              + Nouvelle réservation
            </button>
          }
        </div>

        @if (loading()) {
          <div class="text-white/40 text-center py-20">Chargement…</div>
        } @else if (error()) {
          <div class="text-accent text-center py-20">{{ error() }}</div>
        } @else if (reservations().length === 0) {
          <div class="text-white/40 text-center py-20">Aucune réservation pour le moment.</div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (r of reservations(); track r.id) {
              <div class="border rounded-xl overflow-hidden transition-colors"
                [class]="r.statut === 'CONFIRMEE' ? 'border-green-500/20' : r.statut === 'ANNULEE' ? 'border-white/5 opacity-60' : 'border-white/10'">

                <div class="px-5 pt-5 pb-4 border-b border-white/8 flex items-start justify-between gap-4">
                  <div>
                    <div class="font-medium">{{ r.poolNom || 'Piscine' }}</div>
                    <div class="text-xs text-white/40 mt-0.5">{{ r.poolVille }}</div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    [class]="r.statut === 'CONFIRMEE' ? 'bg-green-500/10 text-green-400' : r.statut === 'ANNULEE' ? 'bg-white/5 text-white/30' : 'bg-accent/10 text-accent'">
                    {{ statusLabel(r.statut) }}
                  </span>
                </div>

                <div class="px-5 py-4 border-b border-white/8 grid grid-cols-3 gap-4">
                  <div>
                    <div class="text-[10px] tracking-wider uppercase text-white/40 mb-1">Date</div>
                    <div class="font-medium text-sm">{{ formatDate(r.date) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] tracking-wider uppercase text-white/40 mb-1">Début</div>
                    <div class="font-serif text-xl text-gold">{{ formatTime(r.heureDebut) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] tracking-wider uppercase text-white/40 mb-1">Fin</div>
                    <div class="font-serif text-xl text-gold">{{ formatTime(r.heureFin) }}</div>
                  </div>
                </div>

                <div class="px-5 py-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-white/40">Type</span>
                    <span>{{ r.typeReservation === 'CLUB' ? 'Club' : 'Athlète' }}
                      @if (r.typeReservation === 'CLUB' && r.nomClub) { — {{ r.nomClub }} }
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-white/40">Couloir(s)</span>
                    <span>{{ exportService.laneLabel(r) }}</span>
                  </div>
                  @if (r.notes) {
                    <div class="text-xs text-white/30 pt-1">{{ r.notes }}</div>
                  }
                </div>

                @if (r.statut !== 'ANNULEE') {
                  <div class="px-5 pb-5 flex gap-3">
                    @if (r.statut === 'CONFIRMEE') {
                      <button (click)="exportService.downloadReceipt(r)"
                        class="flex-1 py-2 rounded-full border border-white/20 text-xs hover:border-white/40 transition-colors">
                        Reçu
                      </button>
                    }
                    @if (!isAdmin) {
                      <button (click)="cancel(r.id)"
                        class="flex-1 py-2 rounded-full border border-accent/30 text-accent text-xs hover:border-accent transition-colors">
                        Annuler
                      </button>
                    }
                  </div>
                }

              </div>
            }
          </div>
        }
      </section>
    </app-page-layout>

    <!-- New reservation modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-8 overflow-y-auto"
        style="background:rgba(0,0,0,0.78)"
        (click)="showModal.set(false)">
        <div class="relative bg-[#0a0000] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl my-auto"
          (click)="$event.stopPropagation()">
          <button (click)="showModal.set(false)"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-colors z-10 text-sm">
            ✕
          </button>
          <app-reservation-form (done)="onFormDone($event)"></app-reservation-form>
        </div>
      </div>
    }
  `
})
export class ReservationListComponent implements OnInit {
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showModal = signal(false);

  constructor(
    private reservationService: ReservationService,
    readonly exportService: ReservationExportService,
    private authService: AuthService,
  ) {}

  get isAdmin(): boolean { return this.authService.hasRole('ADMIN'); }

  ngOnInit(): void { this.load(); }

  private load(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.error.set('Vous devez être connecté.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.reservationService.getByUser(user.email).subscribe({
      next: (res: any) => {
        const list: Reservation[] = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: () => { this.error.set('Erreur lors du chargement.'); this.loading.set(false); }
    });
    this.reservationService.unseenCount.set(0);
    this.reservationService.markSeen().subscribe();
  }

  onFormDone(result: any): void {
    this.showModal.set(false);
    if (result !== null) this.load();
  }

  formatTime(time: string): string { return time ? time.substring(0, 5) : '—'; }

  formatDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Annulée' } as any)[s] ?? s;
  }

  cancel(id: number): void {
    if (!confirm('Annuler cette réservation ?')) return;
    this.reservationService.cancel(id).subscribe({
      next: () => this.reservations.update(list => list.filter(r => r.id !== id)),
      error: () => alert("Erreur lors de l'annulation.")
    });
  }
}
