import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍' },
  { type: 'LOVE', emoji: '❤️' },
  { type: 'HAHA', emoji: '😂' },
  { type: 'WOW', emoji: '😮' },
  { type: 'CLAP', emoji: '👏' },
];

@Component({
  selector: 'app-forum-thread-detail',
  template: `
    <app-page-layout>
      <section class="mx-auto max-w-[900px] px-6 lg:px-10 py-16">
        <a [routerLink]="['/forum', thread()?.forumId]" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-12 transition-colors">← Retour</a>
        @if (loading()) {
          <div class="text-white/40 text-center py-20">Chargement…</div>
        } @else if (!thread()) {
          <div class="text-white/40 text-center py-20">Sujet introuvable.</div>
        } @else {
          <h1 class="font-serif text-3xl lg:text-5xl mb-4">{{ thread().titre }}</h1>
          <div class="flex items-center gap-4 text-xs text-white/40 mb-10 pb-8 border-b border-white/10">
            <span>{{ thread().auteurPrenom }} {{ thread().auteurNom }}</span>
            <span>·</span>
            <span>{{ fmtDate(thread().dateCreation) }}</span>
            <span>·</span>
            <span>{{ thread().nbVues }} vues · {{ thread().nbReponses }} réponses</span>
          </div>
          <div class="mb-4 p-6 border border-white/10 rounded-lg">
            <p class="text-white/80 leading-relaxed whitespace-pre-wrap">{{ thread().contenu }}</p>
            @if (thread().imageUrl) {
              <img [src]="thread().imageUrl" alt="" class="mt-4 max-h-80 rounded-lg border border-white/10"/>
            }
          </div>
          <div class="flex items-center gap-2 mb-12">
            @for (r of REACTIONS; track r.type) {
              <button (click)="toggleReaction('thread', thread().id, r.type)"
                class="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors"
                [class]="hasMyReaction('thread', thread().id, r.type) ? 'border-accent bg-accent/10 text-accent' : 'border-white/15 text-white/40 hover:border-white/30'">
                <span>{{ r.emoji }}</span>
                @if (reactionCount('thread', thread().id, r.type) > 0) { <span>{{ reactionCount('thread', thread().id, r.type) }}</span> }
              </button>
            }
          </div>

          <h2 class="font-serif text-2xl mb-6">Réponses <span class="text-gold">({{ posts().length }})</span></h2>
          <div class="space-y-4 mb-12">
            @for (post of posts(); track post.id) {
              <div class="p-5 border border-white/10 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-accent">
                      {{ initials(post) }}
                    </div>
                    <div>
                      <div class="text-sm font-medium">{{ post.auteurPrenom }} {{ post.auteurNom }}</div>
                      <div class="text-xs text-white/30">{{ fmtDate(post.dateCreation) }}</div>
                    </div>
                  </div>
                </div>
                <p class="text-white/70 leading-relaxed">{{ post.contenu }}</p>
                @if (post.imageUrl) {
                  <img [src]="post.imageUrl" alt="" class="mt-3 max-h-64 rounded-lg border border-white/10"/>
                }
                <div class="flex items-center gap-2 mt-4">
                  @for (r of REACTIONS; track r.type) {
                    <button (click)="toggleReaction('post', post.id, r.type)"
                      class="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors"
                      [class]="hasMyReaction('post', post.id, r.type) ? 'border-accent bg-accent/10 text-accent' : 'border-white/15 text-white/40 hover:border-white/30'">
                      <span>{{ r.emoji }}</span>
                      @if (reactionCount('post', post.id, r.type) > 0) { <span>{{ reactionCount('post', post.id, r.type) }}</span> }
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          @if (auth.isLoggedIn() && !thread().ferme) {
            <form (ngSubmit)="submitReply()" class="border-t border-white/10 pt-8">
              <h3 class="font-serif text-xl mb-4">Votre réponse</h3>
              <textarea [(ngModel)]="reply" name="reply" rows="4" required placeholder="Écrivez votre réponse…"
                class="block w-full bg-transparent border border-white/20 focus:border-white rounded-lg px-4 py-3 outline-none resize-none transition-colors placeholder:text-white/30 mb-4"></textarea>
              <input [(ngModel)]="replyImageUrl" name="replyImage" placeholder="URL d'image (optionnel)"
                class="block w-full bg-transparent border-b border-white/20 focus:border-white pb-3 outline-none transition-colors mb-4 text-sm"/>
              <div class="flex items-center gap-3">
                <app-emoji-picker (picked)="reply = reply + $event"></app-emoji-picker>
                <button type="submit" [disabled]="posting() || !reply.trim()"
                  class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-accent hover:text-white transition-colors text-sm disabled:opacity-50">
                  {{ posting() ? 'Envoi…' : 'Répondre' }} →
                </button>
              </div>
            </form>
          } @else if (!auth.isLoggedIn()) {
            <div class="border-t border-white/10 pt-8 text-center text-white/40">
              <a routerLink="/auth/login" class="text-gold hover:underline">Connectez-vous</a> pour répondre.
            </div>
          }
        }
      </section>
    </app-page-layout>
  `
})
export class ForumThreadDetailComponent implements OnInit {
  readonly thread = signal<any>(null);
  readonly posts = signal<any[]>([]);
  readonly reactions = signal<any[]>([]);
  readonly loading = signal(true);
  readonly posting = signal(false);
  reply = '';
  replyImageUrl = '';
  readonly REACTIONS = REACTIONS;

  constructor(private api: ApiService, private route: ActivatedRoute, readonly auth: AuthService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('threadId');
    forkJoin([
      this.api.get<any>(`/sujets/${id}`),
      this.api.get<any>(`/reponses/sujet/${id}`),
      this.api.get<any>(`/sujets/${id}/reactions`)
    ]).subscribe({
      next: ([t, p, r]) => {
        this.thread.set(t?.data ?? t);
        this.posts.set(Array.isArray(p) ? p : (p?.data ?? []));
        this.reactions.set(Array.isArray(r) ? r : (r?.data ?? []));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submitReply(): void {
    if (!this.reply.trim()) return;
    this.posting.set(true);
    const id = this.route.snapshot.paramMap.get('threadId');
    const uid = this.auth.currentUser?.id;
    this.api.post<any>('/reponses', {
      sujetId: Number(id),
      auteurId: uid ? Number(uid) : undefined,
      contenu: this.reply,
      imageUrl: this.replyImageUrl || undefined
    }).subscribe({
      next: p => { this.posts.update(ps => [...ps, p?.data ?? p]); this.reply = ''; this.replyImageUrl = ''; this.posting.set(false); },
      error: () => this.posting.set(false)
    });
  }

  private reactionsFor(target: 'thread' | 'post', id: number): any[] {
    return this.reactions().filter(r => target === 'thread' ? r.threadId === id : r.postId === id);
  }

  reactionCount(target: 'thread' | 'post', id: number, type: string): number {
    return this.reactionsFor(target, id).filter(r => r.type === type).length;
  }

  hasMyReaction(target: 'thread' | 'post', id: number, type: string): boolean {
    const uid = this.auth.currentUser?.id ? Number(this.auth.currentUser.id) : null;
    if (!uid) return false;
    return this.reactionsFor(target, id).some(r => r.type === type && Number(r.userId) === uid);
  }

  toggleReaction(target: 'thread' | 'post', id: number, type: string): void {
    const uid = this.auth.currentUser?.id;
    if (!uid) return;
    const existing = this.reactionsFor(target, id).find(r => r.type === type && Number(r.userId) === Number(uid));
    if (existing) {
      this.api.delete(`/reactions/${existing.id}`).subscribe({
        next: () => this.reactions.update(rs => rs.filter(r => r.id !== existing.id))
      });
    } else {
      const path = target === 'thread' ? `/threads/${id}/react` : `/posts/${id}/react`;
      this.api.post<any>(path, { userId: Number(uid), type }).subscribe({
        next: r => this.reactions.update(rs => [...rs, r?.data ?? r])
      });
    }
  }

  initials(p: any): string { return `${(p.auteurPrenom||'')[0]??''}${(p.auteurNom||'')[0]??''}`.toUpperCase(); }

  fmtDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
}
