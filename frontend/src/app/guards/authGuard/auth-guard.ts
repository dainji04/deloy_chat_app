import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (await authService.isLoggedIn()) {
    return true;
  } else {
    // Nếu chưa đăng nhập, chuyển hướng đến trang sign-in
    router.navigate(['/auth/login']);
    return false;
  }
};
