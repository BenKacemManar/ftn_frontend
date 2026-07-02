import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { Participation } from '../../../../core/models/evenement.model';

const TYPE_LABELS: Record<string, string> = { COMPETITION: 'Compétition', CEREMONIE: 'Cérémonie', STAGE: 'Stage', AUTRE: 'Autre' };
const STATUS_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon', PUBLIE: 'Publié', INSCRIPTIONS_OUVERTES: 'Inscriptions ouvertes',
  EN_COURS: 'En cours', TERMINE: 'Terminé', ARCHIVE: 'Archivé',
};
const PARTICIPATION_LABELS: Record<string, string> = { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée' };

@Component({
  selector: 'app-evenement-detail',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1100px] px-6 lg:px-10 py-16">
        <a routerLink="/evenements" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-12 transition-colors">
          ← Retour aux évènements
        </a>
        @if (loading()) {
          <div class="text-white/40 text-center py-20">Chargement…</div>
        } @else if (!evt()) {
          <div class="text-white/40 text-center py-20">Évènement introuvable.</div>
        } @else {
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
            <div>
              <div class="flex items-center gap-4 mb-4">
                <span class="text-xs px-2.5 py-0.5 rounded-full"
                  [style.background]="evt().status === 'PUBLIE' || evt().status === 'INSCRIPTIONS_OUVERTES' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)'"
                  [style.color]="evt().status === 'PUBLIE' || evt().status === 'INSCRIPTIONS_OUVERTES' ? '#10B981' : '#6B7280'">
                  {{ statusLabel(evt().status) }}
                </span>
                <span class="text-xs tracking-[0.2em] uppercase text-gold">{{ typeLabel(evt().type) }}</span>
              </div>
              <h1 class="font-serif text-4xl lg:text-6xl leading-tight">{{ evt().titre }}</h1>
            </div>
            @if (evt().type === 'COMPETITION' && evt().competitionId) {
              <a [routerLink]="['/competitions', evt().competitionId]"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white hover:bg-white hover:text-black text-sm transition-colors whitespace-nowrap">
                Voir la compétition →
              </a>
            }
          </div>

          <div class="grid lg:grid-cols-3 gap-6 mb-12">
            @for (info of infos(); track info.label) {
              <div class="border-l-2 border-accent pl-4">
                <div class="text-xs tracking-[0.2em] uppercase text-white/40 mb-1">{{ info.label }}</div>
                <div class="text-lg">{{ info.value }}</div>
              </div>
            }
          </div>

          @if (evt().description) {
            <div class="mb-14 max-w-3xl">
              <p class="text-white/70 leading-relaxed whitespace-pre-line">{{ evt().description }}</p>
            </div>
          }

          <div class="border-t border-white/10 pt-10">
            <h2 class="font-serif text-3xl mb-6">Participation</h2>

            @if (!auth.isLoggedIn()) {
              <p class="text-white/50">
                <a routerLink="/auth/login" class="text-gold hover:underline">Connectez-vous</a> pour vous inscrire à cet évènement.
              </p>
            } @else {
              @if (msg()) {
                <div class="mb-6 px-4 py-3 rounded-lg border text-sm"
                  [style.borderColor]="msgError() ? '#E10600' : '#10B981'"
                  [style.color]="msgError() ? '#E10600' : '#10B981'"
                  [style.background]="msgError() ? 'rgba(225,6,0,0.08)' : 'rgba(16,185,129,0.08)'">
                  {{ msg() }}
                </div>
              }
              <div class="max-w-2xl">
                <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Message (optionnel)</label>
                <textarea [(ngModel)]="message" name="message" rows="3"
                  placeholder="Une précision pour les organisateurs…"
                  class="block w-full bg-transparent border border-white/20 focus:border-white rounded-lg px-4 py-3 outline-none resize-none transition-colors"></textarea>
                <button (click)="register()" [disabled]="registering()"
                  class="mt-4 px-8 py-3 rounded-full bg-accent text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                  {{ registering() ? '…' : "S'inscrire" }}
                </button>
              </div>
            }

            @if (auth.hasRole('ADMIN')) {
              <div class="mt-12">
                <h3 class="font-serif text-2xl mb-6">Inscrits ({{ participations().length }})</h3>
                @if (participations().length === 0) {
                  <div class="text-white/40 py-6">Aucune inscription.</div>
                } @else {
                  <div class="border border-white/10 rounded-lg overflow-hidden">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b border-white/10">
                          <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Participant</th>
                          <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden md:table-cell">Message</th>
                          <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Statut</th>
                          <th class="px-4 py-3 w-32"></th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (p of participations(); track p.id) {
                          <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td class="px-4 py-3 text-sm">{{ p.userName || ('#' + p.userId) }}</td>
                            <td class="px-4 py-3 text-sm text-white/50 hidden md:table-cell truncate max-w-xs">{{ p.message || '—' }}</td>
                            <td class="px-4 py-3">
                              <span class="text-xs px-2 py-0.5 rounded-full"
                                [style.background]="p.status === 'ACCEPTEE' ? 'rgba(16,185,129,0.15)' : p.status === 'REFUSEE' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'"
                                [style.color]="p.status === 'ACCEPTEE' ? '#10B981' : p.status === 'REFUSEE' ? '#EF4444' : '#F59E0B'">
                                {{ participationLabel(p.status) }}
                              </span>
                            </td>
                            <td class="px-4 py-3">
                              <div class="flex gap-2 justify-end">
                                <button (click)="decide(p, 'ACCEPTEE')" [disabled]="p.status==='ACCEPTEE'" class="p-1.5 hover:text-accent transition-colors disabled:opacity-30" title="Accepter">✓</button>
                                <button (click)="decide(p, 'REFUSEE')" [disabled]="p.status==='REFUSEE'" class="p-1.5 hover:text-accent transition-colors disabled:opacity-30" title="Refuser">✕</button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            }
          </div>
        }
      </section>
    </app-page-layout>
  `
})
export class EvenementDetailComponent implements OnInit {
  readonly evt = signal<any>(null);
  readonly participations = signal<Participation[]>([]);
  readonly loading = signal(true);
  readonly registering = signal(false);
  readonly msg = signal('');
  readonly msgError = signal(false);
  id = '';
  message = '';

  constructor(
    private api: ApiService,
    private svc: EvenementService,
    private route: ActivatedRoute,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.svc.getById(Number(this.id)).subscribe({
      next: r => { this.evt.set(r?.data ?? r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    if (this.auth.hasRole('ADMIN')) this.loadParticipations();
  }

  loadParticipations(): void {
    this.svc.getParticipations(Number(this.id)).subscribe({
      next: (r: any) => this.participations.set(Array.isArray(r) ? r : (r?.data ?? [])),
      error: () => this.participations.set([])
    });
  }

  register(): void {
    this.registering.set(true);
    this.msg.set('');
    // Le DTO backend exige un userId : on le résout via /auth/me.
    this.api.get<any>('/auth/me').pipe(
      switchMap(me => {
        const userId = (me?.data ?? me)?.id;
        return this.svc.register(Number(this.id), { userId, message: this.message || undefined });
      })
    ).subscribe({
      next: () => {
        this.registering.set(false);
        this.msgError.set(false);
        this.msg.set('Inscription enregistrée. En attente de validation.');
        this.message = '';
        if (this.auth.hasRole('ADMIN')) this.loadParticipations();
      },
      error: (e: any) => {
        this.registering.set(false);
        this.msgError.set(true);
        this.msg.set(e?.error?.message ?? "Échec de l'inscription.");
      }
    });
  }

  decide(p: Participation, status: 'ACCEPTEE' | 'REFUSEE'): void {
    this.svc.updateParticipationStatus(p.id, status).subscribe({ next: () => this.loadParticipations() });
  }

  infos() {
    const e = this.evt()!;
    return [
      { label: 'Début', value: this.fmtDate(e.dateDebut) },
      { label: 'Fin', value: this.fmtDate(e.dateFin) },
      { label: 'Lieu', value: e.lieu || '—' },
      { label: 'Capacité', value: e.capaciteMax ? e.capaciteMax + ' places' : 'Illimitée' },
      { label: 'Organisateur', value: e.createdByName || '—' },
    ];
  }

  typeLabel(t: string): string { return TYPE_LABELS[t] ?? t; }
  statusLabel(s: string): string { return STATUS_LABELS[s] ?? s; }
  participationLabel(s: string): string { return PARTICIPATION_LABELS[s] ?? s; }

  fmtDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
