import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = 'admin@ftn.tn';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const user = this.auth.currentUser;
        this.router.navigate([user?.role === 'ADMIN' ? '/admin' : '/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Email ou mot de passe incorrect.';
      }
    });
  }
}
