import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { EvenementService } from '../../../evenements/services/evenement.service';
import { EvenementType } from '../../../../core/models/evenement.model';

const TYPES: { value: EvenementType; label: string }[] = [
  { value: 'COMPETITION', label: 'Compétition' },
  { value: 'CEREMONIE',   label: 'Cérémonie' },
  { value: 'STAGE',       label: 'Stage' },
  { value: 'AUTRE',       label: 'Autre' },
];

@Component({
  selector: 'app-evenement-form',
  template: `
    <div>
      @if (error()) {
        <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ error() }}</div>
      }
      <form (ngSubmit)="submit()" class="space-y-6">
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Type *</label>
          <select [(ngModel)]="form.type" name="type" required
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            <option value="" class="bg-[#1a0000]">Sélectionner…</option>
            @for (t of TYPES; track t.value) {
              <option [value]="t.value" class="bg-[#1a0000]">{{ t.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Titre *</label>
          <input [(ngModel)]="form.titre" name="titre" required
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Description</label>
          <textarea [(ngModel)]="form.description" name="description" rows="4"
            class="block w-full bg-transparent border border-white/20 focus:border-white rounded-lg px-4 py-3 outline-none resize-none transition-colors"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Début *</label>
            <input type="datetime-local" [(ngModel)]="form.dateDebut" name="debut" required
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white" [style.colorScheme]="'dark'"/>
          </div>
          <div>
            <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Fin *</label>
            <input type="datetime-local" [(ngModel)]="form.dateFin" name="fin" required
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors text-white" [style.colorScheme]="'dark'"/>
          </div>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Lieu</label>
          <input [(ngModel)]="form.lieu" name="lieu"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">Capacité max</label>
          <input type="number" [(ngModel)]="form.capaciteMax" name="cap" min="1"
            class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors"/>
        </div>
        <div class="flex gap-4 pt-2">
          <button type="submit" [disabled]="saving()"
            class="px-8 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
            {{ saving() ? '…' : (isEdit ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class EvenementFormComponent implements OnChanges {
  @Input() id: string | null = null;
  @Output() saved = new EventEmitter<void>();

  readonly TYPES = TYPES;
  readonly saving = signal(false);
  readonly error = signal('');
  isEdit = false;

  form: any = { type: '', titre: '', description: '', dateDebut: '', dateFin: '', lieu: '', capaciteMax: null };

  constructor(private svc: EvenementService) {}

  ngOnChanges(): void {
    this.isEdit = !!this.id;
    this.error.set('');
    this.saving.set(false);
    if (!this.isEdit) {
      this.form = { type: '', titre: '', description: '', dateDebut: '', dateFin: '', lieu: '', capaciteMax: null };
      return;
    }
    this.svc.getById(Number(this.id)).subscribe({
      next: (res) => {
        const ev = res?.data ?? res;
        this.form = {
          type: ev.type ?? '',
          titre: ev.titre ?? '',
          description: ev.description ?? '',
          dateDebut: ev.dateDebut ? ev.dateDebut.substring(0, 16) : '',
          dateFin:   ev.dateFin   ? ev.dateFin.substring(0, 16)   : '',
          lieu: ev.lieu ?? '',
          capaciteMax: ev.capaciteMax ?? null,
        };
      }
    });
  }

  submit(): void {
    if (!this.form.type || !this.form.titre || !this.form.dateDebut || !this.form.dateFin) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const dto = {
      type: this.form.type,
      titre: this.form.titre,
      description: this.form.description || null,
      dateDebut: this.form.dateDebut,
      dateFin: this.form.dateFin,
      lieu: this.form.lieu || null,
      capaciteMax: this.form.capaciteMax ? Number(this.form.capaciteMax) : null,
    };
    const req = this.isEdit
      ? this.svc.update(Number(this.id), dto)
      : this.svc.create(dto);
    req.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: (err: any) => { this.saving.set(false); this.error.set(err?.error?.message || 'Une erreur est survenue.'); }
    });
  }
}
