import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

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
  fechaCreacion?: string;
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
  constructor(private storage: StorageService) {
    this.inicializarDatos();
  }

  private inicializarDatos() {
    const equipos = this.obtenerTodosSync();
    if (equipos.length === 0) {
      console.log('📝 Inicializando inventario por defecto en localStorage...');
      const inicial: Equipo[] = [
        {
          id: 1,
          nombre: 'PC Docencia Lab 12',
          tipo: 'Computador',
          ubicacion: 'Bloque A — Lab 3',
          estado: 'Activo',
          serie: 'SER-PC-009812',
          responsable: 'Juan Pérez',
          marca: 'Dell',
          modelo: 'Optiplex 7090',
          valor: 850.00,
          proveedor: 'TechSupply EC',
          notas: 'Equipo en perfectas condiciones',
          fecha: '15/01/2024',
          fechaCreacion: '15/01/2024'
        },
        {
          id: 2,
          nombre: 'Proyector Aula Magna',
          tipo: 'Proyector',
          ubicacion: 'Bloque B — Aula Magna',
          estado: 'Activo',
          serie: 'PROJ-2023-045',
          responsable: 'María López',
          marca: 'Epson',
          modelo: 'PowerLite X49',
          valor: 1200.00,
          proveedor: 'Visual Tech',
          notas: 'Instalado en diciembre 2023',
          fecha: '20/12/2023',
          fechaCreacion: '20/12/2023'
        },
        {
          id: 3,
          nombre: 'Impresora Multifunción',
          tipo: 'Impresora',
          ubicacion: 'Secretaría Académica',
          estado: 'En reparación',
          serie: 'IMP-2022-189',
          responsable: 'Carlos Ruiz',
          marca: 'HP',
          modelo: 'LaserJet Pro M428',
          valor: 650.00,
          proveedor: 'Office Solutions',
          notas: 'En mantenimiento por atasco de papel',
          fecha: '10/03/2023',
          fechaCreacion: '10/03/2023'
        },
        {
          id: 4,
          nombre: 'Laptop Lenovo ThinkPad',
          tipo: 'Computador',
          ubicacion: 'Decanato',
          estado: 'Activo',
          serie: 'LAP-2024-001',
          responsable: 'Ana Torres',
          marca: 'Lenovo',
          modelo: 'ThinkPad E14',
          valor: 920.00,
          proveedor: 'TechSupply EC',
          notas: 'Asignada al Decano',
          fecha: '05/01/2024',
          fechaCreacion: '05/01/2024'
        },
        {
          id: 5,
          nombre: 'Router Cisco 2900',
          tipo: 'Router',
          ubicacion: 'Centro de Cómputo',
          estado: 'Activo',
          serie: 'RTR-CISCO-045',
          responsable: 'Pedro Sánchez',
          marca: 'Cisco',
          modelo: '2900 Series',
          valor: 1500.00,
          proveedor: 'NetWork Solutions',
          notas: 'Router principal del edificio',
          fecha: '10/11/2023',
          fechaCreacion: '10/11/2023'
        }
      ];
      this.guardarTodos(inicial);
      console.log('✅ Inventario inicializado en localStorage');
    } else {
      console.log(`✅ Se cargaron ${equipos.length} equipos de localStorage`);
    }
  }

  private obtenerTodosSync(): Equipo[] {
    return this.storage.get<Equipo[]>(this.storage.keys.INVENTARIO) || [];
  }

  getTodosLocal(): Observable<Equipo[]> {
    return of(this.obtenerTodosSync());
  }

  crear(equipo: Equipo): Observable<Equipo> {
    const equipos = this.obtenerTodosSync();
    const nuevoId = equipos.length > 0 
      ? Math.max(...equipos.map(e => e.id || 0)) + 1 
      : 1;
    
    const nuevoEquipo: Equipo = {
      ...equipo,
      id: nuevoId,
      fecha: equipo.fecha || new Date().toLocaleDateString('es-EC'),
      fechaCreacion: new Date().toLocaleDateString('es-EC')
    };
    
    equipos.push(nuevoEquipo);
    this.guardarTodos(equipos);
    
    console.log('✅ Equipo agregado:', nuevoEquipo);
    return of(nuevoEquipo);
  }

  actualizar(id: number, equipo: Equipo): Observable<Equipo> {
    const equipos = this.obtenerTodosSync();
    const index = equipos.findIndex(e => e.id === id);
    
    if (index !== -1) {
      equipos[index] = { ...equipo, id };
      this.guardarTodos(equipos);
      console.log('✅ Equipo actualizado:', equipos[index]);
      return of(equipos[index]);
    }
    
    return of(equipo);
  }

  eliminar(id: number): Observable<void> {
    const equipos = this.obtenerTodosSync();
    const filtrados = equipos.filter(e => e.id !== id);
    this.guardarTodos(filtrados);
    console.log(`🗑️ Equipo con ID ${id} eliminado`);
    return of(void 0);
  }

  obtenerEstadisticas(lista?: Equipo[]): StatsInventario {
    const equipos = lista || this.obtenerTodosSync();
    const total = equipos.length;
    const activos = equipos.filter(e => e.estado === 'Activo').length;
    const enReparacion = equipos.filter(e => e.estado === 'En reparación').length;
    const dadosDeBaja = equipos.filter(e => e.estado === 'Dado de baja').length;
    const valorTotal = equipos.reduce((s, e) => s + (e.valor || 0), 0);
    
    return { total, activos, enReparacion, dadosDeBaja, valorTotal };
  }

  private guardarTodos(equipos: Equipo[]) {
    this.storage.set(this.storage.keys.INVENTARIO, equipos);
  }

  buscarPorSerie(serie: string): Equipo | null {
    const equipos = this.obtenerTodosSync();
    return equipos.find(e => e.serie === serie) || null;
  }
}