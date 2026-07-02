import { Component } from '@angular/core';
import { TranslationService } from '../../../core/i18n/translation.service';
import { Locale, LOCALES } from '../../../core/i18n/types';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="flex items-center gap-1 rounded-full border border-white/15 p-1">
      @for (l of LOCALES; track l.code) {
        <button type="button" (click)="select(l.code)"
          class="px-2.5 py-1 rounded-full text-[11px] tracking-[0.1em] uppercase transition-colors"
          [style.background]="i18n.locale() === l.code ? '#E10600' : 'transparent'"
          [style.color]="i18n.locale() === l.code ? 'white' : 'rgba(255,255,255,0.5)'">
          {{ l.code }}
        </button>
      }
    </div>
  `
})
export class LanguageSwitcherComponent {
  readonly LOCALES = LOCALES;
  constructor(readonly i18n: TranslationService) {}

  select(code: Locale): void { this.i18n.setLocale(code); }
}
