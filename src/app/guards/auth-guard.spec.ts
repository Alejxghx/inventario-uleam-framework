import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authSvc: { isLoggedIn: any };
  let router: { parseUrl: any };

  beforeEach(() => {
    const makeSpy = (initial: any) => {
      const calls: any[] = [];
      let ret = initial;
      const fn = (...args: any[]) => {
        calls.push(args);
        return ret;
      };
      (fn as any).calls = calls;
      (fn as any).setReturn = (r: any) => {
        ret = r;
      };
      return fn as any;
    };

    authSvc = { isLoggedIn: makeSpy(true) };
    router = { parseUrl: makeSpy({} as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSvc },
        { provide: Router, useValue: router },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('permite acceso cuando isLoggedIn es true', () => {
    (authSvc.isLoggedIn as any) = () => true;
    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(true as any);
  });

  it('redirige a /login cuando isLoggedIn es false', () => {
    (authSvc.isLoggedIn as any) = () => false;
    const tree = {} as UrlTree;
    (router.parseUrl as any).setReturn(tree);
    const result = guard.canActivate({} as any, {} as any);
    expect((router.parseUrl as any).calls[0][0]).toBe('/login');
    const ret = (router.parseUrl as any)();
    expect(result).toBe(ret);
  });
});