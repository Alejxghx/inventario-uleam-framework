import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const inventarioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasRole('INVENTARIO')) {
    return true;
  }
  return router.parseUrl('/login');
};

// alias si otras partes esperan adminGuard
export const adminGuard: CanActivateFn = inventarioGuard;