import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const ok = auth.hasRole('ADMIN');
  console.log('ADMIN GUARD -> hasRole(ADMIN) =', ok);

  if (ok) {
    return true;
  }

  return router.parseUrl('/login');
};
