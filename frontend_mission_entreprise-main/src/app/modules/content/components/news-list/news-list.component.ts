import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { Actualite } from '../../../../core/models/news.model';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
  allNews: Actualite[] = [];
  news: Actualite[] = [];
  loading = false;
  selectedCategory = '';
  categories = ['', 'COMPETITION', 'FEDERATION', 'INTERNATIONAL', 'SANTE', 'ENTRAINEMENT', 'TECHNIQUE'];

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.newsService.fetchAllById(50).subscribe({
      next: items => {
        this.allNews = items.filter(a => a.publie !== false).sort((a, b) => {
          const da = new Date(a.datePublication ?? a.createdAt ?? 0).getTime();
          const db = new Date(b.datePublication ?? b.createdAt ?? 0).getTime();
          return db - da;
        });
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    this.news = this.selectedCategory
      ? this.allNews.filter(a => a.categorie === this.selectedCategory)
      : this.allNews;
  }

  goToDetail(id: number): void {
    this.router.navigate(['/news', id]);
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
