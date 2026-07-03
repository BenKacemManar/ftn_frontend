import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { Inscription } from '../../../../core/models/evenement.model';

type TabFilter = 'EN_ATTENTE' | 'VALIDEE' | 'ANNULEE' | 'TOUTES';

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'Validées',   value: 'VALIDEE' },
  { label: 'Annulées',  value: 'ANNULEE' },
  { label: 'Toutes',    value: 'TOUTES' },
];

@Component({
  selector: 'app-inscriptions-admin',
  template: `
    <app-admin-layout>
      <div>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-serif text-3xl">File d'attente — Inscriptions</h1>
            <p class="text-sm text-white/40 mt-1">Inscriptions aux épreuves de compétition</p>
          </div>
          <button (click)="openCreate()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
            + Nouvelle inscription
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 flex-wrap mb-8">
          @for (tab of TABS; track tab.value) {
            <button (click)="activeTab.set(tab.value)"
              class="px-5 py-2 rounded-full text-sm border transition-colors"
              [ngClass]="activeTab() === tab.value
                ? 'bg-accent border-accent text-white'
                : 'border-white/20 text-white/60 hover:border-white/40'">
              {{ tab.label }}
              @if (countFor(tab.value) > 0) {
                <span class="ml-1.5 text-xs opacity-70">({{ countFor(tab.value) }})</span>
              }
            </button>
          }
        </div>

        @if (loading()) {
          <div class="text-white/40 text-center py-16">Chargement…</div>
        } @else {
          <div class="border border-white/10 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10 bg-white/[0.02]">
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">ID</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Athlète</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden md:table-cell">Épreuve</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Temps de base</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Statut</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Date</th>
                  <th class="px-4 py-3 w-36"></th>
                </tr>
              </thead>
              <tbody>
                @for (ins of displayedItems; track ins.id) {
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="px-4 py-3 text-white/40 text-sm">#{{ ins.id }}</td>
                    <td class="px-4 py-3 text-sm">
                      <div class="font-medium">{{ ins.athleteName || '—' }}</div>
                      @if (ins.clubName) { <div class="text-xs text-white/40">{{ ins.clubName }}</div> }
                    </td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden md:table-cell">
                      <div>{{ ins.eventLabel || ('Épreuve #' + (ins.eventId ?? '—')) }}</div>
                      @if (ins.competitionName) { <div class="text-xs text-white/30 truncate max-w-[220px]">{{ ins.competitionName }}</div> }
                    </td>
                    <td class="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">{{ ins.seedTime || '—' }}</td>
                    <td class="px-4 py-3">
                      <span class="text-xs px-2.5 py-1 rounded-full"
                        [style.background]="statusBg(ins.status)"
                        [style.color]="statusText(ins.status)">
                        {{ statusLabel(ins.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs text-white/40 hidden lg:table-cell">{{ formatDate(ins.registeredAt) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2 justify-end">
                        @if (ins.status === 'EN_ATTENTE') {
                          <button (click)="validate(ins)"
                            class="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-colors whitespace-nowrap">
                            ✓ Valider
                          </button>
                          <button (click)="cancel(ins)"
                            class="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs hover:bg-accent/20 transition-colors whitespace-nowrap">
                            ✕ Annuler
                          </button>
                        }
                        @if (ins.status !== 'EN_ATTENTE') {
                          <button (click)="doDelete(ins)"
                            class="px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-xs hover:border-white/30 transition-colors whitespace-nowrap">
                            Supprimer
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="7" class="text-white/40 text-center py-10">Aucune inscription.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </app-admin-layout>

    <!-- Create modal -->
    <app-modal [open]="formOpen()" title="Nouvelle inscription" (closed)="closeForm()">
      @if (formError()) {
        <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">
          {{ formError() }}
        </div>
      }
      <form (ngSubmit)="submitForm()" class="space-y-6">
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">ID Athlète *</label>
          <input type="number" [(ngModel)]="form.athlete_id" name="athlete_id" required min="1"
            placeholder="ex: 3"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white placeholder-white/25"/>
          <p class="text-xs text-white/30 mt-1">L'athlète doit posséder une licence VALIDEE active.</p>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">ID Épreuve *</label>
          <input type="number" [(ngModel)]="form.event_id" name="event_id" required min="1"
            placeholder="ex: 3"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white placeholder-white/25"/>
          <p class="text-xs text-white/30 mt-1">Numéro de l'épreuve dans la compétition.</p>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Temps de base</label>
          <input type="text" [(ngModel)]="form.seed_time" name="seed_time"
            placeholder="ex: 1:58.45"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white placeholder-white/25"/>
        </div>
        <div class="flex gap-4 pt-2">
          <button type="submit" [disabled]="saving()"
            class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50 text-sm">
            {{ saving() ? 'Enregistrement…' : 'Inscrire' }}
          </button>
          <button type="button" (click)="closeForm()"
            class="px-8 py-3 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">
            Annuler
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class InscriptionsAdminComponent implements OnInit {
  readonly TABS = TABS;
  readonly loading = signal(false);
  readonly allItems = signal<Inscription[]>([]);
  readonly activeTab = signal<TabFilter>('EN_ATTENTE');
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  form = { athlete_id: null as number | null, event_id: null as number | null, seed_time: '' };

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<any>('/registrations', { size: 500 }).subscribe({
      next: (res) => {
        const data: Inscription[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allItems.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.form = { athlete_id: null, event_id: null, seed_time: '' };
    this.formError.set('');
    this.formOpen.set(true);
  }

  closeForm(): void { this.formOpen.set(false); }

  submitForm(): void {
    if (!this.form.athlete_id || !this.form.event_id) {
      this.formError.set('L\'ID athlète et l\'ID épreuve sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.api.post<any>('/registrations', {
      athlete_id: Number(this.form.athlete_id),
      event_id:   Number(this.form.event_id),
      seed_time:  this.form.seed_time || null,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.activeTab.set('EN_ATTENTE');
        this.load();
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message || err?.error?.error || 'Erreur lors de l\'inscription.';
        this.formError.set(msg);
      }
    });
  }

  get displayedItems(): Inscription[] {
    const tab = this.activeTab();
    return tab === 'TOUTES' ? this.allItems() : this.allItems().filter(i => i.status === tab);
  }

  countFor(tab: TabFilter): number {
    return tab === 'TOUTES' ? this.allItems().length : this.allItems().filter(i => i.status === tab).length;
  }

  validate(ins: Inscription): void {
    this.api.put(`/registrations/${ins.id}/validate`, {}).subscribe({ next: () => this.load() });
  }

  cancel(ins: Inscription): void {
    this.api.put(`/registrations/${ins.id}/cancel`, {}).subscribe({ next: () => this.load() });
  }

  doDelete(ins: Inscription): void {
    if (!confirm(`Supprimer l'inscription #${ins.id} ?`)) return;
    this.api.delete(`/registrations/${ins.id}`).subscribe({
      next: () => this.allItems.update(l => l.filter(i => i.id !== ins.id))
    });
  }

  statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', VALIDEE: 'Validée', ANNULEE: 'Annulée' } as any)[s] ?? s;
  }
  statusBg(s: string): string {
    return ({ EN_ATTENTE: 'rgba(225,6,0,0.12)', VALIDEE: 'rgba(16,185,129,0.15)', ANNULEE: 'rgba(107,114,128,0.12)' } as any)[s] ?? 'rgba(107,114,128,0.12)';
  }
  statusText(s: string): string {
    return ({ EN_ATTENTE: '#fca5a5', VALIDEE: '#6ee7b7', ANNULEE: '#9ca3af' } as any)[s] ?? '#9ca3af';
  }
  formatDate(d: string | undefined): string {
    return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  }
}
