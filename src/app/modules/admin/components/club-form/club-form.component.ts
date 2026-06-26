import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-club-form',
  template: `
    <div>
      @if (error()) { <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ error() }}</div> }
      <form (ngSubmit)="submit()" class="grid grid-cols-2 gap-x-10 gap-y-8 max-w-2xl">
        <div class="col-span-2">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Nom du club *</label>
          <input [(ngModel)]="form.nom" name="nom" required class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Ville</label>
          <input [(ngModel)]="form.ville" name="ville" class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Région</label>
          <input [(ngModel)]="form.region" name="region" class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Président</label>
          <input [(ngModel)]="form.presidentNom" name="pres" class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Date d'affiliation</label>
          <input type="date" [(ngModel)]="form.dateAffiliation" name="da" class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none transition-colors text-white"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Piscine d'entraînement</label>
          <select [(ngModel)]="form.poolId" name="pool" class="block w-full bg-[#0d0000] border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white">
            <option [ngValue]="null">— Aucune —</option>
            @for (p of pools(); track p.id) {
              <option [ngValue]="p.id">{{ p.nom }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Couloir</label>
          <input type="number" min="1" [max]="selectedPoolLanes()" [(ngModel)]="form.lane" name="lane" class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" (click)="form.actif = !form.actif"
            class="w-12 h-6 rounded-full transition-colors relative" [style.background]="form.actif?'#E10600':'rgba(255,255,255,0.1)'">
            <div class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" [class]="form.actif?'right-0.5':'left-0.5'"></div>
          </button>
          <span class="text-sm text-white/60">Actif</span>
        </div>
        <div class="col-span-2 flex gap-4 pt-4">
          <button type="submit" [disabled]="saving()" class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
            {{ saving() ? '…' : (isEdit ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClubFormComponent implements OnInit, OnChanges {
  @Input() id: string | null = null;
  @Output() saved = new EventEmitter<void>();

  isEdit = false;
  readonly saving = signal(false);
  readonly error = signal('');
  readonly pools = signal<any[]>([]);
  form: any = { nom:'', ville:'', region:'', presidentNom:'', dateAffiliation:'', actif:true, poolId:null, lane:null };

  readonly selectedPoolLanes = computed(() => {
    const p = this.pools().find(p => p.id === this.form.poolId);
    return p?.nbCouloirs ?? undefined;
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/pools', { page: 0, size: 200 }).subscribe({
      next: r => this.pools.set(r?.data ?? r?.content ?? (Array.isArray(r) ? r : []))
    });
  }

  ngOnChanges(): void {
    this.isEdit = !!this.id;
    this.error.set('');
    this.saving.set(false);
    if (!this.isEdit) {
      this.form = { nom:'', ville:'', region:'', presidentNom:'', dateAffiliation:'', actif:true, poolId:null, lane:null };
      return;
    }
    this.api.get<any>(`/clubs/${this.id}`).subscribe({
      next: r => {
        const c = r?.data ?? r;
        this.form = { nom:c.nom??'', ville:c.ville??'', region:c.region??'', presidentNom:c.presidentNom??'', dateAffiliation:c.dateAffiliation?.slice(0,10)??'', actif:c.actif??true, poolId:c.poolId??null, lane:c.lane??null };
      }
    });
  }

  submit(): void {
    this.error.set(''); this.saving.set(true);
    const obs = this.isEdit ? this.api.put(`/clubs/${this.id}`, this.form) : this.api.post('/clubs', this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'Erreur.'); this.saving.set(false); }
    });
  }
}
