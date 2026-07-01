import { Component, OnInit, signal } from '@angular/core';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { ApiService } from '../../../../core/services/api.service';
import { Check, X } from 'lucide-angular';

@Component({
  selector: 'app-reservations-admin',
  template: `
    <app-admin-layout>
      <div>
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-3xl">Réservations</h1>
        </div>

        @if (loading()) {
          <div class="text-white/40 text-center py-16">Chargement…</div>
        } @else {
          <div class="border border-white/10 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Demandeur</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Piscine</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Date</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Horaire</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Couloirs</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Statut</th>
                  <th class="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                @for (r of reservations(); track r.id) {
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="px-4 py-3 text-sm">{{ r.reserveePar }}</td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">{{ r.poolNom }}</td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">{{ formatDate(r.date) }}</td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">{{ r.heureDebut?.substring(0,5) }} → {{ r.heureFin?.substring(0,5) }}</td>
                    <td class="px-4 py-3 text-sm text-white/60">
                      @if (r.numerosCouloirs?.length) {
                        <span class="text-white">{{ r.numerosCouloirs.join(', ') }}</span>
                      } @else {
                        <span class="text-white/40">{{ r.nbCouloirs }} demandé(s)</span>
                      }
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="badgeClass(r.statut)" class="text-xs px-2 py-1 rounded-full font-medium">
                        {{ statusLabel(r.statut) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      @if (r.statut === 'EN_ATTENTE') {
                        <div class="flex gap-2 justify-end">
                          <button
                            (click)="openAssign(r)"
                            [disabled]="busy() === r.id"
                            title="Approuver"
                            class="p-1.5 rounded-full bg-green-600/20 hover:bg-green-600/40 text-green-400 transition-colors disabled:opacity-40">
                            <lucide-icon [img]="Check" class="w-3.5 h-3.5"></lucide-icon>
                          </button>
                          <button
                            (click)="deny(r.id)"
                            [disabled]="busy() === r.id"
                            title="Refuser"
                            class="p-1.5 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors disabled:opacity-40">
                            <lucide-icon [img]="X" class="w-3.5 h-3.5"></lucide-icon>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="7" class="text-white/40 text-center py-10">Aucune réservation.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-modal [open]="!!assigning()" title="Attribuer les couloirs" maxWidth="max-w-md" (closed)="closeAssign()">
        @if (assigning()) {
          <p class="text-sm text-white/60 mb-4">
            {{ assigning().reserveePar }} demande <strong class="text-white">{{ assigning().nbCouloirs }}</strong> couloir(s)
            pour le {{ formatDate(assigning().date) }}, {{ assigning().heureDebut?.substring(0,5) }} → {{ assigning().heureFin?.substring(0,5) }}.
          </p>

          @if (assignError()) {
            <div class="mb-4 px-3 py-2 rounded-lg border border-accent text-accent text-xs" style="background:rgba(225,6,0,0.08)">
              {{ assignError() }}
            </div>
          }

          <div class="flex flex-wrap gap-2 mb-6">
            @for (lane of poolLaneNumbers(); track lane) {
              <button type="button"
                class="w-10 h-10 rounded-full border text-sm transition-colors"
                [class]="selectedLanes().has(lane) ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40'"
                (click)="toggleLane(lane)">
                {{ lane }}
              </button>
            }
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-white/40">{{ selectedLanes().size }} / {{ assigning().nbCouloirs }} sélectionné(s)</span>
            <button type="button" (click)="confirmAssign()"
              [disabled]="selectedLanes().size !== assigning().nbCouloirs || busy() === assigning().id"
              class="px-6 py-2.5 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-40">
              Confirmer
            </button>
          </div>
        }
      </app-modal>
    </app-admin-layout>
  `
})
export class ReservationsAdminComponent implements OnInit {
  readonly Check = Check;
  readonly X = X;
  readonly reservations = signal<any[]>([]);
  readonly loading = signal(false);
  readonly busy = signal<number | null>(null);

  readonly assigning = signal<any | null>(null);
  readonly poolLaneNumbers = signal<number[]>([]);
  readonly selectedLanes = signal<Set<number>>(new Set());
  readonly assignError = signal('');

  constructor(
    private reservationService: ReservationService,
    private api: ApiService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.reservationService.getAll().subscribe({
      next: r => {
        this.reservations.set(r?.data ?? r?.content ?? (Array.isArray(r) ? r : []));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAssign(r: any): void {
  this.assignError.set('');
  this.selectedLanes.set(new Set());
  this.assigning.set(r);
  this.api.get<any>(`/pools/${r.poolId}`).subscribe({
    next: (res) => {
      const pool = res?.data ?? res;
      const count = pool?.nbCouloirs ?? pool?.nb_couloirs ?? 0;
      this.poolLaneNumbers.set(Array.from({ length: count }, (_, i) => i + 1));
    },
    error: () => this.assignError.set('Impossible de charger les couloirs de la piscine.')
  });
}

  closeAssign(): void {
    this.assigning.set(null);
  }

  toggleLane(lane: number): void {
    const target = this.assigning()?.nbCouloirs ?? 0;
    const current = new Set(this.selectedLanes());
    if (current.has(lane)) {
      current.delete(lane);
    } else if (current.size < target) {
      current.add(lane);
    }
    this.selectedLanes.set(current);
  }

  confirmAssign(): void {
    const r = this.assigning();
    if (!r) return;
    this.busy.set(r.id);
    this.assignError.set('');
    const lanes = Array.from(this.selectedLanes()).sort((a, b) => a - b);
    this.reservationService.approve(r.id, lanes).subscribe({
      next: () => {
        this.updateStatus(r.id, 'CONFIRMEE', lanes);
        this.busy.set(null);
        this.closeAssign();
      },
      error: (err) => {
        this.assignError.set(err?.error?.message || 'Erreur lors de l’attribution.');
        this.busy.set(null);
      }
    });
  }

  deny(id: number): void {
    this.busy.set(id);
    this.reservationService.deny(id).subscribe({
      next: () => { this.updateStatus(id, 'ANNULEE'); this.busy.set(null); },
      error: () => this.busy.set(null)
    });
  }

  private updateStatus(id: number, statut: string, numerosCouloirs?: number[]): void {
    this.reservations.update(list => list.map(r =>
      r.id === id ? { ...r, statut, ...(numerosCouloirs ? { numerosCouloirs } : {}) } : r
    ));
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Refusée' } as any)[s] ?? s;
  }

  badgeClass(s: string): string {
    return s === 'CONFIRMEE' ? 'bg-green-600/20 text-green-400'
         : s === 'ANNULEE'   ? 'bg-red-600/20 text-red-400'
         :                     'bg-yellow-600/20 text-yellow-400';
  }
}