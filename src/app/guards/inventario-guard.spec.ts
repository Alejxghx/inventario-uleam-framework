import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inventarioGuard } from './inventario-guard';
import { AuthService } from '../services/auth.service';

describe('inventarioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => inventarioGuard(...guardParameters));

  let authSvc: { hasRole: any };
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

    authSvc = { hasRole: makeSpy(true) };
    router = { parseUrl: makeSpy({} as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSvc },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('permite acceso cuando tiene rol INVENTARIO', () => {
    (authSvc.hasRole as any) = () => true;
    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true as any);
  });

  it('redirige a /login cuando no tiene rol', () => {
    (authSvc.hasRole as any) = () => false;
    const tree = {} as UrlTree;
    (router.parseUrl as any).setReturn(tree);
    const result = executeGuard({} as any, {} as any);
    expect((router.parseUrl as any).calls[0][0]).toBe('/login');
    const ret = (router.parseUrl as any)();
    expect(result).toBe(ret);
  });
});