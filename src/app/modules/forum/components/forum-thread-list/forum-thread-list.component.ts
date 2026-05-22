import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { ForumCategory, ForumThread } from '../../../../core/models/forum.model';

@Component({
  selector: 'app-forum-thread-list',
  templateUrl: './forum-thread-list.component.html',
  styleUrls: ['./forum-thread-list.component.scss']
})
export class ForumThreadListComponent implements OnInit {
  category: ForumCategory | null = null;
  threads: ForumThread[] = [];
  loading = false;
  categoryId!: number;

  constructor(private route: ActivatedRoute, private router: Router, private forumService: ForumService) {}

  ngOnInit(): void {
    this.categoryId = +this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.forumService.getCategoryById(this.categoryId).subscribe(c => { this.category = c; });
    this.forumService.getThreadsByCategory(this.categoryId).subscribe({
      next: t => { this.threads = Array.isArray(t) ? t : []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  goToThread(id: number): void { this.router.navigate(['/forum/thread', id]); }
}
