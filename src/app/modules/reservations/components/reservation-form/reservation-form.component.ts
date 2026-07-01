import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { ReservationService } from '../../services/reservation.service';
import { CreateReservationDto, TypeReservation } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  template: `
    <app-page-layout>
      <app-modal [open]="true" title="Nouvelle réservation" maxWidth="max-w-2xl" (closed)="cancel()">

        @if (success) {
          <div class="mb-6 px-4 py-3 rounded-lg border border-green-500/40 text-green-400 text-sm" style="background:rgba(0,180,0,0.08)">
            Réservation créée avec succès. Redirection...
          </div>
        }
        @if (error) {
          <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">
            {{ error }}
          </div>
        }

        <div class="grid grid-cols-2 gap-x-10 gap-y-8 max-w-2xl mb-8">

          <div class="col-span-2">
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Type de réservation *</label>
            <div class="flex gap-3">
              <button type="button"
                class="flex-1 py-2.5 rounded-full text-sm transition-colors"
                [class]="reservationType === 'ATHLETE' ? 'bg-white text-black' : 'border border-white/20 text-white/70 hover:border-white/40'"
                (click)="setType('ATHLETE')">Athlète</button>
              <button type="button"
                class="flex-1 py-2.5 rounded-full text-sm transition-colors"
                [class]="reservationType === 'CLUB' ? 'bg-white text-black' : 'border border-white/20 text-white/70 hover:border-white/40'"
                (click)="setType('CLUB')">Club</button>
            </div>
          </div>

         <div class="col-span-2">
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Piscine *</label>
  <select [(ngModel)]="form.pool_id" name="pool" (ngModelChange)="onPoolChange()"
    class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
    <option [value]="0" disabled class="bg-[#1a0000]">Choisir une piscine</option>
    <option *ngFor="let p of pools" [value]="p.id" class="bg-[#1a0000]">{{ p.nom }} - {{ p.ville }}</option>
  </select>
  <span class="block text-xs text-white/40 mt-2" *ngIf="selectedPool">{{ laneNumbers.length }} couloirs disponibles</span>
</div>

<div *ngIf="reservationType === 'CLUB'" class="col-span-2">
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nom du club *</label>
  <input [(ngModel)]="form.nom_club" name="nomClub" placeholder="Ex : Espérance Natation"
    class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
</div>

<div>
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Date *</label>
  <input type="date" [(ngModel)]="form.date" name="date" [min]="today" style="color-scheme: dark;"
    class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
</div>

<div>
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Heure début *</label>
  <input type="time" [(ngModel)]="form.heure_debut" name="heureDebut" style="color-scheme: dark;"
    class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
</div>

<div>
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Heure fin *</label>
  <input type="time" [(ngModel)]="form.heure_fin" name="heureFin" style="color-scheme: dark;"
    class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
</div>

<div *ngIf="selectedPool">
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nombre de couloirs *</label>
  <select [(ngModel)]="form.nbCouloirs" name="nbCouloirs"
    class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
    <option [value]="null" disabled class="bg-[#1a0000]">Choisir</option>
    <option *ngFor="let n of laneNumbers" [value]="n" class="bg-[#1a0000]">{{ n }} couloir{{ n > 1 ? 's' : '' }}</option>
    <option [value]="laneNumbers.length" class="bg-[#1a0000]">Piscine entière ({{ laneNumbers.length }})</option>
  </select>
</div>

<div class="col-span-2">
  <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Remarques</label>
  <textarea [(ngModel)]="form.notes" name="notes" rows="2" placeholder="Ajouter une note..."
    class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors resize-none"></textarea>
</div>
</div>
        <button type="button" (click)="submit()" [disabled]="loading"
          class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
          {{ loading ? '…' : 'Réserver' }}
        </button>

      </app-modal>
    </app-page-layout>
  `
})
export class ReservationFormComponent implements OnInit {
  pools: any[] = [];
  loading = false;
  success = false;
  error = '';
  today = new Date().toISOString().split('T')[0];

  reservationType: TypeReservation = 'ATHLETE';

  form: any = {
    pool_id: 0,
    date: '',
    heure_debut: '',
    heure_fin: '',
    nom_club: '',
    notes: '',
    nbCouloirs: null
  };

  constructor(
    private reservationService: ReservationService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/pools/actives').subscribe({
      next: (res) => this.pools = res,
      error: () => this.error = 'Impossible de charger les piscines.'
    });
  }

  get selectedPool(): any {
    return this.pools.find(p => p.id === Number(this.form.pool_id));
  }

  get laneNumbers(): number[] {
    const pool = this.selectedPool;
    const count = pool?.nb_couloirs ?? pool?.nbCouloirs ?? 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  setType(type: TypeReservation): void {
    this.reservationType = type;
    if (type === 'ATHLETE') {
      this.form.nom_club = '';
    }
  }

  onPoolChange(): void {
    this.form.nbCouloirs = null;
  }

  selectLaneCount(n: number): void {
    this.form.nbCouloirs = n;
  }

  cancel(): void {
    this.router.navigate(['/reservations']);
  }

  submit(): void {
    if (!this.form.pool_id || !this.form.date || !this.form.heure_debut || !this.form.heure_fin) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.form.heure_fin <= this.form.heure_debut) {
      this.error = "L heure de fin doit etre apres l heure de debut.";
      return;
    }
    if (this.reservationType === 'CLUB' && !this.form.nom_club?.trim()) {
      this.error = 'Le nom du club est obligatoire pour une reservation club.';
      return;
    }
    if (!this.form.nbCouloirs || this.form.nbCouloirs < 1) {
      this.error = 'Veuillez indiquer le nombre de couloirs souhaité.';
      return;
    }

    this.loading = true;
    this.error = '';

    const dto: CreateReservationDto = {
      poolId: Number(this.form.pool_id),
      date: this.form.date,
      heureDebut: this.form.heure_debut,
      heureFin: this.form.heure_fin,
      typeReservation: this.reservationType,
      reserveePar: '',
      nomClub: this.form.nom_club,
      notes: this.form.notes,
      nbCouloirs: this.form.nbCouloirs
    };

    this.reservationService.create(dto).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/reservations']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Une erreur est survenue.';
        this.loading = false;
      }
    });
  }
}