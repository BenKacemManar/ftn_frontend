import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

const ROUNDS = ['SERIES', 'DEMI_FINALE', 'FINALE'];

@Component({
  selector: 'app-result-form',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <a routerLink="/results" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-12 transition-colors">
          <span class="rtl-flip">←</span> Retour aux résultats
        </a>
        <h1 class="font-serif text-4xl mb-12">
          {{ isEdit ? 'Modifier le résultat' : 'Nouveau' }} <span class="italic text-gold">résultat.</span>
        </h1>
        @if (error()) {
          <div class="mb-8 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ error() }}</div>
        }
        <form (ngSubmit)="save()" class="grid grid-cols-2 gap-x-12 gap-y-10 max-w-2xl">
          <div class="col-span-2">
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Épreuve *</label>
            <select [(ngModel)]="form.eventId" name="eventId" required
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
              <option value="" class="bg-[#1a0000]">-- Sélectionner --</option>
              @for (e of events(); track e.id) {
                <option [value]="e.id" class="bg-[#1a0000]">#{{ e.id }} · {{ e.swimStyle }} {{ e.distance }}m · {{ e.gender }} · {{ e.scheduledDate }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">ID Athlète *</label>
            <input type="number" [(ngModel)]="form.athleteId" name="athleteId" required min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Rang *</label>
            <input type="number" [(ngModel)]="form.rank" name="rank" required min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Temps (ms) <span class="normal-case opacity-60">ex : 58340</span></label>
            <input type="number" [(ngModel)]="form.tempsMs" name="tempsMs" min="0"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white font-mono">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Temps (affiché) <span class="normal-case opacity-60">ex : 58.34</span></label>
            <input type="text" [(ngModel)]="form.tempsDisplay" name="tempsDisplay"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white font-mono">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Tour</label>
            <select [(ngModel)]="form.tour" name="tour"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
              <option value="" class="bg-[#1a0000]">—</option>
              @for (r of ROUNDS; track r) { <option [value]="r" class="bg-[#1a0000]">{{ r }}</option> }
            </select>
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Couloir</label>
            <input type="number" [(ngModel)]="form.lane" name="lane" min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div class="flex items-center gap-3 pt-6">
            <input type="checkbox" [(ngModel)]="form.isRecord" name="isRecord" id="isRecord" class="w-4 h-4">
            <label for="isRecord" class="text-sm text-white/70">Ce temps est un record</label>
          </div>
          <div class="col-span-2 flex gap-4 pt-4">
            <button type="submit" [disabled]="saving()"
              class="px-8 py-4 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
              {{ saving() ? '…' : (isEdit ? 'Modifier' : 'Enregistrer') }}
            </button>
            <a routerLink="/results"
              class="px-8 py-4 rounded-full border border-white/20 hover:border-white text-sm transition-colors">Annuler</a>
          </div>
        </form>
      </section>
    </app-page-layout>
  `
})
export class ResultFormComponent implements OnInit {
  isEdit = false;
  readonly saving = signal(false);
  readonly error = signal('');
  readonly events = signal<any[]>([]);
  readonly ROUNDS = ROUNDS;
  form: any = { eventId: '', athleteId: '', rank: null, tempsMs: null, tempsDisplay: '', tour: '', lane: null, isRecord: false };

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/events', { page: 0, size: 500 }).subscribe({
      next: r => this.events.set(r?.data ?? r?.content ?? [])
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.api.get<any>(`/resultats/${id}`).subscribe({
        next: r => {
          const d = r?.data ?? r;
          this.form = {
            eventId: String(d.eventId ?? ''),
            athleteId: String(d.athleteId ?? ''),
            rank: d.rank ?? null,
            tempsMs: d.tempsMs ?? null,
            tempsDisplay: d.tempsDisplay ?? '',
            tour: d.tour ?? '',
            lane: d.lane ?? null,
            isRecord: d.isRecord ?? false,
          };
        }
      });
    }
  }

  save(): void {
    if (!this.form.eventId || !this.form.athleteId || !this.form.rank) {
      this.error.set('Épreuve, Athlète et Rang sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const payload = {
      eventId: Number(this.form.eventId),
      athleteId: Number(this.form.athleteId),
      rank: Number(this.form.rank),
      tempsMs: this.form.tempsMs != null && this.form.tempsMs !== '' ? Number(this.form.tempsMs) : null,
      tempsDisplay: this.form.tempsDisplay || null,
      tour: this.form.tour || null,
      lane: this.form.lane != null && this.form.lane !== '' ? Number(this.form.lane) : null,
      isRecord: !!this.form.isRecord,
    };
    const id = this.route.snapshot.paramMap.get('id');
    const obs = id ? this.api.put<any>(`/resultats/${id}`, payload) : this.api.post<any>('/resultats', payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/results']); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Une erreur est survenue.'); this.saving.set(false); }
    });
  }
}
