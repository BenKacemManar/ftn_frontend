import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { ForumCategory } from '../../../../core/models/forum.model';

@Component({
  selector: 'app-forum-home',
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.scss']
})
export class ForumHomeComponent implements OnInit {
  categories: ForumCategory[] = [];
  loading = false;

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loading = true;
    this.forumService.getCategories().subscribe({
      next: cats => { this.categories = Array.isArray(cats) ? cats : []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
