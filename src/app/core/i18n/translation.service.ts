import { Injectable, signal } from '@angular/core';
import { Locale } from './types';
import { fr, en, ar } from './locales';

const DICTS: Record<Locale, any> = { fr, en, ar };
const STORAGE_KEY = 'ftn_locale';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly locale = signal<Locale>(this.loadLocale());
  readonly hasChosenLocale = signal<boolean>(!!localStorage.getItem(STORAGE_KEY));

  constructor() {
    this.applyDocumentAttrs(this.locale());
  }

  private loadLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'fr' || stored === 'en' || stored === 'ar' ? stored : 'fr';
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    this.hasChosenLocale.set(true);
    this.applyDocumentAttrs(locale);
  }

  isRtl(): boolean {
    return this.locale() === 'ar';
  }

  private applyDocumentAttrs(locale: Locale): void {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: string, params?: Record<string, string | number>): string {
    let value = this.resolve(DICTS[this.locale()], key);
    if (value === undefined && this.locale() !== 'fr') {
      value = this.resolve(DICTS['fr'], key);
    }
    if (value === undefined) return key;
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v)),
        value
      );
    }
    return value;
  }

  private resolve(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc: any, part: string) => (acc == null ? undefined : acc[part]), obj);
  }
}
