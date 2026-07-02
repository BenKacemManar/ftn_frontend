import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User, Trophy, Building2, Droplet, Newspaper, CreditCard, Award, Plus } from 'lucide-angular';
import { ApiService } from '../../../../core/services/api.service';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

const STAT_DEFS = [
  { key:'nbAthletes', label:'Athlètes', icon:User, color:'#3B82F6', link:'/admin/athletes' },
  { key:'nbCompetitions', label:'Compétitions', icon:Trophy, color:'#E10600', link:'/competitions' },
  { key:'nbClubs', label:'Clubs', icon:Building2, color:'#8B5CF6', link:'/admin/clubs' },
  { key:'nbPiscines', label:'Piscines', icon:Droplet, color:'#D4AF37', link:'/admin/pools' },
];

const QUICK_LINKS = [
  { label:'Nouvelle compétition', to:'/competitions/new', icon:Trophy },
  { label:'Ajouter un athlète', to:'/admin/athletes', icon:User },
  { label:'Rédiger actualité', to:'/admin/news', icon:Newspaper },
  { label:'Nouvelle licence', to:'/admin/licences', icon:CreditCard },
  { label:'Nouveau club', to:'/admin/clubs', icon:Building2 },
  { label:'Gérer les classements', to:'/admin/classements', icon:Award },
];

@Component({
  selector: 'app-dashboard',
  template: `
    <app-admin-layout>
      <div>
        <div class="mb-10">
          <div class="flex items-center gap-4 mb-4">
            <span class="h-px w-10 bg-accent"></span>
            <span class="text-xs tracking-[0.3em] uppercase text-white/50">Administration</span>
          </div>
          <h1 class="font-serif text-3xl lg:text-4xl">Tableau de bord</h1>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          @for (s of statDefs; track s.key) {
            <a [routerLink]="s.link" class="block p-5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" [style.background]="s.color + '20'" [style.color]="s.color">
                  <lucide-icon [img]="s.icon" class="w-5 h-5"></lucide-icon>
                </div>
                <span class="font-serif text-3xl text-gold">{{ stats()[s.key] ?? '—' }}</span>
              </div>
              <div class="text-sm text-white/60">{{ s.label }}</div>
            </a>
          }
        </div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-serif text-xl">Actions rapides</h2>
          <button (click)="openCreate()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
            + Nouveau résultat
          </button>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          @for (l of quickLinks; track l.label) {
            <a [routerLink]="l.to"
              class="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.02] transition-all text-sm">
              <lucide-icon [img]="l.icon" class="w-5 h-5 text-white/50"></lucide-icon>
              <span class="text-white/70">{{ l.label }}</span>
            </a>
          }
        </div>
      </div>
    </app-admin-layout>

    <app-modal [open]="formOpen()" title="Nouveau résultat" (closed)="formOpen.set(false)">
      <p class="text-white/50 text-sm mb-6">
        Enregistrez un résultat de compétition pour un athlète.
      </p>
      @if (formError()) {
        <div class="mb-4 px-4 py-3 rounded-lg text-sm bg-accent/10 border border-accent/20 text-accent/80">{{ formError() }}</div>
      }
      <div class="space-y-5">
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">ID Athlète *</label>
          <input type="number" [(ngModel)]="form.athleteId" min="1" placeholder="ex : 42"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">ID Compétition *</label>
          <input type="number" [(ngModel)]="form.competitionId" min="1" placeholder="ex : 7"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Épreuve *</label>
          <input type="text" [(ngModel)]="form.epreuve" placeholder="ex : 100m Nage Libre"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Rang</label>
          <input type="number" [(ngModel)]="form.rang" min="1" placeholder="ex : 1"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
        <div>
          <label class="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2">Temps</label>
          <input type="text" [(ngModel)]="form.temps" placeholder="ex : 58.34 ou 1:02.34"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent/40 text-white placeholder:text-white/30" />
        </div>
      </div>
      <div class="flex gap-3 mt-8">
        <button (click)="submitForm()" [disabled]="saving()"
          class="flex-1 py-3 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-40">
          {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button (click)="formOpen.set(false)"
          class="flex-1 py-3 rounded-full border border-white/20 text-sm hover:border-white/40 transition-colors">
          Annuler
        </button>
      </div>
    </app-modal>
  `
})
export class DashboardComponent implements OnInit {
  readonly stats    = signal<Record<string, number>>({});
  readonly statDefs = STAT_DEFS;
  readonly quickLinks = QUICK_LINKS;
  readonly formOpen  = signal(false);
  readonly saving    = signal(false);
  readonly formError = signal('');

  form = { athleteId: '', competitionId: '', epreuve: '', rang: null as number | null, temps: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/dashboard/stats').subscribe({ next: r => this.stats.set(r?.data ?? r ?? {}), error: () => {} });
  }

  openCreate(): void {
    this.form = { athleteId: '', competitionId: '', epreuve: '', rang: null, temps: '' };
    this.formError.set('');
    this.formOpen.set(true);
  }

  submitForm(): void {
    if (!this.form.athleteId || !this.form.competitionId || !this.form.epreuve) {
      this.formError.set('Athlète ID, Compétition ID et Épreuve sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.api.post<any>('/results', {
      athleteId:     Number(this.form.athleteId),
      competitionId: Number(this.form.competitionId),
      epreuve:       this.form.epreuve,
      temps:         this.form.temps || null,
      rang:          this.form.rang  || null,
    }).subscribe({
      next:  () => { this.saving.set(false); this.formOpen.set(false); },
      error: (e: any) => { this.formError.set(e?.error?.message ?? 'Une erreur est survenue. Vérifiez les données.'); this.saving.set(false); }
    });
  }
}
