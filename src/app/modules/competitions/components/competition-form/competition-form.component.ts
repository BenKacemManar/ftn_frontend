import { Component, EventEmitter, Input, OnChanges, signal, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

const S2F: Record<string,string> = { PLANIFIEE:'upcoming',EN_COURS:'ongoing',TERMINEE:'finished',ANNULEE:'cancelled' };
const F2B: Record<string,string> = { upcoming:'PLANIFIEE',ongoing:'EN_COURS',finished:'TERMINEE',cancelled:'ANNULEE' };

@Component({
  selector: 'app-competition-form',
  template: `
    <div>
      @if (error()) { <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ error() }}</div> }
      @if (loading()) { <div class="text-white/40 py-6">Chargement…</div> }
      <form (ngSubmit)="submit()" class="grid grid-cols-2 gap-x-10 gap-y-8 max-w-2xl">
        <div class="col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nom *</label>
          <input [(ngModel)]="form.name" name="name" required class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Type</label>
          <select [(ngModel)]="form.type" name="type" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            @for (t of typeOpts; track t.v) { <option [value]="t.v" class="bg-[#1a0000]">{{ t.l }}</option> }
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Discipline</label>
          <select [(ngModel)]="form.discipline" name="disc" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            @for (d of discOpts; track d.v) { <option [value]="d.v" class="bg-[#1a0000]">{{ d.l }}</option> }
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Date début *</label>
          <input type="date" [(ngModel)]="form.startDate" name="sd" required class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none transition-colors text-white"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Date fin *</label>
          <input type="date" [(ngModel)]="form.endDate" name="ed" required class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none transition-colors text-white"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Ville</label>
          <input [(ngModel)]="form.city" name="city" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Bassin</label>
          <select [(ngModel)]="form.lane" name="lane" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option value="25m" class="bg-[#1a0000]">25m</option>
            <option value="50m" class="bg-[#1a0000]">50m</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Statut</label>
          <select [(ngModel)]="form.status" name="status" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            @for (s of statusOpts; track s.v) { <option [value]="s.v" class="bg-[#1a0000]">{{ s.l }}</option> }
          </select>
        </div>
        <div class="col-span-2 flex gap-4 pt-4">
          <button type="submit" [disabled]="saving()"
            class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
            {{ saving() ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CompetitionFormComponent implements OnChanges {
  @Input() id: string | null = null;
  @Output() saved = new EventEmitter<void>();

  isEdit = false;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  form = { name:'', type:'hiver', discipline:'natation', startDate:'', endDate:'', city:'', lane:'25m', status:'upcoming' };

  readonly typeOpts = [{ v:'hiver',l:'Championnat Hiver' },{ v:'ete',l:'Championnat Été' },{ v:'open',l:'Open' },{ v:'international',l:'International' }];
  readonly discOpts = [{ v:'natation',l:'Natation' },{ v:'eau-libre',l:'Eau libre' },{ v:'water-polo',l:'Water-polo' },{ v:'plongeon',l:'Plongeon' },{ v:'synchro',l:'Synchro' }];
  readonly statusOpts = [{ v:'upcoming',l:'À venir' },{ v:'ongoing',l:'En cours' },{ v:'finished',l:'Terminée' },{ v:'cancelled',l:'Annulée' }];

  constructor(private api: ApiService) {}

  ngOnChanges(): void {
    this.isEdit = !!this.id;
    this.error.set('');
    this.saving.set(false);
    if (!this.isEdit) {
      this.form = { name:'', type:'hiver', discipline:'natation', startDate:'', endDate:'', city:'', lane:'25m', status:'upcoming' };
      return;
    }
    this.loading.set(true);
    this.api.get<any>(`/competitions/${this.id}`).subscribe({
      next: r => {
        const c = r?.data ?? r;
        this.form = { name:c.name??'', type:c.type??'hiver', discipline:c.discipline??'natation',
          startDate:c.startDate?.slice(0,10)??'', endDate:c.endDate?.slice(0,10)??'',
          city:c.city??'', lane:c.lane??'25m', status:S2F[c.status]??c.status??'upcoming' };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    this.error.set(''); this.saving.set(true);
    const dto = { ...this.form, status: F2B[this.form.status] ?? this.form.status };
    const obs = this.isEdit ? this.api.put(`/competitions/${this.id}`, dto) : this.api.post('/competitions', dto);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Erreur.'); this.saving.set(false); }
    });
  }
}
