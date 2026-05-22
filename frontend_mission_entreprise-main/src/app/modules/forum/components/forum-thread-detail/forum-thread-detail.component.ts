import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { ForumThread, ForumPost } from '../../../../core/models/forum.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forum-thread-detail',
  templateUrl: './forum-thread-detail.component.html',
  styleUrls: ['./forum-thread-detail.component.scss']
})
export class ForumThreadDetailComponent implements OnInit {
  thread: ForumThread | null = null;
  posts: ForumPost[] = [];
  loading = false;
  replyContent = '';
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.forumService.getThreadById(id).subscribe(t => { this.thread = t; this.loading = false; });
    this.forumService.getPostsByThread(id).subscribe(p => { this.posts = Array.isArray(p) ? p : []; });
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.thread) return;
    this.submitting = true;
    this.forumService.createPost({ sujetId: this.thread.id, contenu: this.replyContent }).subscribe({
      next: (post) => { this.posts.push(post); this.replyContent = ''; this.submitting = false; },
      error: () => { this.submitting = false; }
    });
  }
}
