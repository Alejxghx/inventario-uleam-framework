import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

interface InfoStorage {
  clave: string;
  tamano: string;
  items: number;
}

@Component({
  selector: 'app-storage-manager',
  standalone: true,
  imports: [NgFor, FormsModule],
  template: `
    <div class="barra_principal">
      <h1 class="titulo-principal">Gestión de Almacenamiento Local</h1>
      <button class="btn-rojo" (click)="volver()">← Volver</button>
    </div>

    <div style="max-width: 1200px; margin: auto; padding: 20px;">
      <div class="seccion">
        <h2>📊 Información de localStorage</h2>
        <div class="info-grid">
          <div class="info-card">
            <strong>Tamaño Total Usado:</strong>
            <div class="valor">{{ tamanoTotal }}</div>
          </div>
          <div class="info-card">
            <strong>Disponible:</strong>
            <div class="valor">{{ disponible ? '✅ Sí' : '❌ No' }}</div>
          </div>
        </div>
      </div>

      <div class="seccion">
        <h2>🗄️ Datos Almacenados</h2>
        <table class="tabla-admin">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Tamaño</th>
              <th>Elementos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let info of infoDatos">
              <td><strong>{{ info.clave }}</strong></td>
              <td>{{ info.tamano }}</td>
              <td>{{ info.items }}</td>
              <td>
                <button class="btn-accion ver" (click)="verDatos(info.clave)">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <h2>💾 Backup y Restauración</h2>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <button class="btn-verde" (click)="exportarTodo()">
            📥 Exportar Todo
          </button>
          <button class="btn-blue" (click)="fileInput.click()">
            📤 Importar Todo
          </button>
          <input 
            #fileInput 
            type="file" 
            accept=".json" 
            style="display: none" 
            (change)="importarArchivo($event)"
          />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          💡 Exporta todos tus datos para crear un respaldo o importa un archivo de respaldo previo.
        </p>
      </div>

      <div class="seccion" style="border-left: 4px solid #e74c3c;">
        <h2 style="color: #e74c3c;">⚠️ Zona Peligrosa</h2>
        <button class="btn-rojo" (click)="limpiarTodo()">
          🗑️ Limpiar Todos los Datos
        </button>
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
          ⚠️ Esta acción eliminará TODOS los datos del sistema y no se puede deshacer.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .info-card {
      background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #D32F2F;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .info-card strong {
      color: #546e7a;
      font-size: 0.9rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .valor {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
    }
  `]
})
export class StorageManagerComponent implements OnInit {
  tamanoTotal = '';
  disponible = false;
  infoDatos: InfoStorage[] = [];

  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarInfo();
  }

  cargarInfo() {
    this.tamanoTotal = this.storage.getTamanoUsado();
    this.disponible = this.storage.isDisponible();
    
    this.infoDatos = [
      this.getInfo('USUARIOS', 'Usuarios'),
      this.getInfo('INVENTARIO', 'Inventario'),
      this.getInfo('ORDENES', 'Órdenes'),
      this.getInfo('AUDITORIA', 'Auditoría'),
      this.getInfo('CONFIG', 'Configuración')
    ];
  }

  private getInfo(key: keyof typeof this.storage.keys, nombre: string): InfoStorage {
    const data = this.storage.get<any[]>(this.storage.keys[key]);
    const tamano = data 
      ? `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`
      : '0 KB';
    const items = Array.isArray(data) ? data.length : (data ? 1 : 0);
    
    return {
      clave: nombre,
      tamano,
      items
    };
  }

  verDatos(clave: string) {
    const keyMap: Record<string, string> = {
      'Usuarios': this.storage.keys.USUARIOS,
      'Inventario': this.storage.keys.INVENTARIO,
      'Órdenes': this.storage.keys.ORDENES,
      'Auditoría': this.storage.keys.AUDITORIA,
      'Configuración': this.storage.keys.CONFIG
    };
    
    const data = this.storage.get(keyMap[clave]);
    console.log(`📋 Datos de ${clave}:`, data);
    alert(`Los datos se mostraron en la consola del navegador (F12)`);
  }

  exportarTodo() {
    const json = this.storage.exportarTodo();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_uleam_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Respaldo exportado correctamente');
  }

  importarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      if (this.storage.importarTodo(json)) {
        alert('✅ Datos importados correctamente. Recargando página...');
        window.location.reload();
      } else {
        alert('❌ Error al importar datos. Verifica el archivo.');
      }
    };
    reader.readAsText(file);
  }

  limpiarTodo() {
    const confirmacion = prompt(
      '⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos.\n\n' +
      'Escribe "ELIMINAR TODO" para confirmar:'
    );
    
    if (confirmacion === 'ELIMINAR TODO') {
      if (this.storage.clearAll()) {
        alert('✅ Todos los datos han sido eliminados. Recargando...');
        window.location.reload();
      } else {
        alert('❌ Error al limpiar los datos');
      }
    }
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}