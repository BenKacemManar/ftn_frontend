import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', role: 'ATHLETE' };
  loading = false;
  error = '';
  success = false;

  constructor(private api: ApiService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.api.post<any>('/auth/register', this.form).subscribe({
      next: () => { this.success = true; setTimeout(() => this.router.navigate(['/auth/login']), 2000); },
      error: (err) => { this.loading = false; this.error = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }
}
