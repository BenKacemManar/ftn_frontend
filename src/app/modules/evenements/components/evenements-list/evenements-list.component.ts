import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { Evenement, EvenementType } from '../../../../core/models/evenement.model';
import { Router } from '@angular/router';

type FilterTab = 'TOUS' | EvenementType;

@Component({
  selector: 'app-evenements-list',
  template: `
    <app-page-layout>
      <div class="pt-32 pb-20 px-6 max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p class="text-[11px] tracking-[0.35em] uppercase text-accent mb-3">Fédération Tunisienne de Natation</p>
            <h1 class="font-serif text-4xl md:text-5xl leading-tight">L'agenda de la section.</h1>
          </div>
          @if (auth.hasRole('ADMIN')) {
            <button (click)="router.navigate(['/admin/evenements'])"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors whitespace-nowrap">
              + Nouvel évènement
            </button>
          }
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2 flex-wrap mb-10">
          @for (tab of tabs; track tab.value) {
            <button (click)="setFilter(tab.value)"
              class="px-5 py-2 rounded-full text-sm border transition-colors"
              [ngClass]="activeFilter() === tab.value
                ? 'bg-accent border-accent text-white'
                : 'border-white/20 text-white/60 hover:border-white/40'">
              {{ tab.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="text-white/40 text-center py-24">Chargement…</div>
        } @else if (filteredItems.length === 0) {
          <div class="text-center py-24 text-white/40">
            <p class="text-lg mb-2">Aucun événement à afficher.</p>
            <p class="text-sm">Revenez bientôt pour les prochains événements de la section.</p>
          </div>
        } @else {
          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            @for (ev of filteredItems; track ev.id) {
              <div class="border border-white/10 rounded-xl p-6 hover:border-white/25 transition-colors group">
                <div class="flex items-start justify-between gap-3 mb-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium"
                    [style.background]="typeColor(ev.type).bg"
                    [style.color]="typeColor(ev.type).text">
                    {{ typeLabel(ev.type) }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase"
                    [style.background]="statusColor(ev.status).bg"
                    [style.color]="statusColor(ev.status).text">
                    {{ statusLabel(ev.status) }}
                  </span>
                </div>
                <h2 class="font-serif text-lg leading-snug mb-3 group-hover:text-accent transition-colors">{{ ev.titre }}</h2>
                @if (ev.description) {
                  <p class="text-sm text-white/50 mb-4 line-clamp-2">{{ ev.description }}</p>
                }
                <div class="space-y-1.5 text-xs text-white/40">
                  <div class="flex items-center gap-2">
                    <span class="text-white/25">📅</span>
                    <span>{{ formatDate(ev.dateDebut) }}@if (ev.dateFin && ev.dateFin !== ev.dateDebut) { → {{ formatDate(ev.dateFin) }} }</span>
                  </div>
                  @if (ev.lieu) {
                    <div class="flex items-center gap-2">
                      <span class="text-white/25">📍</span>
                      <span>{{ ev.lieu }}</span>
                    </div>
                  }
                  @if (ev.capaciteMax) {
                    <div class="flex items-center gap-2">
                      <span class="text-white/25">👥</span>
                      <span>{{ ev.capaciteMax }} participants max</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

      </div>
    </app-page-layout>
  `
})
export class EvenementsListComponent implements OnInit {
  readonly loading = signal(true);
  readonly items = signal<Evenement[]>([]);
  readonly activeFilter = signal<FilterTab>('TOUS');

  readonly tabs: { label: string; value: FilterTab }[] = [
    { label: 'Tous', value: 'TOUS' },
    { label: 'Compétitions', value: 'COMPETITION' },
    { label: 'Cérémonies', value: 'CEREMONIE' },
    { label: 'Stages', value: 'STAGE' },
    { label: 'Autres', value: 'AUTRE' },
  ];

  constructor(
    readonly auth: AuthService,
    readonly router: Router,
    private svc: EvenementService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll({ size: 100 }).subscribe({
      next: (res) => {
        const data: Evenement[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.items.set(data.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(f: FilterTab): void { this.activeFilter.set(f); }

  get filteredItems(): Evenement[] {
    return this.activeFilter() === 'TOUS'
      ? this.items()
      : this.items().filter(e => e.type === this.activeFilter());
  }

  typeLabel(t: string): string {
    return ({ COMPETITION: 'Compétition', CEREMONIE: 'Cérémonie', STAGE: 'Stage', AUTRE: 'Autre' } as any)[t] ?? t;
  }

  typeColor(t: string): { bg: string; text: string } {
    return ({
      COMPETITION: { bg: 'rgba(225,6,0,0.15)',    text: '#fca5a5' },
      CEREMONIE:   { bg: 'rgba(212,175,55,0.15)', text: '#fde68a' },
      STAGE:       { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd' },
      AUTRE:       { bg: 'rgba(107,114,128,0.15)',text: '#d1d5db' },
    } as any)[t] ?? { bg: 'rgba(107,114,128,0.15)', text: '#d1d5db' };
  }

  statusLabel(s: string): string {
    return ({
      BROUILLON: 'Brouillon', PUBLIE: 'Publié', INSCRIPTIONS_OUVERTES: 'Inscriptions', EN_COURS: 'En cours', TERMINE: 'Terminé', ARCHIVE: 'Archivé'
    } as any)[s] ?? s;
  }

  statusColor(s: string): { bg: string; text: string } {
    const green = { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7' };
    const gray  = { bg: 'rgba(107,114,128,0.12)', text: '#9ca3af' };
    const blue  = { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd' };
    return ({ PUBLIE: green, INSCRIPTIONS_OUVERTES: blue, EN_COURS: blue, BROUILLON: gray, TERMINE: gray, ARCHIVE: gray } as any)[s] ?? gray;
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
