import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface ConfigSistema {
  nombreInstitucion: string;
  correoNotif: string;
  diasRetencion: number;
  alertasAuto: 'Activadas' | 'Desactivadas';
  frecRespaldo: 'Diario' | 'Semanal' | 'Mensual';
  version: string;
  ultimaActualizacion?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configDefault: ConfigSistema = {
    nombreInstitucion: 'Universidad Laica Eloy Alfaro de Manabí',
    correoNotif: 'notificaciones@uleam.edu.ec',
    diasRetencion: 90,
    alertasAuto: 'Activadas',
    frecRespaldo: 'Diario',
    version: '1.0.0',
    ultimaActualizacion: new Date().toISOString()
  };

  constructor(private storage: StorageService) {
    this.inicializar();
  }

  private inicializar() {
    const config = this.obtener();
    if (!config) {
      this.guardar(this.configDefault);
    }
  }

  obtener(): ConfigSistema | null {
    return this.storage.get<ConfigSistema>(this.storage.keys.CONFIG);
  }

  guardar(config: ConfigSistema): boolean {
    const configConFecha = {
      ...config,
      ultimaActualizacion: new Date().toISOString()
    };
    return this.storage.set(this.storage.keys.CONFIG, configConFecha);
  }

  actualizar(cambios: Partial<ConfigSistema>): boolean {
    const actual = this.obtener() || this.configDefault;
    const nueva = { ...actual, ...cambios };
    return this.guardar(nueva);
  }

  restaurarDefecto(): boolean {
    return this.guardar(this.configDefault);
  }
}