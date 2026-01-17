import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

export type RolSesion = 'ADMIN' | 'INVENTARIO' | 'MANTENIMIENTO' | 'USUARIO';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  usuario: string;
  rol: RolSesion;
  fechaIngreso?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _sesion$ = new BehaviorSubject<UsuarioSesion | null>(this.loadFromStorage());

  constructor(private storage: StorageService) {}

  get sesion$(): Observable<UsuarioSesion | null> {
    return this._sesion$.asObservable();
  }

  loginFake(usuario: UsuarioSesion) {
    const usuarioConFecha = {
      ...usuario,
      fechaIngreso: new Date().toISOString()
    };
    
    this._sesion$.next(usuarioConFecha);
    this.storage.set(this.storage.keys.SESION, usuarioConFecha);
    
    console.log('✅ Sesión iniciada y guardada en localStorage:', usuarioConFecha);
  }

  logout() {
    this._sesion$.next(null);
    this.storage.remove(this.storage.keys.SESION);
    console.log('🚪 Sesión cerrada y removida de localStorage');
  }

  getSesion(): UsuarioSesion | null {
    return this._sesion$.value;
  }

  isAuthenticated(): boolean {
    return !!this._sesion$.value;
  }

  hasRole(role: RolSesion): boolean {
    const s = this._sesion$.value;
    return !!s && s.rol === role;
  }

  private loadFromStorage(): UsuarioSesion | null {
    const sesion = this.storage.get<UsuarioSesion>(this.storage.keys.SESION);
    if (sesion) {
      console.log('✅ Sesión recuperada de localStorage:', sesion);
    }
    return sesion;
  }

  actualizarSesion(cambios: Partial<UsuarioSesion>) {
    const actual = this._sesion$.value;
    if (actual) {
      const actualizada = { ...actual, ...cambios };
      this._sesion$.next(actualizada);
      this.storage.set(this.storage.keys.SESION, actualizada);
    }
  }
}