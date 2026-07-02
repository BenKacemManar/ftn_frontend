import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

const CAT_KEYS: Record<string, string> = {
  NATATION: 'natation', COMPETITION: 'competition', FORMATION: 'formation',
  GOUVERNANCE: 'gouvernance', INFRASTRUCTURE: 'infrastructure', GENERAL: 'general',
};

@Component({
  selector: 'app-news-detail',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[900px] px-6 lg:px-10 py-16">
        <a routerLink="/news" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-12 transition-colors"><span class="rtl-flip">←</span> {{ 'content.detail.back' | translate }}</a>
        @if (loading()) {
          <div class="text-white/40 text-center py-20">{{ 'common.loading' | translate }}</div>
        } @else if (!article()) {
          <div class="text-white/40 text-center py-20">{{ 'content.detail.notFound' | translate }}</div>
        } @else {
          @if (article().imageUrl) {
            <div class="aspect-video overflow-hidden mb-10 -mx-6 lg:-mx-10">
              <img [src]="article().imageUrl" [alt]="article().titre" class="w-full h-full object-cover" />
            </div>
          }
          <div class="flex items-center gap-4 mb-6">
            <span class="text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full text-accent" style="background:rgba(225,6,0,0.1)">
              {{ catLabel(article().categorie) }}
            </span>
            <span class="text-sm text-white/40">{{ fmtDate(article().datePublication || article().createdAt) }}</span>
            @if (article().auteurNom) {
              <span class="text-white/20">·</span>
              <span class="text-sm text-white/40">{{ article().auteurNom }}</span>
            }
          </div>
          <h1 class="font-serif text-4xl lg:text-6xl leading-tight mb-10">{{ article().titre }}</h1>
          <div class="text-white/70 text-lg leading-relaxed whitespace-pre-wrap">{{ article().contenu }}</div>
        }
      </section>
    </app-page-layout>
  `
})
export class NewsDetailComponent implements OnInit {
  readonly article = signal<any>(null);
  readonly loading = signal(true);

  constructor(private api: ApiService, private route: ActivatedRoute, private i18n: TranslationService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.get<any>(`/actualites/${id}`).subscribe({
      next: r => { this.article.set(r?.data ?? r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  fmtDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
  }

  catLabel(categorie?: string): string {
    const key = CAT_KEYS[(categorie ?? '').toUpperCase()];
    return key ? this.i18n.t('content.categories.' + key) : (categorie ?? '').toLowerCase();
  }
}
