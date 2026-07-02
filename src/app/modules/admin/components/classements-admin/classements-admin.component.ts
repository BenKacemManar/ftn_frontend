import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-classements-admin',
  template: `
    <app-admin-layout>
      <div>
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-3xl">Classements</h1>
          <div class="flex items-center gap-3">
            <button (click)="openResultat()" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white text-sm hover:border-white transition-colors">+ Nouveau résultat</button>
            <button (click)="openCreate()" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">↻ Calculer classement</button>
          </div>
        </div>
        @if (loading()) { <div class="text-white/40 text-center py-16">Chargement…</div> }
        @else {
          <div class="border border-white/10 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 w-16">Rang</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Athlète</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Épreuve</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden md:table-cell">Temps</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden md:table-cell">Saison</th>
                </tr>
              </thead>
              <tbody>
                @for (c of classements(); track c.id) {
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="px-4 py-3 font-serif text-gold">{{ c.rank }}</td>
                    <td class="px-4 py-3">
                      <div class="font-medium">{{ c.athleteName }}</div>
                      <div class="text-xs text-white/40">{{ c.clubName }}</div>
                    </td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">{{ c.swimStyle }} {{ c.distance }}m · {{ c.gender }}</td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden md:table-cell">{{ c.bestTimeDisplay }}</td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden md:table-cell">{{ c.season }}</td>
                  </tr>
                }
                @empty { <tr><td colspan="5" class="text-white/40 text-center py-10">Aucun classement.</td></tr> }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page" [total]="total" [pageSize]="20" (pageChange)="onPage($event)" />
        }
      </div>
    </app-admin-layout>

    <!-- Calculer classement modal -->
    <app-modal [open]="formOpen()" title="Calculer le classement" (closed)="formOpen.set(false)">
      <p class="text-white/50 text-sm mb-6">
        Calcule le classement d'une épreuve pour une saison à partir des résultats déjà enregistrés.
      </p>
      @if (formError()) {
        <div class="mb-4 px-4 py-3 rounded-lg text-sm bg-accent/10 border border-accent/20 text-accent/80">{{ formError() }}</div>
      }
      <div class="space-y-5">
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Épreuve</label>
          <select [(ngModel)]="form.eventId"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white">
            <option value="" class="bg-[#1a0000]">-- Sélectionner --</option>
            @for (e of events(); track e.id) {
              <option [value]="e.id" class="bg-[#1a0000]">#{{ e.id }} · {{ e.swimStyle }} {{ e.distance }}m · {{ e.gender }} · {{ e.scheduledDate }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Saison</label>
          <input type="text" [(ngModel)]="form.season" placeholder="ex. 2025"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
      </div>
      <div class="flex gap-3 mt-8">
        <button (click)="submitForm()" [disabled]="saving()"
          class="flex-1 py-3 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-40">
          {{ saving() ? 'Calcul…' : 'Calculer' }}
        </button>
        <button (click)="formOpen.set(false)" class="flex-1 py-3 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">Annuler</button>
      </div>
    </app-modal>

    <!-- Nouveau résultat modal -->
    <app-modal [open]="resultatOpen()" title="Nouveau résultat" (closed)="resultatOpen.set(false)">
      <p class="text-white/50 text-sm mb-6">
        Ajoutez le résultat d'un athlète pour une épreuve. La saison est déduite de la date de l'épreuve.
      </p>
      @if (resultatError()) {
        <div class="mb-4 px-4 py-3 rounded-lg text-sm bg-accent/10 border border-accent/20 text-accent/80">{{ resultatError() }}</div>
      }
      <div class="space-y-5">
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Épreuve *</label>
          <select [(ngModel)]="rf.eventId"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white">
            <option value="" class="bg-[#1a0000]">-- Sélectionner --</option>
            @for (e of events(); track e.id) {
              <option [value]="e.id" class="bg-[#1a0000]">#{{ e.id }} · {{ e.swimStyle }} {{ e.distance }}m · {{ e.gender }} · {{ e.scheduledDate }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">ID Athlète *</label>
          <input type="number" [(ngModel)]="rf.athleteId" min="1" placeholder="ex : 42"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Rang *</label>
          <input type="number" [(ngModel)]="rf.rank" min="1" placeholder="ex : 1"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Temps (ms) *</label>
          <input type="number" [(ngModel)]="rf.tempsMs" min="0" placeholder="ex : 58340"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
          <p class="text-white/30 text-xs mt-1">Utilisé pour le calcul du classement. 1 seconde = 1000 ms.</p>
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Temps (affiché)</label>
          <input type="text" [(ngModel)]="rf.tempsDisplay" placeholder="ex : 58.34 ou 1:02.34"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
      </div>
      <div class="flex gap-3 mt-8">
        <button (click)="submitResultat()" [disabled]="resultatSaving()"
          class="flex-1 py-3 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-40">
          {{ resultatSaving() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button (click)="resultatOpen.set(false)" class="flex-1 py-3 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">Annuler</button>
      </div>
    </app-modal>
  `
})
export class ClassementsAdminComponent implements OnInit {
  readonly classements  = signal<any[]>([]);
  readonly events       = signal<any[]>([]);
  readonly loading      = signal(false);
  readonly formOpen     = signal(false);
  readonly saving       = signal(false);
  readonly formError    = signal('');
  readonly resultatOpen   = signal(false);
  readonly resultatSaving = signal(false);
  readonly resultatError  = signal('');

  form = { eventId: '', season: '' };
  rf   = { eventId: '', athleteId: '', rank: null as number | null, tempsMs: null as number | null, tempsDisplay: '' };

  total = 0; page = 1;

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<any>('/rankings', { page: this.page - 1, size: 20, sort: 'rank' }).subscribe({
      next: r => { this.classements.set(r?.data ?? r?.content ?? []); this.total = r?.totalCount ?? r?.total_count ?? r?.totalElements ?? 0; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(p: number): void { this.page = p; this.load(); }

  private loadEvents(): void {
    if (this.events().length === 0) {
      this.api.get<any>('/events', { page: 0, size: 500 }).subscribe({
        next: r => this.events.set(r?.data ?? r?.content ?? [])
      });
    }
  }

  openCreate(): void {
    this.form = { eventId: '', season: '' };
    this.formError.set('');
    this.formOpen.set(true);
    this.loadEvents();
  }

  submitForm(): void {
    if (!this.form.eventId || !this.form.season) {
      this.formError.set('Veuillez sélectionner une épreuve et indiquer une saison.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.api.post<any>('/rankings/rebuild', { event_id: Number(this.form.eventId), season: this.form.season }).subscribe({
      next: () => { this.saving.set(false); this.formOpen.set(false); this.page = 1; this.load(); },
      error: (e: any) => { this.formError.set(e?.error?.message ?? 'Erreur lors du calcul.'); this.saving.set(false); }
    });
  }

  openResultat(): void {
    this.rf = { eventId: '', athleteId: '', rank: null, tempsMs: null, tempsDisplay: '' };
    this.resultatError.set('');
    this.resultatOpen.set(true);
    this.loadEvents();
  }

  submitResultat(): void {
    if (!this.rf.eventId || !this.rf.athleteId || this.rf.rank == null || this.rf.tempsMs == null) {
      this.resultatError.set('Épreuve, Athlète, Rang et Temps (ms) sont obligatoires.');
      return;
    }
    this.resultatSaving.set(true);
    this.resultatError.set('');
    this.api.post<any>('/resultats', {
      event_id:     Number(this.rf.eventId),
      athlete_id:   Number(this.rf.athleteId),
      rank:         this.rf.rank,
      temps_ms:     this.rf.tempsMs,
      temps_display: this.rf.tempsDisplay || null,
    }).subscribe({
      next: () => { this.resultatSaving.set(false); this.resultatOpen.set(false); },
      error: (e: any) => { this.resultatError.set(e?.error?.message ?? 'Une erreur est survenue.'); this.resultatSaving.set(false); }
    });
  }
}
