import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

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
  private contadorId = 1;

  constructor(private storage: StorageService) {
    this.inicializarDatos();
  }

  private inicializarDatos() {
    const ordenes = this.obtenerTodasSync();
    if (ordenes.length === 0) {
      console.log('📝 Inicializando órdenes por defecto en localStorage...');
      const inicial: Orden[] = [
        {
          id: 'ORD-001',
          equipoId: 1,
          equipoNombre: 'PC Docencia Lab 12',
          ubicacion: 'Bloque A — Lab 3',
          estado: 'Pendiente',
          prioridad: 'Alta',
          tipo: 'Preventivo',
          asignado: 'Carlos Ruiz',
          fechaCreacion: '15/01/2024',
          fechaLimite: '20/01/2024',
          descripcion: 'Mantenimiento preventivo mensual - Limpieza de hardware y actualización de software',
          historial: [
            {
              fecha: '15/01/2024 10:30',
              accion: 'Orden creada por Juan Pérez'
            }
          ]
        },
        {
          id: 'ORD-002',
          equipoId: 3,
          equipoNombre: 'Impresora Multifunción',
          ubicacion: 'Secretaría Académica',
          estado: 'En proceso',
          prioridad: 'Media',
          tipo: 'Correctivo',
          asignado: 'María López',
          fechaCreacion: '10/01/2024',
          fechaLimite: '18/01/2024',
          descripcion: 'Reparación de atasco de papel y calibración de cabezales',
          historial: [
            {
              fecha: '10/01/2024 14:20',
              accion: 'Orden creada por Carlos Ramírez'
            },
            {
              fecha: '12/01/2024 09:15',
              accion: 'María López inició el trabajo'
            },
            {
              fecha: '12/01/2024 11:30',
              accion: 'Se identificó el problema en el rodillo de alimentación'
            }
          ]
        },
        {
          id: 'ORD-003',
          equipoId: 2,
          equipoNombre: 'Proyector Aula Magna',
          ubicacion: 'Bloque B — Aula Magna',
          estado: 'Completado',
          prioridad: 'Baja',
          tipo: 'Preventivo',
          asignado: 'Pedro Sánchez',
          fechaCreacion: '05/01/2024',
          fechaLimite: '10/01/2024',
          descripcion: 'Limpieza de lentes y verificación de conexiones',
          historial: [
            {
              fecha: '05/01/2024 08:00',
              accion: 'Orden creada'
            },
            {
              fecha: '08/01/2024 10:00',
              accion: 'Trabajo iniciado'
            },
            {
              fecha: '08/01/2024 12:00',
              accion: 'Trabajo completado exitosamente'
            }
          ]
        }
      ];
      this.guardarTodas(inicial);
      this.contadorId = 4;
      this.storage.set(this.storage.keys.CONTADOR_ORDENES, this.contadorId);
      console.log('✅ Órdenes inicializadas en localStorage');
    } else {
      console.log(`✅ Se cargaron ${ordenes.length} órdenes de localStorage`);
      // Recuperar contador
      const contador = this.storage.get<number>(this.storage.keys.CONTADOR_ORDENES);
      if (contador) {
        this.contadorId = contador;
      } else {
        // Calcular el siguiente ID basado en las órdenes existentes
        const maxId = Math.max(...ordenes.map(o => {
          const num = parseInt(o.id?.replace('ORD-', '') || '0');
          return isNaN(num) ? 0 : num;
        }));
        this.contadorId = maxId + 1;
        this.storage.set(this.storage.keys.CONTADOR_ORDENES, this.contadorId);
      }
    }
  }

  private obtenerTodasSync(): Orden[] {
    return this.storage.get<Orden[]>(this.storage.keys.ORDENES) || [];
  }

  obtenerTodas(): Observable<Orden[]> {
    return of(this.obtenerTodasSync());
  }

  agregar(orden: Partial<Orden>): Observable<Orden> {
    const ordenes = this.obtenerTodasSync();
    const nuevoId = `ORD-${String(this.contadorId).padStart(3, '0')}`;
    this.contadorId++;
    this.storage.set(this.storage.keys.CONTADOR_ORDENES, this.contadorId);
    
    const nuevaOrden: Orden = {
      ...orden as Orden,
      id: nuevoId,
      fechaCreacion: new Date().toLocaleDateString('es-EC'),
      historial: [
        {
          fecha: new Date().toLocaleString('es-EC'),
          accion: 'Orden creada'
        }
      ]
    };
    
    ordenes.push(nuevaOrden);
    this.guardarTodas(ordenes);
    
    console.log('✅ Orden agregada:', nuevaOrden);
    return of(nuevaOrden);
  }

  actualizar(id: string, orden: Orden): Observable<Orden> {
    const ordenes = this.obtenerTodasSync();
    const index = ordenes.findIndex(o => o.id === id);
    
    if (index !== -1) {
      ordenes[index] = { ...orden, id };
      this.guardarTodas(ordenes);
      console.log('✅ Orden actualizada:', ordenes[index]);
      return of(ordenes[index]);
    }
    
    return of(orden);
  }

  eliminar(id: string): Observable<void> {
    const ordenes = this.obtenerTodasSync();
    const filtradas = ordenes.filter(o => o.id !== id);
    this.guardarTodas(ordenes);
    console.log(`🗑️ Orden ${id} eliminada`);
    return of(void 0);
  }

  cambiarEstado(id: string, estado: string): Observable<Orden | null> {
    const ordenes = this.obtenerTodasSync();
    const orden = ordenes.find(o => o.id === id);
    
    if (orden) {
      orden.estado = estado;
      if (!orden.historial) orden.historial = [];
      orden.historial.push({
        fecha: new Date().toLocaleString('es-EC'),
        accion: `Estado cambiado a: ${estado}`
      });
      this.guardarTodas(ordenes);
      console.log(`✅ Estado de orden ${id} cambiado a: ${estado}`);
      return of(orden);
    }
    
    return of(null);
  }

  agregarNota(id: string, nota: string): Observable<Orden | null> {
    const ordenes = this.obtenerTodasSync();
    const orden = ordenes.find(o => o.id === id);
    
    if (orden) {
      if (!orden.historial) orden.historial = [];
      orden.historial.push({
        fecha: new Date().toLocaleString('es-EC'),
        accion: nota
      });
      this.guardarTodas(ordenes);
      console.log(`✅ Nota agregada a orden ${id}`);
      return of(orden);
    }
    
    return of(null);
  }

  obtenerEstadisticas(): StatsOrdenes {
    const ordenes = this.obtenerTodasSync();
    const pendientes = ordenes.filter(o => o.estado === 'Pendiente').length;
    const enProceso = ordenes.filter(o => o.estado === 'En proceso').length;
    const completadas = ordenes.filter(o => o.estado === 'Completado').length;
    const total = ordenes.length;
    
    return { pendientes, enProceso, completadas, total };
  }

  private guardarTodas(ordenes: Orden[]) {
    this.storage.set(this.storage.keys.ORDENES, ordenes);
  }
}