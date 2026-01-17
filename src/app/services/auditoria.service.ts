import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface RegistroAuditoria {
  id?: number;
  fecha: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalles: string;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private maxRegistros = 500; // Límite de registros a mantener

  constructor(private storage: StorageService) {
    this.inicializarDatos();
  }

  private inicializarDatos() {
    const registros = this.obtenerTodos();
    if (registros.length === 0) {
      console.log('📝 Inicializando auditoría por defecto en localStorage...');
      const inicial: RegistroAuditoria[] = [
        {
          id: 1,
          fecha: '15/01/2024 10:30',
          usuario: 'admin',
          accion: 'Inicio de sesión',
          modulo: 'Autenticación',
          detalles: 'Acceso exitoso al sistema'
        },
        {
          id: 2,
          fecha: '15/01/2024 10:35',
          usuario: 'admin',
          accion: 'Creación de usuario',
          modulo: 'Usuarios',
          detalles: 'Nuevo usuario: inventario'
        },
        {
          id: 3,
          fecha: '15/01/2024 11:20',
          usuario: 'inventario',
          accion: 'Registro de equipo',
          modulo: 'Inventario',
          detalles: 'Equipo: PC Docencia Lab 12'
        },
        {
          id: 4,
          fecha: '15/01/2024 14:15',
          usuario: 'mantenimiento',
          accion: 'Creación de orden',
          modulo: 'Mantenimiento',
          detalles: 'Orden ORD-001 creada'
        },
        {
          id: 5,
          fecha: '15/01/2024 15:00',
          usuario: 'admin',
          accion: 'Actualización de configuración',
          modulo: 'Configuración',
          detalles: 'Días de retención cambiados a 90'
        }
      ];
      this.guardarTodos(inicial);
      console.log('✅ Auditoría inicializada en localStorage');
    } else {
      console.log(`✅ Se cargaron ${registros.length} registros de auditoría de localStorage`);
    }
  }

  obtenerTodos(): RegistroAuditoria[] {
    return this.storage.get<RegistroAuditoria[]>(this.storage.keys.AUDITORIA) || [];
  }

  registrar(registro: Omit<RegistroAuditoria, 'id' | 'fecha'>) {
    const registros = this.obtenerTodos();
    const nuevoId = registros.length > 0 
      ? Math.max(...registros.map(r => r.id || 0)) + 1 
      : 1;
    
    const nuevoRegistro: RegistroAuditoria = {
      id: nuevoId,
      fecha: new Date().toLocaleString('es-EC'),
      usuario: registro.usuario,
      accion: registro.accion,
      modulo: registro.modulo,
      detalles: registro.detalles
    };
    
    registros.unshift(nuevoRegistro); // Agregar al inicio
    
    // Mantener solo los últimos N registros
    if (registros.length > this.maxRegistros) {
      registros.splice(this.maxRegistros);
    }
    
    this.guardarTodos(registros);
    console.log('📝 Registro de auditoría guardado:', nuevoRegistro);
  }

  obtenerPorModulo(modulo: string): RegistroAuditoria[] {
    const registros = this.obtenerTodos();
    return registros.filter(r => r.modulo === modulo);
  }

  obtenerPorUsuario(usuario: string): RegistroAuditoria[] {
    const registros = this.obtenerTodos();
    return registros.filter(r => r.usuario === usuario);
  }

  obtenerPorFecha(fechaInicio: Date, fechaFin: Date): RegistroAuditoria[] {
    const registros = this.obtenerTodos();
    return registros.filter(r => {
      const fecha = new Date(r.fecha);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }

  limpiarAntiguos(diasRetencion: number = 90) {
    const registros = this.obtenerTodos();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);
    
    const filtrados = registros.filter(r => {
      const fecha = new Date(r.fecha);
      return fecha >= fechaLimite;
    });
    
    this.guardarTodos(filtrados);
    console.log(`🧹 Auditoría limpiada. Removidos ${registros.length - filtrados.length} registros antiguos`);
  }

  private guardarTodos(registros: RegistroAuditoria[]) {
    this.storage.set(this.storage.keys.AUDITORIA, registros);
  }

  exportarCSV(): string {
    const registros = this.obtenerTodos();
    const headers = 'ID,Fecha,Usuario,Acción,Módulo,Detalles\n';
    const rows = registros.map(r => 
      `${r.id},"${r.fecha}","${r.usuario}","${r.accion}","${r.modulo}","${r.detalles}"`
    ).join('\n');
    return headers + rows;
  }
}