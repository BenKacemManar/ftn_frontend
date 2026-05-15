import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('./app/modules/dashboard/dashboard.routes')
            },
            {
                path: 'competitions',
                loadChildren: () => import('./app/modules/competitions/competitions.routes')
            },
            {
                path: 'results',
                loadChildren: () => import('./app/modules/results/results.routes')
            },
            {
                path: 'clubs',
                loadChildren: () => import('./app/modules/clubs/clubs.routes')
            },
            {
                path: 'pools',
                loadChildren: () => import('./app/modules/pools/pools.routes')
            },
            {
                path: 'forum',
                loadChildren: () => import('./app/modules/forum/forum.routes')
            }
        ]
    },
    { path: 'auth', loadChildren: () => import('./app/modules/auth/auth.routes') },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
