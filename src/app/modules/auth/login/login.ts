import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, CheckboxModule],
    template: `
        <div class="ftn-login-wrapper">
            <div class="ftn-login-card">
                <div class="ftn-login-header">
                    <img src="assets/images/ftn-logo.png" alt="FTN Logo" class="ftn-login-logo" onerror="this.style.display='none'">
                    <h2>Tunisian Swimming Federation</h2>
                    <p>Sign in to your account</p>
                </div>

                <div class="ftn-login-form">
                    <div class="field">
                        <label for="email">Email</label>
                        <input pInputText id="email" [(ngModel)]="email" type="email" placeholder="your@email.com" class="w-full" />
                    </div>
                    <div class="field">
                        <label for="password">Password</label>
                        <p-password id="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" />
                    </div>
                    <div class="field flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <p-checkbox [(ngModel)]="rememberMe" [binary]="true" inputId="remember" />
                            <label for="remember">Remember me</label>
                        </div>
                        <a href="#" class="ftn-link">Forgot password?</a>
                    </div>
                    <p-button label="Sign In" icon="pi pi-sign-in" styleClass="w-full" (onClick)="onSubmit()" />
                </div>
            </div>
        </div>
    `
})
export class Login {
    private router = inject(Router);

    email = '';
    password = '';
    rememberMe = false;

    onSubmit(): void {
        // DEV bypass — replace with real auth when backend is running
        localStorage.setItem('ftn_token', 'dev-token');
        this.router.navigate(['/']);
    }
}
