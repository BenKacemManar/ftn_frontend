import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/i18n/translation.service';

const CATS = ['POUSSIN','BENJAMIN','MINIME','CADET','JUNIOR','SENIOR'];

const STATUT_COLORS: Record<string, string> = {
  VALIDE:     'color:#86efac;background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.3)',
  EN_ATTENTE: 'color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.15)',
  REJETE:     'color:#fca5a5;background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3)',
  DISQUALIFIE:'color:#fca5a5;background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3)',
};

const STATUT_LABEL_KEYS: Record<string, string> = {
  VALIDE: 'athletesClubs.detail.status.valide',
  EN_ATTENTE: 'athletesClubs.detail.status.enAttente',
  REJETE: 'athletesClubs.detail.status.rejete',
  DISQUALIFIE: 'athletesClubs.detail.status.disqualifie',
};

@Component({
  selector: 'app-athlete-detail',
  template: `
    <app-page-layout>
      @if (loading()) {
        <div class="text-white/40 text-center py-40">{{ 'common.loading' | translate }}</div>
      } @else if (!athlete()) {
        <div class="text-white/40 text-center py-40">{{ 'athletesClubs.detail.athleteNotFound' | translate }}</div>
      } @else {

        <!-- Hero -->
        <div class="relative border-b border-white/10 bg-[#0d0000]/60">
          <div class="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
            <a routerLink="/athletes"
              class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
              {{ 'athletesClubs.detail.backToAthletes' | translate }}
            </a>
            <div class="flex flex-wrap items-start gap-8 mb-8">
              <div class="w-20 h-20 rounded-full bg-[#1a0000] border border-white/10 flex items-center justify-center flex-shrink-0">
                <span class="font-serif text-2xl text-white/40">{{ initials() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  @if (athlete().categorie) {
                    <span class="px-3 py-1 rounded-full text-xs border border-accent text-accent">
                      {{ categoryLabel(athlete().categorie) }}
                    </span>
                  }
                  <span class="text-xs text-white/40">
                    {{ athlete().sexe === 'MASCULIN' ? ('athletesClubs.detail.genderMale' | translate) : ('athletesClubs.detail.genderFemale' | translate) }}
                  </span>
                </div>
                <h1 class="font-serif text-3xl lg:text-5xl mb-2">
                  {{ athlete().prenom }} {{ athlete().nom }}
                </h1>
                @if (athlete().nationalite) {
                  <div class="text-white/50">{{ athlete().nationalite }}</div>
                }
              </div>
              @if (auth.hasRole('ADMIN')) {
                <button (click)="openEdit()"
                  class="px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-sm transition-colors self-start">
                  {{ 'common.edit' | translate }}
                </button>
              }
            </div>

            <!-- Stat cards -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                <div class="text-2xl font-serif text-gold mb-1">{{ age() ?? '—' }}</div>
                <div class="text-xs text-white/50">{{ 'athletesClubs.detail.years' | translate }}</div>
              </div>
              <div class="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                @if (athlete().club_id ?? athlete().clubId) {
                  <a [routerLink]="['/athletes/clubs', athlete().club_id ?? athlete().clubId]"
                    class="text-sm font-medium hover:text-accent transition-colors line-clamp-1">
                    {{ athlete().club_nom ?? athlete().clubNom || '—' }}
                  </a>
                } @else {
                  <div class="text-sm font-medium">{{ athlete().club_nom ?? athlete().clubNom || '—' }}</div>
                }
                <div class="text-xs text-white/50 mt-1">{{ 'athletesClubs.detail.club' | translate }}</div>
              </div>
              <div class="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                <div class="text-2xl font-serif text-gold mb-1">{{ results().length }}</div>
                <div class="text-xs text-white/50">{{ 'athletesClubs.detail.results' | translate }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 space-y-12">

          <!-- Personal info -->
          <section>
            <h2 class="font-serif text-2xl mb-6">{{ 'athletesClubs.detail.informations' | translate }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for (info of infos(); track info.label) {
                <div class="border-l-2 border-accent pl-4">
                  <div class="text-xs tracking-[0.2em] uppercase text-white/40 mb-1">{{ info.label }}</div>
                  <div class="text-sm">{{ info.value }}</div>
                </div>
              }
            </div>
          </section>

          <!-- Licences -->
          @if (licences().length > 0) {
            <section>
              <h2 class="font-serif text-2xl mb-6">{{ 'athletesClubs.detail.licences' | translate }}</h2>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (lic of licences(); track lic.id) {
                  <div class="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div class="font-medium">{{ lic.numero || '#' + lic.id }}</div>
                        <div class="text-xs text-white/40 mt-1">{{ lic.type }}</div>
                      </div>
                      <span class="inline-block px-2.5 py-1 rounded-full text-xs border"
                        [style]="statutStyle(lic.statut)">
                        {{ statutLabel(lic.statut) }}
                      </span>
                    </div>
                    <div class="text-xs text-white/40">
                      {{ fmtDate(lic.dateDebut) }} — {{ fmtDate(lic.dateExpiration) }}
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Results -->
          @if (results().length > 0) {
            <section>
              <h2 class="font-serif text-2xl mb-6">
                {{ 'athletesClubs.detail.competitionResults' | translate }}
                <span class="text-white/30 text-lg font-sans ml-2">({{ results().length }})</span>
              </h2>
              <div class="border border-white/10 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-white/10 bg-white/[0.02]">
                      <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-5 py-3">{{ 'athletesClubs.detail.table.competition' | translate }}</th>
                      <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-5 py-3 hidden sm:table-cell">{{ 'athletesClubs.detail.table.event' | translate }}</th>
                      <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-5 py-3">{{ 'athletesClubs.detail.table.time' | translate }}</th>
                      <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-5 py-3 hidden md:table-cell">{{ 'athletesClubs.detail.table.rank' | translate }}</th>
                      <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-5 py-3">{{ 'athletesClubs.detail.table.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of results(); track r.id) {
                      <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td class="px-5 py-4">
                          <div class="text-sm font-medium">{{ r.competitionNom }}</div>
                        </td>
                        <td class="px-5 py-4 hidden sm:table-cell">
                          <span class="text-sm text-white/70">{{ r.epreuve || '—' }}</span>
                        </td>
                        <td class="px-5 py-4">
                          <span class="font-mono text-sm text-gold">{{ r.temps || '—' }}</span>
                        </td>
                        <td class="px-5 py-4 hidden md:table-cell">
                          @if (r.rang) {
                            <span class="font-serif text-lg">{{ r.rang }}</span>
                            <span class="text-xs text-white/40 ml-1">{{ 'athletesClubs.detail.table.rankSuffix' | translate }}</span>
                          } @else {
                            <span class="text-white/30">—</span>
                          }
                        </td>
                        <td class="px-5 py-4">
                          <span class="inline-block px-2.5 py-1 rounded-full text-xs border"
                            [style]="statutStyle(r.statut)">
                            {{ statutLabel(r.statut) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          }

        </div>
      }
    </app-page-layout>

    <!-- Edit modal -->
    <app-modal [open]="editOpen()" title="Modifier l'athlète" (closed)="editOpen.set(false)">
      @if (editError()) {
        <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ editError() }}</div>
      }
      <form (ngSubmit)="submitEdit()" class="grid grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Prénom *</label>
          <input [(ngModel)]="editForm.prenom" name="prenom" required
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nom *</label>
          <input [(ngModel)]="editForm.nom" name="nom" required
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Date de naissance *</label>
          <input type="date" [(ngModel)]="editForm.date_naissance" name="dn" required
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none transition-colors text-white" [style.colorScheme]="'dark'"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nationalité *</label>
          <input [(ngModel)]="editForm.nationalite" name="nat" required
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Catégorie</label>
          <select [(ngModel)]="editForm.categorie" name="cat"
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option value="" class="bg-[#1a0000]">Sélectionner…</option>
            @for (c of CATS; track c) { <option [value]="c" class="bg-[#1a0000]">{{ c.charAt(0)+c.slice(1).toLowerCase() }}</option> }
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Sexe</label>
          <select [(ngModel)]="editForm.sexe" name="sexe"
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option value="" class="bg-[#1a0000]">Sélectionner…</option>
            <option value="MASCULIN" class="bg-[#1a0000]">Masculin</option>
            <option value="FEMININ" class="bg-[#1a0000]">Féminin</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Email</label>
          <input type="email" [(ngModel)]="editForm.email" name="email"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Téléphone</label>
          <input type="tel" [(ngModel)]="editForm.telephone" name="tel"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div class="col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Club</label>
          <select [(ngModel)]="editForm.club_id" name="club"
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option [value]="null" class="bg-[#1a0000]">Sans club</option>
            @for (c of clubs(); track c.id) { <option [value]="c.id" class="bg-[#1a0000]">{{ c.nom }}</option> }
          </select>
        </div>
        <div class="col-span-2 flex gap-4 pt-2">
          <button type="submit" [disabled]="editSaving()"
            class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50 text-sm">
            {{ editSaving() ? '…' : 'Mettre à jour' }}
          </button>
          <button type="button" (click)="editOpen.set(false)"
            class="px-8 py-3 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">
            Annuler
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class AthleteDetailComponent implements OnInit {
  readonly athlete = signal<any>(null);
  readonly licences = signal<any[]>([]);
  readonly results = signal<any[]>([]);
  readonly loading = signal(true);
  readonly clubs = signal<any[]>([]);
  readonly editOpen = signal(false);
  readonly editSaving = signal(false);
  readonly editError = signal('');
  readonly CATS = CATS;
  editForm: any = {};
  id = '';

  readonly age = computed(() => {
    const a = this.athlete();
    const dob = a?.date_naissance ?? a?.dateNaissance;
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  });

  constructor(private api: ApiService, private route: ActivatedRoute, readonly auth: AuthService, private i18n: TranslationService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    forkJoin([
      this.api.get<any>(`/athletes/${this.id}`),
      this.api.get<any>(`/athletes/${this.id}/licences`).pipe(catchError(() => of([]))),
      this.api.get<any>(`/results/athlete/${this.id}`).pipe(catchError(() => of([]))),
    ]).subscribe({
      next: ([a, l, r]) => {
        this.athlete.set(a?.data ?? a);
        this.licences.set(Array.isArray(l) ? l : (l?.data ?? []));
        this.results.set(Array.isArray(r) ? r : (r?.data ?? []));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.api.get<any>('/clubs', { page: 0, size: 200 }).subscribe({
      next: r => this.clubs.set(r?.data ?? r?.content ?? [])
    });
  }

  openEdit(): void {
    const a = this.athlete();
    this.editForm = {
      prenom:        a.prenom ?? '',
      nom:           a.nom ?? '',
      date_naissance: (a.date_naissance ?? a.dateNaissance ?? '').slice(0, 10),
      nationalite:   a.nationalite ?? '',
      categorie:     a.categorie ?? '',
      sexe:          a.sexe ?? '',
      email:         a.email ?? '',
      telephone:     a.telephone ?? '',
      club_id:       a.club_id ?? a.clubId ?? null,
    };
    this.editError.set('');
    this.editOpen.set(true);
  }

  submitEdit(): void {
    this.editSaving.set(true);
    this.editError.set('');
    this.api.put(`/athletes/${this.id}`, this.editForm).subscribe({
      next: (res: any) => {
        this.athlete.set(res?.data ?? res);
        this.editSaving.set(false);
        this.editOpen.set(false);
      },
      error: (e: any) => {
        this.editError.set(e?.error?.message ?? 'Erreur lors de la mise à jour.');
        this.editSaving.set(false);
      }
    });
  }

  initials(): string {
    const a = this.athlete();
    return `${(a?.prenom ?? '')[0] ?? ''}${(a?.nom ?? '')[0] ?? ''}`.toUpperCase();
  }

  infos() {
    const a = this.athlete();
    return [
      { label: this.i18n.t('athletesClubs.detail.birth'), value: this.fmtDate(a.date_naissance ?? a.dateNaissance) },
      { label: this.i18n.t('athletesClubs.detail.nationality'), value: a.nationalite || this.i18n.t('common.unavailable') },
      { label: this.i18n.t('common.email'), value: a.email || this.i18n.t('common.unavailable') },
      { label: this.i18n.t('common.phone'), value: a.telephone || this.i18n.t('common.unavailable') },
    ];
  }

  categoryLabel(c?: string): string {
    const map: Record<string, string> = {
      POUSSIN: 'athletesClubs.categories.poussin',
      BENJAMIN: 'athletesClubs.categories.benjamin',
      MINIME: 'athletesClubs.categories.minime',
      CADET: 'athletesClubs.categories.cadet',
      JUNIOR: 'athletesClubs.categories.junior',
      SENIOR: 'athletesClubs.categories.senior',
    };
    return c && map[c] ? this.i18n.t(map[c]) : this.i18n.t('athletesClubs.categories.autre');
  }

  fmtDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  statutStyle(statut?: string): string {
    return STATUT_COLORS[statut ?? ''] ?? STATUT_COLORS['EN_ATTENTE'];
  }

  statutLabel(statut?: string): string {
    const key = STATUT_LABEL_KEYS[statut ?? ''];
    return key ? this.i18n.t(key) : (statut ?? '—');
  }
}
