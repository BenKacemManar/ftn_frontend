import { Component, OnInit, signal } from '@angular/core';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-angular';
import { EvenementService } from '../../../evenements/services/evenement.service';
import { Evenement } from '../../../../core/models/evenement.model';

@Component({
  selector: 'app-evenements-admin',
  template: `
    <app-admin-layout>
      <div>
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-3xl">Événements</h1>
          <button (click)="openCreate()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm hover:bg-white hover:text-black transition-colors">
            + Nouvel évènement
          </button>
        </div>

        @if (loading()) {
          <div class="text-white/40 text-center py-16">Chargement…</div>
        } @else {
          <div class="border border-white/10 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10 bg-white/[0.02]">
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3">Titre</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Type</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden md:table-cell">Statut</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Début</th>
                  <th class="text-left text-xs tracking-[0.2em] uppercase text-white/40 px-4 py-3 hidden lg:table-cell">Lieu</th>
                  <th class="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                @for (ev of items(); track ev.id) {
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="px-4 py-3">
                      <div class="font-medium truncate max-w-xs">{{ ev.titre }}</div>
                    </td>
                    <td class="px-4 py-3 hidden lg:table-cell">
                      <span class="text-xs px-2 py-0.5 rounded-full text-white/60 border border-white/10">{{ typeLabel(ev.type) }}</span>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <span class="text-xs px-2 py-0.5 rounded-full"
                        [style.background]="ev.status === 'PUBLIE' || ev.status === 'INSCRIPTIONS_OUVERTES' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)'"
                        [style.color]="ev.status === 'PUBLIE' || ev.status === 'INSCRIPTIONS_OUVERTES' ? '#10B981' : '#6B7280'">
                        {{ statusLabel(ev.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-white/50 hidden lg:table-cell">{{ formatDate(ev.dateDebut) }}</td>
                    <td class="px-4 py-3 text-sm text-white/50 hidden lg:table-cell">{{ ev.lieu || '—' }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2 justify-end">
                        <button (click)="togglePublish(ev)" class="p-1.5 hover:text-accent transition-colors"
                          [title]="ev.status === 'PUBLIE' ? 'Dépublier' : 'Publier'">
                          <lucide-icon [img]="ev.status === 'PUBLIE' ? EyeOff : Eye" class="w-3.5 h-3.5"></lucide-icon>
                        </button>
                        <button (click)="openEdit(ev.id)" class="p-1.5 hover:text-accent transition-colors">
                          <lucide-icon [img]="Pencil" class="w-3.5 h-3.5"></lucide-icon>
                        </button>
                        <button (click)="deleteId.set(ev.id)" class="p-1.5 hover:text-accent transition-colors">
                          <lucide-icon [img]="Trash2" class="w-3.5 h-3.5"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="6" class="text-white/40 text-center py-10">Aucun événement créé.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </app-admin-layout>

    <!-- Delete confirm -->
    <app-modal [open]="!!deleteId()" maxWidth="max-w-sm" (closed)="deleteId.set(null)">
      <h3 class="font-serif text-xl mb-4">Supprimer cet événement ?</h3>
      <div class="flex gap-4">
        <button (click)="doDelete()" [disabled]="deleting()"
          class="flex-1 py-3 rounded-full bg-accent text-white text-sm disabled:opacity-50">Supprimer</button>
        <button (click)="deleteId.set(null)"
          class="flex-1 py-3 rounded-full border border-white/20 text-sm">Annuler</button>
      </div>
    </app-modal>

    <!-- Create/Edit modal -->
    <app-modal [open]="formOpen()" [title]="editId() ? 'Modifier l\\'évènement' : 'Nouvel évènement'" (closed)="formOpen.set(false)">
      <app-evenement-form [id]="editId()" (saved)="onSaved()"></app-evenement-form>
    </app-modal>
  `
})
export class EvenementsAdminComponent implements OnInit {
  readonly Eye = Eye; readonly EyeOff = EyeOff; readonly Pencil = Pencil; readonly Trash2 = Trash2;
  readonly items = signal<Evenement[]>([]);
  readonly loading = signal(false);
  readonly deleteId = signal<number | null>(null);
  readonly deleting = signal(false);
  readonly formOpen = signal(false);
  readonly editId = signal<string | null>(null);

  constructor(private svc: EvenementService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll({ size: 200 }).subscribe({
      next: (res) => {
        const data: Evenement[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.items.set(data.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void { this.editId.set(null); this.formOpen.set(true); }
  openEdit(id: number): void { this.editId.set(String(id)); this.formOpen.set(true); }
  onSaved(): void { this.formOpen.set(false); this.load(); }

  togglePublish(ev: Evenement): void {
    const target = ev.status === 'PUBLIE' ? 'BROUILLON' : 'PUBLIE';
    this.svc.update(ev.id, { ...ev, status: target }).subscribe({ next: () => this.load() });
  }

  doDelete(): void {
    this.deleting.set(true);
    this.svc.delete(this.deleteId()!).subscribe({
      next: () => { this.items.update(l => l.filter(e => e.id !== this.deleteId())); this.deleteId.set(null); this.deleting.set(false); },
      error: () => this.deleting.set(false)
    });
  }

  typeLabel(t: string): string {
    return ({ COMPETITION: 'Compétition', CEREMONIE: 'Cérémonie', STAGE: 'Stage', AUTRE: 'Autre' } as any)[t] ?? t;
  }
  statusLabel(s: string): string {
    return ({ BROUILLON: 'Brouillon', PUBLIE: 'Publié', INSCRIPTIONS_OUVERTES: 'Inscriptions', EN_COURS: 'En cours', TERMINE: 'Terminé', ARCHIVE: 'Archivé' } as any)[s] ?? s;
  }
  formatDate(d: string): string { return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
}
