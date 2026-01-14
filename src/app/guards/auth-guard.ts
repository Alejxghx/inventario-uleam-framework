import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const loggedIn = this.auth.isAuthenticated();
    console.log('AUTH GUARD canActivate, loggedIn =', loggedIn);

    if (loggedIn) {
      return true;
    }

    // opcional: puedes pasar returnUrl si quieres
    return this.router.parseUrl('/login');
  }
}
