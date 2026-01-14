import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { mantenimientoGuard } from './mantenimiento-guard';

describe('mantenimientoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => mantenimientoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
