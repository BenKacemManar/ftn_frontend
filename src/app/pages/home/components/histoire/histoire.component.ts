import { Component } from "@angular/core";
import { RevealDirective } from "../../../../shared/reveal.directive";

@Component({
  selector: "app-histoire",
  template: `
    <section id="histoire" class="relative py-32 lg:py-40">
      <div class="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
        <div class="lg:col-span-5" appReveal>
          <div class="flex items-center gap-4">
            <span class="text-xs tracking-[0.3em] uppercase text-white/40">01</span>
            <span class="h-px w-10 bg-accent"></span>
            <span class="text-xs tracking-[0.3em] uppercase text-white/70">{{ 'home.histoire.kicker' | translate }}</span>
          </div>
          <h2 class="font-serif text-5xl lg:text-7xl leading-[0.95] mt-8">
            {{ 'home.histoire.titleLine1' | translate }} <br />
            <span class="italic text-gold">{{ 'home.histoire.titleItalic' | translate }}</span> <br />
            {{ 'home.histoire.titleLine3' | translate }}
          </h2>
        </div>
        <div class="lg:col-span-6 lg:col-start-7 space-y-6 text-white/70 text-lg leading-relaxed" appReveal [revealDelay]="120">
          <p>
            {{ 'home.histoire.p1' | translate }}
          </p>
          <p>
            {{ 'home.histoire.p2' | translate }}
          </p>
          <div class="pt-4 flex items-center gap-6">
            <div class="h-px flex-1 bg-white/20"></div>
            <span class="text-xs tracking-[0.3em] uppercase text-white/40">{{ 'home.histoire.established' | translate }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HistoireComponent {}
