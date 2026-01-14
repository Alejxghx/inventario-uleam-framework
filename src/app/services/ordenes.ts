import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistorialItem {
  fecha: string;
  accion: string;
}

export interface Orden {
  id?: string;
  equipoId: number;
  equipoNombre: string;
  ubicacion: string;
  estado: string;
  prioridad: string;
  tipo: string;
  asignado: string;
  fechaCreacion?: string;
  fechaLimite: string;
  descripcion: string;
  historial?: HistorialItem[];
}

export interface StatsOrdenes {
  pendientes: number;
  enProceso: number;
  completadas: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private baseUrl = 'http://localhost:3000/ordenes';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Orden[]> {
    return this.http.get<Orden[]>(this.baseUrl);
  }

  agregar(orden: Orden): Observable<Orden> {
    return this.http.post<Orden>(this.baseUrl, orden);
  }

  actualizar(id: string, orden: Orden): Observable<Orden> {
    return this.http.put<Orden>(`${this.baseUrl}/${id}`, orden);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: string, estado: string): Observable<Orden> {
    return this.http.patch<Orden>(`${this.baseUrl}/${id}`, { estado });
  }

  agregarNota(id: string, nota: string): Observable<Orden> {
    return this.http.post<Orden>(`${this.baseUrl}/${id}/notas`, { nota });
  }

  calcularStats(ordenes: Orden[]): StatsOrdenes {
    const pendientes = ordenes.filter(o => o.estado === 'Pendiente').length;
    const enProceso = ordenes.filter(o => o.estado === 'En proceso').length;
    const completadas = ordenes.filter(o => o.estado === 'Completado').length;
    const total = ordenes.length;
    return { pendientes, enProceso, completadas, total };
  }
}
