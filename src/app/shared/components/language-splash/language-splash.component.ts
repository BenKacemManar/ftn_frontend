import { Component, signal } from '@angular/core';
import { TranslationService } from '../../../core/i18n/translation.service';
import { Locale } from '../../../core/i18n/types';

interface LangOption {
  code: Locale;
  native: string;
  tagline: string;
  script: string;
}

const OPTIONS: LangOption[] = [
  { code: 'fr', native: 'Français', tagline: 'Entrer en français', script: 'latin' },
  { code: 'en', native: 'English', tagline: 'Continue in English', script: 'latin' },
  { code: 'ar', native: 'العربية', tagline: 'الدخول بالعربية', script: 'arabic' },
];

@Component({
  selector: 'app-language-splash',
  template: `
    @if (!i18n.hasChosenLocale()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-opacity duration-500"
        [style.opacity]="closing() ? 0 : 1"
        style="background:radial-gradient(ellipse at 50% 30%, #1a0000 0%, #0a0000 70%)">

        <div class="grain"></div>

        <div class="absolute inset-0 pointer-events-none pulse-blood"
          style="background: radial-gradient(circle at 50% 15%, rgba(225,6,0,0.25) 0%, transparent 55%)"></div>

        @for (e of embers; track $index) {
          <div class="ember"
            [style.left]="e.x" [style.width]="e.size" [style.height]="e.size"
            [style.--d]="e.d" [style.--dl]="e.dl" [style.--ex]="e.ex"></div>
        }

        <div class="relative z-10 w-full max-w-3xl px-6 text-center">
          <div class="flex flex-col items-center anim-up">
            <div class="w-24 h-24 rounded-full p-1 border-2 border-blood-gold mb-6">
              <img src="assets/logo.png" alt="EST" class="w-full h-full object-cover rounded-full"/>
            </div>
            <div class="text-[11px] tracking-[0.4em] uppercase text-white/50">Tunis · 1919</div>
            <h1 class="font-serif text-4xl lg:text-6xl mt-3 shimmer-gold tracking-tight">
              Espérance Sportive de Tunis
            </h1>
            <div class="mt-2 text-xs lg:text-sm tracking-[0.3em] uppercase text-white/60">
              Section Natation · Swimming Section · قسم السباحة
            </div>
            <div class="h-px w-24 mt-8 opacity-70" style="background:linear-gradient(90deg,#E10600,#D4AF37)"></div>
          </div>

          <div class="mt-10 text-xs lg:text-sm tracking-[0.2em] uppercase text-white/40 anim-up-d1">
            Choisissez votre langue · Choose your language · اختر لغتك
          </div>

          <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 anim-up-d2">
            @for (opt of OPTIONS; track opt.code) {
              <button type="button" (click)="choose(opt.code)"
                class="group relative px-6 py-8 rounded-xl border border-white/15 hover:border-gold bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300">
                <div class="font-serif text-3xl" [class.text-right]="opt.script === 'arabic'">{{ opt.native }}</div>
                <div class="mt-3 text-xs text-white/40 group-hover:text-white/70 transition-colors">{{ opt.tagline }}</div>
                <span class="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-accent to-gold scale-x-0 origin-center group-hover:scale-x-100 transition-transform"></span>
              </button>
            }
          </div>

          <div class="mt-12 text-[10px] tracking-[0.3em] uppercase text-white/30 anim-up-d3">
            Club fondé en 1919 · Sang &amp; Or
          </div>
        </div>
      </div>
    }
  `
})
export class LanguageSplashComponent {
  readonly OPTIONS = OPTIONS;
  readonly closing = signal(false);
  readonly embers = [
    { x: '15%', size: '4px', d: '3.4s', dl: '0s', ex: '10px' },
    { x: '30%', size: '3px', d: '4.2s', dl: '0.8s', ex: '-8px' },
    { x: '50%', size: '5px', d: '3.0s', dl: '1.5s', ex: '12px' },
    { x: '70%', size: '3px', d: '3.9s', dl: '0.4s', ex: '-6px' },
    { x: '85%', size: '4px', d: '4.4s', dl: '1.1s', ex: '8px' },
  ];

  constructor(readonly i18n: TranslationService) {}

  choose(code: Locale): void {
    this.closing.set(true);
    setTimeout(() => this.i18n.setLocale(code), 480);
  }
}
