import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { Actualite } from '../../../../core/models/news.model';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  news: Actualite | null = null;
  loading = false;

  constructor(private route: ActivatedRoute, private newsService: NewsService) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.newsService.getById(id).subscribe({
      next: n => { this.news = n; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
