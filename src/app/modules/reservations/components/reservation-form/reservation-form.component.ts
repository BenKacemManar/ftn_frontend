import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { ReservationService } from '../../services/reservation.service';
import { CreateReservationDto, CreateRecurringReservationDto, TypeReservation } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  template: `
    <div class="p-8">

      <h2 class="font-serif text-3xl mb-8">
        Nouvelle <span class="italic text-gold">réservation.</span>
      </h2>

      @if (success()) {
        <div class="mb-6 px-4 py-3 rounded-lg border border-green-500/30 text-green-400 text-sm" style="background:rgba(0,200,0,0.06)">
          {{ isRecurring ? 'Série de réservations créée.' : 'Réservation créée avec succès.' }}
        </div>
      }
      @if (error()) {
        <div class="mb-6 px-4 py-3 rounded-lg border border-accent/40 text-accent text-sm" style="background:rgba(225,6,0,0.06)">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

        <!-- Type -->
        <div class="sm:col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-3">Type de réservation *</label>
          <div class="flex gap-3">
            <button type="button" (click)="setType('ATHLETE')"
              class="flex-1 py-2.5 rounded-full text-sm transition-colors"
              [class]="reservationType === 'ATHLETE' ? 'bg-white text-black font-medium' : 'border border-white/20 text-white/70 hover:border-white/40'">
              Athlète
            </button>
            <button type="button" (click)="setType('CLUB')"
              class="flex-1 py-2.5 rounded-full text-sm transition-colors"
              [class]="reservationType === 'CLUB' ? 'bg-white text-black font-medium' : 'border border-white/20 text-white/70 hover:border-white/40'">
              Club
            </button>
          </div>
        </div>

        <!-- Fréquence -->
        <div class="sm:col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-3">Fréquence *</label>
          <div class="flex gap-3">
            <button type="button" (click)="isRecurring = false"
              class="flex-1 py-2.5 rounded-full text-sm transition-colors"
              [class]="!isRecurring ? 'bg-white text-black font-medium' : 'border border-white/20 text-white/70 hover:border-white/40'">
              Une seule fois
            </button>
            <button type="button" (click)="isRecurring = true"
              class="flex-1 py-2.5 rounded-full text-sm transition-colors"
              [class]="isRecurring ? 'bg-white text-black font-medium' : 'border border-white/20 text-white/70 hover:border-white/40'">
              Toutes les semaines
            </button>
          </div>
        </div>

        <!-- Piscine -->
        <div class="sm:col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Piscine *</label>
          <select [(ngModel)]="form.poolId" name="pool" (ngModelChange)="onPoolChange()"
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option [value]="0" disabled class="bg-[#1a0000]">Choisir une piscine</option>
            @for (p of pools; track p.id) {
              <option [value]="p.id" class="bg-[#1a0000]">{{ p.nom }} — {{ p.ville }}</option>
            }
          </select>
          @if (selectedPool) {
            <span class="text-xs text-white/40 mt-1 block">{{ laneNumbers.length }} couloir(s) disponible(s)</span>
          }
        </div>

        <!-- Nom du club -->
        @if (reservationType === 'CLUB') {
          <div class="sm:col-span-2">
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nom du club *</label>
            <input type="text" [(ngModel)]="form.nomClub" name="nomClub" placeholder="Ex : Espérance Natation"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
          </div>
        }

        <!-- Date -->
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">
            {{ isRecurring ? 'Premier créneau *' : 'Date *' }}
          </label>
          <input type="date" [(ngModel)]="form.date" name="date" [min]="today" [style.colorScheme]="'dark'"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white"/>
          @if (isRecurring) {
            <span class="text-xs text-white/40 mt-1 block">Le même jour se répètera chaque semaine.</span>
          }
        </div>

        <!-- Semaines (recurring) -->
        @if (isRecurring) {
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nombre de semaines *</label>
            <input type="number" [(ngModel)]="occurrences" name="occurrences" min="2" max="52" [style.colorScheme]="'dark'"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white"/>
          </div>
        }

        <!-- Heure début -->
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Heure de début *</label>
          <input type="time" [(ngModel)]="form.heureDebut" name="heureDebut" [style.colorScheme]="'dark'"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white"/>
        </div>

        <!-- Heure fin -->
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Heure de fin *</label>
          <input type="time" [(ngModel)]="form.heureFin" name="heureFin" [style.colorScheme]="'dark'"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white"/>
        </div>

        <!-- Couloirs -->
        @if (selectedPool) {
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nombre de couloirs *</label>
            <select [(ngModel)]="form.nbCouloirs" name="nbCouloirs"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
              <option [ngValue]="null" disabled class="bg-[#1a0000]">Choisir</option>
              @for (n of laneNumbers; track n) {
                <option [value]="n" class="bg-[#1a0000]">{{ n }} couloir{{ n > 1 ? 's' : '' }}</option>
              }
            </select>
          </div>
        }

        <!-- Notes -->
        <div class="sm:col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Remarques</label>
          <textarea [(ngModel)]="form.notes" name="notes" rows="2" placeholder="Ajouter une note…"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors resize-none"></textarea>
        </div>

      </div>

      <div class="flex gap-4 mt-8">
        <button type="button" (click)="submit()" [disabled]="loading()"
          class="px-6 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50 text-sm font-medium">
          {{ loading() ? '…' : 'Réserver' }}
        </button>
        <button type="button" (click)="done.emit(null)"
          class="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 text-sm transition-colors">
          Annuler
        </button>
      </div>

    </div>
  `
})
export class ReservationFormComponent implements OnInit {
  @Output() done = new EventEmitter<any>();

  pools: any[] = [];
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly today = new Date().toISOString().split('T')[0];

  reservationType: TypeReservation = 'ATHLETE';
  isRecurring = false;
  occurrences = 8;

  form: any = {
    poolId: 0,
    date: '',
    heureDebut: '',
    heureFin: '',
    nomClub: '',
    notes: '',
    nbCouloirs: null
  };

  constructor(
    private reservationService: ReservationService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/pools/actives').subscribe({
      next: (res) => this.pools = Array.isArray(res) ? res : (res?.data ?? []),
      error: () => this.error.set('Impossible de charger les piscines.')
    });
  }

  get selectedPool(): any {
    return this.pools.find(p => p.id === Number(this.form.poolId));
  }

  get laneNumbers(): number[] {
    const pool = this.selectedPool;
    const count = pool?.nbCouloirs ?? pool?.nb_couloirs ?? 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  setType(type: TypeReservation): void {
    this.reservationType = type;
    if (type === 'ATHLETE') this.form.nomClub = '';
  }

  onPoolChange(): void { this.form.nbCouloirs = null; }

  submit(): void {
    if (!this.form.poolId || !this.form.date || !this.form.heureDebut || !this.form.heureFin) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (this.form.heureFin <= this.form.heureDebut) {
      this.error.set("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (this.reservationType === 'CLUB' && !this.form.nomClub?.trim()) {
      this.error.set('Le nom du club est obligatoire pour une réservation club.');
      return;
    }
    if (!this.form.nbCouloirs || this.form.nbCouloirs < 1) {
      this.error.set('Veuillez indiquer le nombre de couloirs souhaité.');
      return;
    }
    if (this.isRecurring && (!this.occurrences || this.occurrences < 2 || this.occurrences > 52)) {
      this.error.set('Le nombre de semaines doit être entre 2 et 52.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    if (this.isRecurring) this.submitRecurring(); else this.submitOnce();
  }

  private submitOnce(): void {
    const dto: CreateReservationDto = {
      poolId: Number(this.form.poolId),
      date: this.form.date,
      heureDebut: this.form.heureDebut,
      heureFin: this.form.heureFin,
      typeReservation: this.reservationType,
      nbCouloirs: this.form.nbCouloirs,
      nomClub: this.form.nomClub || undefined,
      notes: this.form.notes || undefined,
    };
    this.reservationService.create(dto).subscribe({
      next: (res) => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.done.emit(res), 800);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Une erreur est survenue.');
        this.loading.set(false);
      }
    });
  }

  private submitRecurring(): void {
    const dto: CreateRecurringReservationDto = {
      poolId: Number(this.form.poolId),
      startDate: this.form.date,
      heureDebut: this.form.heureDebut,
      heureFin: this.form.heureFin,
      typeReservation: this.reservationType,
      nbCouloirs: this.form.nbCouloirs,
      occurrences: Number(this.occurrences),
      nomClub: this.form.nomClub || undefined,
      notes: this.form.notes || undefined,
    };
    this.reservationService.createRecurring(dto).subscribe({
      next: (res) => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.done.emit(res), 800);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Une erreur est survenue.');
        this.loading.set(false);
      }
    });
  }
}
