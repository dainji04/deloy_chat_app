import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';

export const guestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  if (await authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  } else {
    return true;
  }
};
