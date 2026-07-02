import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

const CATS = ['','POUSSIN','BENJAMIN','MINIME','CADET','JUNIOR','SENIOR'];

@Component({
  selector: 'app-athletes-list',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-4 mb-6">
              <span class="h-px w-10 bg-accent"></span>
              <span class="text-xs tracking-[0.3em] uppercase text-white/70">{{ 'athletesClubs.athletesList.kicker' | translate }}</span>
            </div>
            <h1 class="font-serif text-5xl lg:text-7xl leading-[0.95]">
              {{ 'athletesClubs.athletesList.titleLine1' | translate }} <span class="italic text-gold">{{ 'athletesClubs.athletesList.titleItalic' | translate }}</span>
            </h1>
          </div>
          <a routerLink="/athletes/clubs" class="px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-sm transition-colors">{{ 'athletesClubs.athletesList.viewClubs' | translate }}</a>
        </div>

        <app-filter-bar
          [searchPlaceholder]="'athletesClubs.athletesList.searchPlaceholder' | translate"
          [searchValue]="search"
          (searchValueChange)="onSearchValue($event)"
          [groups]="filterGroups"
          (groupChange)="onFilterGroupChange($event)" />

        @if (loading()) {
          <div class="text-white/40 text-center py-20">{{ 'common.loading' | translate }}</div>
        } @else if (page_items().length === 0) {
          <div class="text-white/40 text-center py-20">{{ 'athletesClubs.athletesList.empty' | translate }}</div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (a of page_items(); track a.id) {
              <a [routerLink]="['/athletes', a.id]" class="group block">
                <div class="relative aspect-[3/4] overflow-hidden mb-4 bg-[#1a0000]">
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="font-serif text-5xl text-white/20">{{ initials(a) }}</span>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div class="absolute top-3 left-3 text-[10px] tracking-[0.2em] uppercase text-gold">{{ categoryLabel(a.categorie) }}</div>
                  <div class="absolute bottom-4 left-4 right-4">
                    <div class="font-serif text-lg">{{ a.prenom }} {{ a.nom }}</div>
                    <div class="text-xs text-white/50 mt-1">{{ a.nationalite }}</div>
                  </div>
                </div>
              </a>
            }
          </div>
        }
        <app-pagination [page]="page" [total]="filtered().length" [pageSize]="12" (pageChange)="onPage($event)" />
      </section>
    </app-page-layout>
  `
})
export class AthletesListComponent implements OnInit {
  readonly all = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchSig = signal('');
  readonly categorySig = signal('');
  readonly genderSig = signal('');
  readonly pageSig = signal(1);
  readonly CATS = CATS;
  get GENDERS() {
    return [
      { v: '', l: this.i18n.t('athletesClubs.athletesList.genderAll') },
      { v: 'MASCULIN', l: this.i18n.t('athletesClubs.athletesList.genderMale') },
      { v: 'FEMININ', l: this.i18n.t('athletesClubs.athletesList.genderFemale') },
    ];
  }

  get search(): string { return this.searchSig(); }
  get category(): string { return this.categorySig(); }
  get gender(): string { return this.genderSig(); }
  get page(): number { return this.pageSig(); }

  readonly filtered = computed(() => {
    const q = this.searchSig().toLowerCase();
    const cat = this.categorySig();
    const gen = this.genderSig();
    return this.all().filter(a =>
      (!q || `${a.prenom} ${a.nom}`.toLowerCase().includes(q)) &&
      (!cat || a.categorie === cat) &&
      (!gen || a.sexe === gen)
    );
  });

  readonly page_items = computed(() => {
    const start = (this.pageSig() - 1) * 12;
    return this.filtered().slice(start, start + 12);
  });

  constructor(private api: ApiService, private i18n: TranslationService) {}
  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<any>('/athletes', { page: 0, size: 500 }).subscribe({
      next: r => { this.all.set(r?.data ?? r?.content ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  categoryLabel(c: string): string {
    const map: Record<string, string> = {
      POUSSIN: 'athletesClubs.categories.poussin',
      BENJAMIN: 'athletesClubs.categories.benjamin',
      MINIME: 'athletesClubs.categories.minime',
      CADET: 'athletesClubs.categories.cadet',
      JUNIOR: 'athletesClubs.categories.junior',
      SENIOR: 'athletesClubs.categories.senior',
    };
    return map[c] ? this.i18n.t(map[c]) : this.i18n.t('athletesClubs.athletesList.categoryAll');
  }

  get filterGroups() {
    return [
      { options: this.CATS.map(c => ({ value: c, label: this.categoryLabel(c) })), selected: this.category },
      { options: this.GENDERS.map(g => ({ value: g.v, label: g.l })), selected: this.gender },
    ];
  }

  onSearchValue(v: string): void { this.searchSig.set(v); this.pageSig.set(1); }

  onFilterGroupChange(e: { index: number; value: string }): void {
    if (e.index === 0) this.categorySig.set(e.value);
    else this.genderSig.set(e.value);
    this.pageSig.set(1);
  }

  onPage(p: number): void { this.pageSig.set(p); }
  initials(a: any): string { return `${(a.prenom||'')[0]??''}${(a.nom||'')[0]??''}`.toUpperCase(); }
}
