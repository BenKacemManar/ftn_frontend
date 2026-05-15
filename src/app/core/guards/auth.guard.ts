import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('ftn_token');
    if (token) return true;
    return router.createUrlTree(['/auth/login']);
};
