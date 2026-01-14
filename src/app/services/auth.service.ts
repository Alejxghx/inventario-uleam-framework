import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type RolSesion = 'ADMIN' | 'INVENTARIO' | 'MANTENIMIENTO' | 'USUARIO';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  usuario: string;
  rol: RolSesion;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'uleam_usuario_sesion';
  private _sesion$ = new BehaviorSubject<UsuarioSesion | null>(this.loadFromStorage());

  get sesion$(): Observable<UsuarioSesion | null> {
    return this._sesion$.asObservable();
  }

  loginFake(usuario: UsuarioSesion) {
    this._sesion$.next(usuario);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(usuario));
    } catch {
      // ignore storage errors
    }
  }

  logout() {
    this._sesion$.next(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
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
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
    } catch {
      return null;
    }
  }
}
