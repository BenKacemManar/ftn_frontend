import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Calendar, MapPin, Pencil, Trash2, Waves } from 'lucide-angular';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

const S2F: Record<string,string> = { PLANIFIEE:'upcoming',EN_COURS:'ongoing',TERMINEE:'finished',ANNULEE:'cancelled' };

@Component({
  selector: 'app-competition-detail',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <a routerLink="/competitions" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-12 transition-colors">
          <span class="rtl-flip">←</span> {{ 'competitions.detail.back' | translate }}
        </a>
        @if (loading()) {
          <div class="text-white/40 text-center py-20">{{ 'common.loading' | translate }}</div>
        } @else if (!comp()) {
          <div class="text-white/40 text-center py-20">{{ 'competitions.detail.notFound' | translate }}</div>
        } @else {
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-12">
            <div>
              <div class="flex items-center gap-4 mb-4">
                <app-status-badge [status]="comp().status" />
                <span class="text-xs tracking-[0.2em] uppercase text-white/40">{{ comp().type?.toUpperCase() }}</span>
              </div>
              <h1 class="font-serif text-4xl lg:text-6xl leading-tight">{{ comp().name }}</h1>
              <div class="mt-4 text-white/50">{{ fmtDate(comp().startDate) }} — {{ fmtDate(comp().endDate) }}</div>
            </div>
            @if (auth.hasRole('ADMIN') || auth.hasRole('COACH')) {
              <button (click)="formOpen.set(true)"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-sm transition-colors">
                <lucide-icon [img]="Pencil" class="w-4 h-4"></lucide-icon> {{ 'competitions.detail.edit' | translate }}
              </button>
            }
          </div>

          <div class="grid lg:grid-cols-3 gap-6 mb-16">
            @for (info of infos(); track info.label) {
              <div class="border-l-2 border-accent pl-4">
                <div class="text-xs tracking-[0.2em] uppercase text-white/40 mb-1">{{ info.label }}</div>
                <div class="text-lg">{{ info.value }}</div>
              </div>
            }
          </div>

          <div class="border-t border-white/10 pt-10">
            <div class="flex items-center justify-between mb-8">
              <h2 class="font-serif text-3xl">{{ 'competitions.detail.eventsTitle' | translate }}</h2>
              @if (auth.hasRole('ADMIN') || auth.hasRole('COACH')) {
                <button (click)="eventFormOpen.set(true)"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
                  {{ 'competitions.detail.addEvent' | translate }}
                </button>
              }
            </div>
            @if (events().length === 0) {
              <div class="text-white/40 py-10">{{ 'competitions.detail.noEvents' | translate }}</div>
            } @else {
              <div class="border-t border-white/10">
                @for (ev of events(); track ev.id) {
                  <div class="grid grid-cols-12 items-center py-4 border-b border-white/10 hover:bg-white/[0.02] px-2">
                    <div class="col-span-5 font-medium">{{ ev.label || (ev.distance + 'm ' + ev.swimStyle) }}</div>
                    <div class="col-span-3 text-sm text-white/50">{{ (ev.gender==='M' ? 'competitions.detail.genderMale' : 'competitions.detail.genderFemale') | translate }}</div>
                    <div class="col-span-1 text-sm text-white/50">{{ ev.ageCategory }}</div>
                    <div class="col-span-2"><app-status-badge [status]="S2F[ev.status] ?? ev.status" /></div>
                    <div class="col-span-1 flex justify-end">
                      @if (canSelfRegister()) {
                        <button (click)="registerForEvent(ev)" [disabled]="registeringEventId() === ev.id"
                          class="px-3 py-1.5 rounded-full bg-accent text-white text-xs hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                          {{ registeringEventId() === ev.id ? '…' : "S'inscrire" }}
                        </button>
                      }
                    </div>
                    @if (regMsg() && regMsg()!.eventId === ev.id) {
                      <div class="col-span-12 mt-2 text-xs" [style.color]="regMsg()!.error ? '#E10600' : '#10B981'">
                        {{ regMsg()!.text }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </section>
    </app-page-layout>

    <app-modal [open]="formOpen()" [title]="'competitions.detail.editModalTitle' | translate" (closed)="formOpen.set(false)">
      <app-competition-form [id]="id" (saved)="onFormSaved()"></app-competition-form>
    </app-modal>

    <app-modal [open]="eventFormOpen()" [title]="'competitions.detail.addEventModalTitle' | translate" (closed)="eventFormOpen.set(false)">
      @if (eventFormOpen()) {
        <app-event-form [compId]="id" (saved)="onEventSaved()" (cancelled)="eventFormOpen.set(false)"></app-event-form>
      }
    </app-modal>
  `
})
export class CompetitionDetailComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Waves = Waves;
  readonly comp = signal<any>(null);
  readonly events = signal<any[]>([]);
  readonly loading = signal(true);
  readonly formOpen = signal(false);
  readonly eventFormOpen = signal(false);
  readonly registeringEventId = signal<number | null>(null);
  readonly regMsg = signal<{ eventId: number; text: string; error: boolean } | null>(null);
  id = '';
  readonly S2F = S2F;

  constructor(private api: ApiService, private route: ActivatedRoute, readonly auth: AuthService, private i18n: TranslationService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    forkJoin([
      this.api.get<any>(`/competitions/${this.id}`),
      this.api.get<any[]>(`/events/competition/${this.id}`)
    ]).subscribe({
      next: ([c, evts]) => {
        const raw = c?.data ?? c;
        this.comp.set({ ...raw, status: S2F[raw.status] ?? raw.status });
        this.events.set(Array.isArray(evts) ? evts : (evts as any)?.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFormSaved(): void { this.formOpen.set(false); this.load(); }
  onEventSaved(): void { this.eventFormOpen.set(false); this.load(); }

  canSelfRegister(): boolean {
    return this.auth.isLoggedIn() && !this.auth.hasRole('ADMIN') && !this.auth.hasRole('COACH');
  }

  registerForEvent(ev: any): void {
    const userId = this.auth.currentUser?.id;
    if (!userId) return;
    this.registeringEventId.set(ev.id);
    this.regMsg.set(null);
    // userId (compte) et athleteId (profil sportif) sont deux entités distinctes ; on résout
    // le profil athlète lié au compte connecté via /athletes/by-user/{userId}.
    this.api.get<any>(`/athletes/by-user/${userId}`).pipe(
      switchMap(a => {
        const athleteId = (a?.data ?? a)?.id;
        return this.api.post<any>('/registrations', { athleteId, eventId: ev.id });
      })
    ).subscribe({
      next: () => {
        this.registeringEventId.set(null);
        this.regMsg.set({ eventId: ev.id, text: 'Inscription envoyée, en attente de validation.', error: false });
      },
      error: (e: any) => {
        this.registeringEventId.set(null);
        const msg = e?.status === 404 ? "Aucun profil athlète associé à ce compte." : (e?.error?.message ?? "Échec de l'inscription.");
        this.regMsg.set({ eventId: ev.id, text: msg, error: true });
      }
    });
  }

  infos() {
    const c = this.comp();
    return [
      { label: this.i18n.t('competitions.detail.info.discipline'), value: c.type || '—' },
      { label: this.i18n.t('competitions.detail.info.lane'), value: c.lane || '—' },
      { label: this.i18n.t('competitions.detail.info.city'), value: c.poolVille || '—' },
      { label: this.i18n.t('competitions.detail.info.pool'), value: c.poolNom || '—' },
      { label: this.i18n.t('competitions.detail.info.ageCategories'), value: c.ageCategories || '—' },
      { label: this.i18n.t('competitions.detail.info.registrationDeadline'), value: this.fmtDate(c.registrationDeadline) },
    ];
  }

  fmtDate(d?: string): string {
    if (!d) return '—';
    const locale = this.i18n.locale() === 'en' ? 'en-GB' : this.i18n.locale() === 'ar' ? 'ar-TN' : 'fr-FR';
    return new Date(d).toLocaleDateString(locale, { day:'2-digit', month:'long', year:'numeric' });
  }
}
