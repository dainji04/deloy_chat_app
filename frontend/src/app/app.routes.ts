import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/authGuard/auth-guard';
import { guestGuard } from './guards/guestGuard/guest-guard';

const appRoutes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'messages',
        pathMatch: 'full',
      },
      {
        path: 'messages',
        loadComponent: () =>
            import('./pages/messages/messages').then((c) => c.Messages),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
            import('./pages/profile/profile').then((c) => c.Profile),
        canActivate: [authGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
            import('./pages/settings/settings').then((c) => c.Settings),
        canActivate: [authGuard],
      },
      {
        path: 'friends',
        loadComponent: () =>
            import('./pages/friends/friends').then((c) => c.Friends),
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
        {
            path: 'login',
            loadComponent: () =>
                import('./pages/auth/login/login').then((c) => c.Login),
            canActivate: [guestGuard],
        },
        {
            path: 'sign-up',
            loadComponent: () =>
                import('./pages/auth/signup/signup').then((c) => c.Signup),
            canActivate: [guestGuard],
        },
    ],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
        import('./pages/reset-password/reset-password').then(
            (c) => c.ResetPassword
        ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
        import('./pages/forgot-password/forgot-password').then(
            (c) => c.ForgotPassword
        ),
  },
  {
    path: 'video-call/:roomId',
    loadComponent: () =>
        import('./pages/video-call/video-call').then((c) => c.VideoCall),
  },
  {
    path: '**',
    redirectTo: 'messages',
    pathMatch: 'full',
  },
];

export const routes: Routes = appRoutes;
