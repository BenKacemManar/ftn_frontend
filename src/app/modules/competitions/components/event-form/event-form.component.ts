import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  selector: 'app-event-form',
  template: `
    @if (error()) {
      <div class="mb-6 px-4 py-3 rounded-lg border border-accent text-accent text-sm" style="background:rgba(225,6,0,0.08)">{{ error() }}</div>
    }
    <form (ngSubmit)="submit()" class="grid grid-cols-2 gap-x-8 gap-y-8">
      <div class="col-span-2">
        <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">{{ 'competitions.eventForm.fields.scheduledDate' | translate }} *</label>
        <input type="date" [(ngModel)]="form['scheduledDate']" name="scheduledDate" required
          class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white [color-scheme:dark]">
      </div>
      @for (f of fields; track f.key) {
        <div>
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">{{ f.label }}</label>
          <select [(ngModel)]="form[f.key]" [name]="f.key"
            class="block w-full bg-transparent border-b border-white/20 pb-3 outline-none text-white">
            @for (o of f.opts; track o.v) { <option [value]="o.v" class="bg-[#1a0000]">{{ o.l }}</option> }
          </select>
        </div>
      }
      <div class="col-span-2 flex gap-4 pt-4">
        <button type="submit" [disabled]="saving()"
          class="px-8 py-4 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
          {{ saving() ? '…' : (isEdit ? ('common.update' | translate) : ('common.create' | translate)) }}
        </button>
        <button type="button" (click)="cancel()"
          class="px-8 py-4 rounded-full border border-white/20 hover:border-white text-sm transition-colors">
          {{ 'competitions.eventForm.cancel' | translate }}
        </button>
      </div>
    </form>
  `
})
export class EventFormComponent implements OnInit {
  @Input() compId = '';
  @Input() eventId = '';
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get isEdit(): boolean { return !!this.eventId; }
  readonly saving = signal(false);
  readonly error = signal('');
  form: Record<string, string> = {
    scheduledDate: '', swimStyle: 'LIBRE', distance: '50',
    gender: 'M', ageCategory: 'SENIOR', round: 'FINALE'
  };

  get fields() {
    const t = (k: string) => this.i18n.t(k);
    return [
      { key: 'swimStyle', label: t('competitions.eventForm.fields.swimStyle'), opts: [
        { v: 'LIBRE',        l: t('competitions.eventForm.swimStyleOpts.libre') },
        { v: 'DOS',          l: t('competitions.eventForm.swimStyleOpts.dos') },
        { v: 'BRASSE',       l: t('competitions.eventForm.swimStyleOpts.brasse') },
        { v: 'PAPILLON',     l: t('competitions.eventForm.swimStyleOpts.papillon') },
        { v: 'QUATRE_NAGES', l: t('competitions.eventForm.swimStyleOpts.quatreNages') },
      ] },
      { key: 'distance', label: t('competitions.eventForm.fields.distance'), opts: [
        { v: '50', l: '50m' }, { v: '100', l: '100m' }, { v: '200', l: '200m' },
        { v: '400', l: '400m' }, { v: '800', l: '800m' }, { v: '1500', l: '1500m' },
      ] },
      { key: 'gender', label: t('competitions.eventForm.fields.gender'), opts: [
        { v: 'M', l: t('competitions.eventForm.genderOpts.m') },
        { v: 'F', l: t('competitions.eventForm.genderOpts.f') },
      ] },
      { key: 'ageCategory', label: t('competitions.eventForm.fields.ageCategory'), opts: [
        { v: 'POUSSIN',  l: t('competitions.eventForm.ageCategoryOpts.poussin') },
        { v: 'BENJAMIN', l: t('competitions.eventForm.ageCategoryOpts.benjamin') },
        { v: 'MINIME',   l: t('competitions.eventForm.ageCategoryOpts.minime') },
        { v: 'CADET',    l: t('competitions.eventForm.ageCategoryOpts.cadet') },
        { v: 'JUNIOR',   l: t('competitions.eventForm.ageCategoryOpts.junior') },
        { v: 'SENIOR',   l: t('competitions.eventForm.ageCategoryOpts.senior') },
      ] },
      { key: 'round', label: t('competitions.eventForm.fields.round'), opts: [
        { v: 'SERIES',      l: t('competitions.eventForm.roundOpts.series') },
        { v: 'DEMI_FINALE', l: t('competitions.eventForm.roundOpts.demi') },
        { v: 'FINALE',      l: t('competitions.eventForm.roundOpts.finale') },
      ] },
    ];
  }

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private i18n: TranslationService,
  ) {}

  ngOnInit(): void {
    if (!this.compId) {
      this.compId = this.route.snapshot.paramMap.get('id')
        ?? this.route.snapshot.paramMap.get('compId')
        ?? '';
    }
    if (!this.eventId) {
      this.eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
    }
    if (!this.isEdit) return;
    this.api.get<any>(`/events/${this.eventId}`).subscribe({
      next: r => {
        const e = r?.data ?? r;
        this.form = {
          scheduledDate: e.scheduledDate ?? '',
          swimStyle:     e.swimStyle     ?? 'LIBRE',
          distance:      String(e.distance ?? 50),
          gender:        e.gender        ?? 'M',
          ageCategory:   e.ageCategory   ?? 'SENIOR',
          round:         e.round         ?? 'FINALE',
        };
      }
    });
  }

  submit(): void {
    if (!this.form['scheduledDate']) {
      this.error.set(this.i18n.t('competitions.eventForm.error'));
      return;
    }
    this.error.set('');
    this.saving.set(true);
    const dto = {
      competitionId:  Number(this.compId),
      swimStyle:      this.form['swimStyle'],
      distance:       this.form['distance'],
      gender:         this.form['gender'],
      ageCategory:    this.form['ageCategory'],
      round:          this.form['round'],
      scheduledDate:  this.form['scheduledDate'],
    };
    const obs = this.isEdit
      ? this.api.put(`/events/${this.eventId}`, dto)
      : this.api.post('/events', dto);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.saved.observed) { this.saved.emit(); }
        else { this.router.navigate(['/competitions', this.compId]); }
      },
      error: (e: any) => {
        this.error.set(e?.error?.message ?? this.i18n.t('competitions.eventForm.error'));
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.cancelled.observed) { this.cancelled.emit(); }
    else { this.router.navigate(['/competitions', this.compId]); }
  }
}
