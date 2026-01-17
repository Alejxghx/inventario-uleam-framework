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
  private _sesion$ = new BehaviorSubject<UsuarioSesion | null>(null);

  constructor(private storage: StorageService) {
    console.log('🔍 CONSTRUCTOR AuthService - storage:', this.storage);
    
    const sesion = this.loadFromStorage();
    if (sesion) {
      this._sesion$.next(sesion);
    }
  }

  get sesion$(): Observable<UsuarioSesion | null> {
    return this._sesion$.asObservable();
  }

  loginFake(usuario: UsuarioSesion) {
    console.log('🔍 DEBUG - storage en loginFake:', this.storage);

    const usuarioConFecha = { 
      ...usuario, 
      fechaIngreso: new Date().toISOString() 
    };
    
    this._sesion$.next(usuarioConFecha);

    if (!this.storage) {
      console.error('❌ StorageService no disponible en loginFake');
      return;
    }

    this.storage.set(this.storage.KEYS.SESION, usuarioConFecha);
    console.log('✅ Sesión iniciada:', usuarioConFecha);
  }

  logout() {
    this._sesion$.next(null);
    if (this.storage) {
      this.storage.remove(this.storage.KEYS.SESION);
    }
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
    if (!this.storage) {
      console.warn('⚠️ StorageService no disponible en loadFromStorage');
      return null;
    }
    
    const sesion = this.storage.get<UsuarioSesion>(this.storage.KEYS.SESION);
    if (sesion) {
      console.log('✅ Sesión recuperada de localStorage:', sesion);
    }
    return sesion;
  }

  actualizarSesion(cambios: Partial<UsuarioSesion>) {
    const actual = this._sesion$.value;
    if (actual && this.storage) {
      const actualizada = { ...actual, ...cambios };
      this._sesion$.next(actualizada);
      this.storage.set(this.storage.KEYS.SESION, actualizada);
      console.log('✅ Sesión actualizada:', actualizada);
    }
  }
}
