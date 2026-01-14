import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Equipo {
  id?: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  estado: string;
  serie: string;
  responsable: string;
  marca?: string;
  modelo?: string;
  valor?: number;
  proveedor?: string;
  notas?: string;
  fecha?: string;
}

export interface StatsInventario {
  total: number;
  activos: number;
  enReparacion: number;
  dadosDeBaja: number;
  valorTotal: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  // Si luego tienes un backend REST, cambias esta URL:
  private baseUrl = 'http://localhost:3000/inventario';

  constructor(private http: HttpClient) {}

  // === Versión con backend (REST) ===
  getTodos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.baseUrl);
  }

  getUno(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.baseUrl}/${id}`);
  }

  crear(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.baseUrl, equipo);
  }

  actualizar(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.baseUrl}/${id}`, equipo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  obtenerEstadisticas(lista: Equipo[]): StatsInventario {
    const total = lista.length;
    const activos = lista.filter(e => e.estado === 'Activo').length;
    const enReparacion = lista.filter(e => e.estado === 'En reparación').length;
    const dadosDeBaja = lista.filter(e => e.estado === 'Dado de baja').length;
    const valorTotal = lista.reduce((s, e) => s + (e.valor || 0), 0);
    return { total, activos, enReparacion, dadosDeBaja, valorTotal };
  }

  // === Si todavía NO tienes backend y quieres seguir usando localStorage,
  // puedes hacer una implementación "fake" aquí en vez de SistemaULEAM ===
  getTodosLocal(): Observable<Equipo[]> {
    const raw = localStorage.getItem('inventarioULEAM');
    const data: Equipo[] = raw ? JSON.parse(raw) : [];
    return of(data);
  }
}
