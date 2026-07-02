import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

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
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">ID Athlète *</label>
            <input type="number" [(ngModel)]="form.athleteId" name="athleteId" required min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">ID Compétition *</label>
            <input type="number" [(ngModel)]="form.competitionId" name="competitionId" required min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div class="col-span-2">
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Épreuve * <span class="normal-case font-normal opacity-60">ex : 100m Nage Libre</span></label>
            <input type="text" [(ngModel)]="form.epreuve" name="epreuve" required
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Temps <span class="normal-case opacity-60">ex : 58.34</span></label>
            <input type="text" [(ngModel)]="form.temps" name="temps"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white font-mono">
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Rang</label>
            <input type="number" [(ngModel)]="form.rang" name="rang" min="1"
              class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
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
  form = { athleteId: '', competitionId: '', epreuve: '', temps: '', rang: null as number | null };

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const compId = this.route.snapshot.queryParamMap.get('competitionId');
    if (compId) this.form.competitionId = compId;
    if (id) {
      this.isEdit = true;
      this.api.get<any>(`/results/${id}`).subscribe({
        next: r => {
          const d = r?.data ?? r;
          this.form = {
            athleteId:    String(d.athlete_id ?? d.athleteId ?? ''),
            competitionId: String(d.competition_id ?? d.competitionId ?? ''),
            epreuve:      d.epreuve ?? '',
            temps:        d.temps   ?? '',
            rang:         d.rang    ?? null,
          };
        }
      });
    }
  }

  save(): void {
    if (!this.form.athleteId || !this.form.competitionId || !this.form.epreuve) {
      this.error.set('Athlète, Compétition et Épreuve sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const payload = {
      athlete_id:     Number(this.form.athleteId),
      competition_id: Number(this.form.competitionId),
      epreuve:        this.form.epreuve,
      temps:          this.form.temps  || null,
      rang:           this.form.rang   || null,
    };
    const id = this.route.snapshot.paramMap.get('id');
    const obs = id ? this.api.put<any>(`/results/${id}`, payload) : this.api.post<any>('/results', payload);
    obs.subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/results']); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Une erreur est survenue.'); this.saving.set(false); }
    });
  }
}
