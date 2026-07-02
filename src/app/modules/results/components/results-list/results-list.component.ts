import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

const RS: Record<string,string> = { EN_ATTENTE:'pending', VALIDE:'ok', DQ:'DQ', DNS:'DNS', DNF:'DNF' };

@Component({
  selector: 'app-results-list',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-4 mb-6">
              <span class="h-px w-10 bg-accent"></span>
              <span class="text-xs tracking-[0.3em] uppercase text-white/70">{{ 'results.list.kicker' | translate }}</span>
            </div>
            <h1 class="font-serif text-5xl lg:text-7xl leading-[0.95]">
              {{ 'results.list.titleLine1' | translate }} <br/><span class="italic text-gold">{{ 'results.list.titleItalic' | translate }}</span>
            </h1>
          </div>
          <div class="flex items-center gap-3">
            @if (auth.hasRole('ADMIN')) {
              <button (click)="router.navigate(['/results/new'])"
                class="px-5 py-2.5 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
                {{ 'results.list.addResult' | translate }}
              </button>
            }
            <a routerLink="/results/rankings"
              class="px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-sm transition-colors">
              {{ 'results.list.rankingsLink' | translate }}
            </a>
          </div>
        </div>
        <app-filter-bar
          [searchPlaceholder]="'results.list.searchPlaceholder' | translate"
          [searchValue]="search" (searchValueChange)="onSearchValue($event)"
          [groups]="filterGroups" (groupChange)="onGroupChange($event)"
          [selects]="filterSelects" (selectChange)="onSelectChange($event)" />
        @if (loading()) {
          <div class="text-white/40 text-center py-20">{{ 'common.loading' | translate }}</div>
        } @else if (results().length === 0) {
          <div class="text-white/40 text-center py-20">{{ 'common.noResults' | translate }}</div>
        } @else {
          <div>
            <div class="grid grid-cols-12 text-xs tracking-[0.2em] uppercase text-white/40 border-b border-white/10 pb-3 mb-2 px-2">
              <div class="col-span-1">{{ 'results.list.colStatus' | translate }}</div><div class="col-span-4">{{ 'results.list.colAthlete' | translate }}</div>
              <div class="col-span-3">{{ 'results.list.colEvent' | translate }}</div><div class="col-span-2">{{ 'results.list.colTime' | translate }}</div>
              <div class="col-span-1">{{ 'results.list.colFina' | translate }}</div><div class="col-span-1">{{ 'results.list.colRank' | translate }}</div>
            </div>
            @for (r of results(); track r.id) {
              <div class="grid grid-cols-12 items-center py-4 border-b border-white/10 hover:bg-white/[0.02] px-2 transition-colors">
                <div class="col-span-1"><app-status-badge [status]="r.status" /></div>
                <div class="col-span-4">
                  <div class="font-medium">{{ r.athleteName || '—' }}</div>
                  <div class="text-xs text-white/40">{{ r.clubName }}</div>
                </div>
                <div class="col-span-3 text-sm text-white/60">{{ r.eventLabel || r.competitionName }}</div>
                <div class="col-span-2">
                  <span class="font-serif text-xl" [style.color]="r.isRecord ? '#D4AF37' : 'white'">
                    {{ r.tempsDisplay || fmtMs(r.tempsMs) }}
                  </span>
                </div>
                <div class="col-span-1 text-sm text-white/50">{{ r.pointsFina || '—' }}</div>
                <div class="col-span-1 text-sm font-medium" [style.color]="r.rank <= 3 ? '#D4AF37' : ''">
                  {{ r.rank ? '#' + r.rank : '—' }}
                </div>
              </div>
            }
          </div>
        }
        <app-pagination [page]="page" [total]="total" [pageSize]="pageSize" (pageChange)="onPage($event)" />
      </section>
    </app-page-layout>
  `
})
export class ResultsListComponent implements OnInit {
  readonly results = signal<any[]>([]);
  readonly loading = signal(false);
  total = 0; page = 1; pageSize = 10;
  search = ''; gender = ''; year = '';
  readonly genders: { v: string; l: string }[];
  readonly years = [2026, 2025, 2024, 2023, 2022];

  constructor(private api: ApiService, readonly auth: AuthService, private i18n: TranslationService, readonly router: Router) {
    this.genders = [
      { v: '', l: this.i18n.t('results.list.genderAll') },
      { v: 'M', l: this.i18n.t('results.list.genderMen') },
      { v: 'F', l: this.i18n.t('results.list.genderWomen') },
    ];
  }
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const p: any = { page: this.page - 1, size: this.pageSize };
    if (this.search) {
      p['OR_PLike_athlete_nom'] = this.search;
      p['OR_PLike_athlete_prenom'] = this.search;
    }
    if (this.gender) {
      const sexeMap: Record<string, string> = { M: 'MASCULIN', F: 'FEMININ' };
      p['PEqual_athlete_sexe'] = sexeMap[this.gender] ?? this.gender;
    }
    // /resultats (ResultatController) est la table réellement utilisée par les classements et le rebuild —
    // /results (legacy) écrit dans une table disjointe, invisible depuis les classements.
    this.api.get<any>('/resultats', p).subscribe({
      next: r => {
        this.results.set((r?.data ?? r?.content ?? []).map((x: any) => ({
          ...x,
          status: RS[x.status] ?? x.status,
        })));
        this.total = r?.totalCount ?? r?.total_count ?? r?.totalElements ?? 0;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void { this.page = 1; this.load(); }
  onPage(p: number): void { this.page = p; this.load(); }

  get filterGroups() {
    return [{ options: this.genders.map(g => ({ value: g.v, label: g.l })), selected: this.gender }];
  }
  get filterSelects() {
    return [{ placeholder: this.i18n.t('results.list.yearsPlaceholder'), options: this.years.map(y => ({ value: String(y), label: String(y) })), selected: this.year }];
  }
  onSearchValue(v: string): void { this.search = v; this.onSearch(); }
  onGroupChange(e: { index: number; value: string }): void { this.gender = e.value; this.onSearch(); }
  onSelectChange(e: { index: number; value: string }): void { this.year = e.value; this.onSearch(); }

  fmtMs(ms?: number): string {
    if (!ms) return '—';
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const cents = Math.floor((ms % 1000) / 10);
    return mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}.${String(cents).padStart(2,'0')}` : `${secs}.${String(cents).padStart(2,'0')}`;
  }
}
