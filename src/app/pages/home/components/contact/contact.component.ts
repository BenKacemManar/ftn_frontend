import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, ArrowUpRight, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-angular";
import { RevealDirective } from "../../../../shared/reveal.directive";

@Component({
  selector: "app-contact",
  template: `
    <section id="contact" class="relative py-32 lg:py-40 border-t border-white/10">
      <div class="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5" appReveal>
          <div class="flex items-center gap-4">
            <span class="text-xs tracking-[0.3em] uppercase text-white/40">05</span>
            <span class="h-px w-10 bg-accent"></span>
            <span class="text-xs tracking-[0.3em] uppercase text-white/70">{{ 'home.contact.kicker' | translate }}</span>
          </div>
          <h2 class="font-serif text-5xl lg:text-7xl leading-[0.95] mt-8 mb-10">
            {{ 'home.contact.titleLine1' | translate }} <br />
            <span class="italic text-gold">{{ 'home.contact.titleItalic' | translate }}</span>
          </h2>

          <div class="space-y-6 text-white/70">
            <div class="flex items-start gap-4 border-b border-white/10 pb-4">
              <span class="mt-1 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gold">
                <lucide-icon [img]="Phone" class="w-4 h-4"></lucide-icon>
              </span>
              <div>
                <div class="text-[11px] tracking-[0.3em] uppercase text-white/40">{{ 'common.phone' | translate }}</div>
                <div class="text-lg mt-1">+216 71 234 567</div>
              </div>
            </div>
            <div class="flex items-start gap-4 border-b border-white/10 pb-4">
              <span class="mt-1 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gold">
                <lucide-icon [img]="Mail" class="w-4 h-4"></lucide-icon>
              </span>
              <div>
                <div class="text-[11px] tracking-[0.3em] uppercase text-white/40">{{ 'common.email' | translate }}</div>
                <div class="text-lg mt-1">natation&#64;est.org.tn</div>
              </div>
            </div>
            <div class="flex items-start gap-4 border-b border-white/10 pb-4">
              <span class="mt-1 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gold">
                <lucide-icon [img]="MapPin" class="w-4 h-4"></lucide-icon>
              </span>
              <div>
                <div class="text-[11px] tracking-[0.3em] uppercase text-white/40">{{ 'common.address' | translate }}</div>
                <div class="text-lg mt-1">Complexe El Menzah, Tunis</div>
              </div>
            </div>
          </div>

          <div class="mt-12 flex items-center gap-3">
            <a href="#" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
              <lucide-icon [img]="Instagram" class="w-4 h-4"></lucide-icon>
            </a>
            <a href="#" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
              <lucide-icon [img]="Facebook" class="w-4 h-4"></lucide-icon>
            </a>
            <a href="#" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
              <lucide-icon [img]="Youtube" class="w-4 h-4"></lucide-icon>
            </a>
          </div>
        </div>

        <form
          appReveal
          [revealDelay]="120"
          class="lg:col-span-7 lg:col-start-6 grid grid-cols-2 gap-x-8 gap-y-10"
          (ngSubmit)="onSubmit()"
        >
          <label class="relative block col-span-2 md:col-span-1">
            <span class="absolute left-0 top-0 text-[10px] tracking-[0.3em] uppercase text-white/50">{{ 'home.contact.fullName' | translate }}</span>
            <input [(ngModel)]="form.name" name="name" type="text"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pt-6 pb-3 outline-none transition-colors" />
          </label>
          <label class="relative block col-span-2 md:col-span-1">
            <span class="absolute left-0 top-0 text-[10px] tracking-[0.3em] uppercase text-white/50">{{ 'common.email' | translate }}</span>
            <input [(ngModel)]="form.email" name="email" type="email"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pt-6 pb-3 outline-none transition-colors" />
          </label>
          <label class="relative block col-span-2 md:col-span-1">
            <span class="absolute left-0 top-0 text-[10px] tracking-[0.3em] uppercase text-white/50">{{ 'common.phone' | translate }}</span>
            <input [(ngModel)]="form.phone" name="phone" type="tel"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pt-6 pb-3 outline-none transition-colors" />
          </label>
          <label class="relative block col-span-2 md:col-span-1">
            <span class="absolute left-0 top-0 text-[10px] tracking-[0.3em] uppercase text-white/50">{{ 'home.contact.programWanted' | translate }}</span>
            <input [(ngModel)]="form.program" name="program" type="text"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pt-6 pb-3 outline-none transition-colors" />
          </label>
          <label class="relative block col-span-2">
            <span class="absolute left-0 top-0 text-[10px] tracking-[0.3em] uppercase text-white/50">{{ 'home.contact.message' | translate }}</span>
            <textarea [(ngModel)]="form.message" name="message" rows="4"
              class="block w-full bg-transparent border-b border-white/20 focus:border-white pt-6 pb-3 outline-none resize-none transition-colors"></textarea>
          </label>
          <div class="col-span-2 flex items-center justify-between pt-4">
            <p class="text-xs tracking-[0.2em] uppercase text-white/40">{{ 'home.contact.responseTime' | translate }}</p>
            <button type="submit"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-accent hover:text-white rounded-full transition-colors">
              {{ 'home.contact.send' | translate }}
              <lucide-icon [img]="ArrowUpRight" class="w-4 h-4 transition-transform group-hover:rotate-45 rtl-flip"></lucide-icon>
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class ContactComponent {
  readonly ArrowUpRight = ArrowUpRight;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Instagram = Instagram;
  readonly Facebook = Facebook;
  readonly Youtube = Youtube;

  form = { name: "", email: "", phone: "", program: "", message: "" };

  onSubmit(): void {
    console.log("Form submitted", this.form);
  }
}
