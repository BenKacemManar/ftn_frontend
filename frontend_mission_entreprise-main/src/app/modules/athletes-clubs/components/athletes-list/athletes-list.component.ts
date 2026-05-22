import { Component, OnInit } from '@angular/core';
import { AthleteService } from '../../services/athlete.service';

@Component({
  selector: 'app-athletes-list',
  templateUrl: './athletes-list.component.html',
  styleUrls: ['./athletes-list.component.scss']
})
export class AthletesListComponent implements OnInit {
  athletes: any[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  search = '';
  selectedCategory = '';
  selectedGender = '';

  categories = ['', 'Poussin', 'Benjamin', 'Minime', 'Cadet', 'Junior', 'Senior'];
  genders = [{ value: '', label: 'Tous' }, { value: 'M', label: 'Hommes' }, { value: 'F', label: 'Femmes' }];

  constructor(private athleteService: AthleteService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page - 1, size: this.pageSize };
    if (this.search) params.search = this.search;
    if (this.selectedCategory) params.categorie = this.selectedCategory;
    if (this.selectedGender) params.sexe = this.selectedGender;
    this.athleteService.getAll(params).subscribe({
      next: (r: any) => {
        const content = r?.content ?? r?.data ?? [];
        this.athletes = content;
        this.total = r?.totalElements ?? r?.totalCount ?? r?.total ?? content.length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void { this.page = 1; this.load(); }
  onPageChange(p: number): void { this.page = p; this.load(); }

  getInitials(nom: string, prenom: string): string {
    return `${(prenom || '')[0] ?? ''}${(nom || '')[0] ?? ''}`.toUpperCase();
  }
}
