import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, CheckboxModule, MessageModule],
    template: `
        <div class="ftn-login-wrapper">
            <div class="ftn-login-card">
                <div class="ftn-login-header">
                    <img src="assets/images/ftn-logo.png" alt="FTN Logo" class="ftn-login-logo" onerror="this.style.display='none'">
                    <h2>Tunisian Swimming Federation</h2>
                    <p>Sign in to your account</p>
                </div>

                <form class="ftn-login-form" (ngSubmit)="onSubmit()">
                    @if (errorMessage()) {
                        <p-message severity="error" [text]="errorMessage()!" styleClass="w-full mb-3" />
                    }
                    <div class="field">
                        <label for="email">Email</label>
                        <input pInputText id="email" [(ngModel)]="email" name="email" type="email"
                               placeholder="your@email.com" class="w-full" />
                    </div>
                    <div class="field">
                        <label for="password">Password</label>
                        <p-password id="password" [(ngModel)]="password" name="password"
                                    [feedback]="false" [toggleMask]="true"
                                    styleClass="w-full" inputStyleClass="w-full" />
                    </div>
                    <div class="field flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <p-checkbox [(ngModel)]="rememberMe" name="rememberMe" [binary]="true" inputId="remember" />
                            <label for="remember">Remember me</label>
                        </div>
                        <a href="#" class="ftn-link">Forgot password?</a>
                    </div>
                    <p-button type="submit" label="Sign In" icon="pi pi-sign-in"
                              styleClass="w-full" [loading]="loading()" />
                </form>
            </div>
        </div>
    `
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = 'admin@ftn.tn';
    password = 'Admin@2024';
    rememberMe = false;
    loading = signal(false);
    errorMessage = signal<string | null>(null);

    onSubmit(): void {
        if (!this.email || !this.password) {
            this.errorMessage.set('Email and password are required');
            return;
        }
        this.errorMessage.set(null);
        this.loading.set(true);
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading.set(false);
                const msg = err?.error?.message ?? err?.error?.error ?? 'Invalid credentials';
                this.errorMessage.set(msg);
            }
        });
    }
}
