import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para gestionar localStorage
 * Todas las claves están documentadas y organizadas
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  // Claves de almacenamiento
  private readonly KEYS = {
    USUARIOS: 'uleam_usuarios',
    INVENTARIO: 'uleam_inventario',
    ORDENES: 'uleam_ordenes',
    AUDITORIA: 'uleam_auditoria',
    CONFIG: 'uleam_config',
    SESION: 'uleam_usuario_sesion',
    CONTADOR_ORDENES: 'uleam_contador_ordenes',
    VERSION: 'uleam_data_version'
  };

  private readonly DATA_VERSION = '1.0.0';

  constructor() {
    this.verificarVersion();
  }

  /**
   * Verificar versión de datos y migrar si es necesario
   */
  private verificarVersion() {
    const version = this.get(this.KEYS.VERSION);
    if (!version) {
      // Primera vez - inicializar versión
      this.set(this.KEYS.VERSION, this.DATA_VERSION);
    }
  }

  /**
   * Guardar dato en localStorage
   */
  set<T>(key: string, value: T): boolean {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      console.log(`✅ Guardado en localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error al guardar ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtener dato de localStorage
   */
  get<T>(key: string): T | null {
    try {
      const json = localStorage.getItem(key);
      if (!json) return null;
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`❌ Error al leer ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar dato de localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Eliminado de localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error al eliminar ${key}:`, error);
      return false;
    }
  }

  /**
   * Limpiar todos los datos del sistema (excepto sesión)
   */
  clearAll(): boolean {
    try {
      const sesion = this.get(this.KEYS.SESION);
      localStorage.clear();
      if (sesion) {
        this.set(this.KEYS.SESION, sesion);
      }
      console.log('🧹 localStorage limpiado');
      return true;
    } catch (error) {
      console.error('❌ Error al limpiar localStorage:', error);
      return false;
    }
  }

  /**
   * Exportar todos los datos del sistema
   */
  exportarTodo(): string {
    const datos = {
      version: this.DATA_VERSION,
      fecha: new Date().toISOString(),
      usuarios: this.get(this.KEYS.USUARIOS),
      inventario: this.get(this.KEYS.INVENTARIO),
      ordenes: this.get(this.KEYS.ORDENES),
      auditoria: this.get(this.KEYS.AUDITORIA),
      config: this.get(this.KEYS.CONFIG),
      contadorOrdenes: this.get(this.KEYS.CONTADOR_ORDENES)
    };
    return JSON.stringify(datos, null, 2);
  }

  /**
   * Importar datos al sistema
   */
  importarTodo(json: string): boolean {
    try {
      const datos = JSON.parse(json);
      
      if (datos.usuarios) this.set(this.KEYS.USUARIOS, datos.usuarios);
      if (datos.inventario) this.set(this.KEYS.INVENTARIO, datos.inventario);
      if (datos.ordenes) this.set(this.KEYS.ORDENES, datos.ordenes);
      if (datos.auditoria) this.set(this.KEYS.AUDITORIA, datos.auditoria);
      if (datos.config) this.set(this.KEYS.CONFIG, datos.config);
      if (datos.contadorOrdenes) this.set(this.KEYS.CONTADOR_ORDENES, datos.contadorOrdenes);
      
      console.log('✅ Datos importados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al importar datos:', error);
      return false;
    }
  }

  /**
   * Obtener tamaño aproximado de localStorage usado
   */
  getTamanoUsado(): string {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  }

  /**
   * Verificar si localStorage está disponible
   */
  isDisponible(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Getters para las claves
  get keys() {
    return this.KEYS;
  }
}