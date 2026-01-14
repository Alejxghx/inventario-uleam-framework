import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HistorialItem {
  fecha: string;
  accion: string;
}

interface Orden {
  id: string;
  equipoId: number;
  equipoNombre: string;
  ubicacion: string;
  estado: string;
  prioridad: string;
  tipo: string;
  asignado: string;
  fechaCreacion: string;
  fechaLimite: string;
  descripcion: string;
  historial: HistorialItem[];
}

interface EquipoInv {
  id: number;
  nombre: string;
  ubicacion: string;
  serie: string;
}

interface StatsOrdenes {
  pendientes: number;
  enProceso: number;
  completadas: number;
  total: number;
}

@Component({
  selector: 'app-vista-mantenimiento',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './vista-mantenimiento.component.html',
  styleUrls: ['./vista-mantenimiento.component.scss'],
})
export class VistaMantenimientoComponent {
  stats: StatsOrdenes = { pendientes: 0, enProceso: 0, completadas: 0, total: 0 };

  tabActivo: 'ordenes' | 'historial' | 'calendario' = 'ordenes';

  ordenes: Orden[] = [];
  ordenesFiltradas: Orden[] = [];
  historialEquipos: { equipo: EquipoInv; ordenes: Orden[] }[] = [];
  ordenesCalendario: Orden[] = [];

  filtros = {
    busqueda: '',
    estado: '',
    prioridad: '',
  };

  modalNuevaAbierto = false;
  modalDetalleAbierto = false;

  equiposInventario: EquipoInv[] = [];

  formOrden = {
    equipoId: '' as number | '' ,
    tipo: '',
    prioridad: 'Media',
    asignado: '',
    fechaLimite: '',
    descripcion: '',
  };

  ordenActual: Orden | null = null;
  notaNueva = '';

  constructor(private router: Router) {
    this.cargarDatos();
  }

  private get Sistema() {
    return (window as any).SistemaULEAM;
  }

  cargarDatos() {
    if (!this.Sistema) {
      console.error('SistemaULEAM no disponible');
      return;
    }

    this.ordenes = this.Sistema.Ordenes.obtenerTodas();
    this.equiposInventario = this.Sistema.Inventario.obtenerTodos();
    this.actualizarEstadisticas();
    this.filtrarOrdenes();
    this.calcularHistorial();
    this.calcularCalendario();
  }

  actualizarEstadisticas() {
    const s = this.Sistema.Ordenes.obtenerEstadisticas();
    this.stats = {
      pendientes: s.pendientes,
      enProceso: s.enProceso,
      completadas: s.completadas,
      total: s.total,
    };
  }

  filtrarOrdenes() {
    const { busqueda, estado, prioridad } = this.filtros;
    const q = busqueda.toLowerCase();

    this.ordenesFiltradas = this.ordenes.filter((orden) => {
      const coincideBusqueda =
        !q ||
        orden.id.toLowerCase().includes(q) ||
        orden.equipoNombre.toLowerCase().includes(q);

      return (
        coincideBusqueda &&
        (!estado || orden.estado === estado) &&
        (!prioridad || orden.prioridad === prioridad)
      );
    });
  }

  limpiarFiltros() {
    this.filtros = { busqueda: '', estado: '', prioridad: '' };
    this.cargarDatos();
  }

  cambiarTab(tab: 'ordenes' | 'historial' | 'calendario') {
    this.tabActivo = tab;

    if (tab === 'historial') this.calcularHistorial();
    if (tab === 'calendario') this.calcularCalendario();
  }

  calcularHistorial() {
    const inv = this.equiposInventario;
    const ords = this.ordenes;
    const equiposConOrdenes = inv.filter((eq) =>
      ords.some((o: Orden) => o.equipoId === eq.id),
    );

    this.historialEquipos = equiposConOrdenes.map((eq) => ({
      equipo: eq,
      ordenes: ords
        .filter((o: Orden) => o.equipoId === eq.id)
        .sort((a, b) => (a.fechaCreacion < b.fechaCreacion ? 1 : -1)),
    }));
  }

  calcularCalendario() {
    this.ordenesCalendario = this.ordenes.filter(
      (o) => o.estado === 'Pendiente' || o.estado === 'En proceso',
    );
  }

  claseEstado(orden: Orden) {
    return orden.estado.toLowerCase().replace(' ', '');
  }

  colorPrioridad(prioridad: string) {
    if (prioridad === 'Alta') return '#e74c3c';
    if (prioridad === 'Media') return '#f39c12';
    return '#3498db';
  }

  bgColorPrioridad(prioridad: string) {
    if (prioridad === 'Alta') return '#fff5f5';
    if (prioridad === 'Media') return '#fffbf0';
    return '#f0f8ff';
  }

  abrirModalNuevaOrden() {
    this.modalNuevaAbierto = true;
  }

  cerrarModalOrden() {
    this.modalNuevaAbierto = false;
    this.formOrden = {
      equipoId: '',
      tipo: '',
      prioridad: 'Media',
      asignado: '',
      fechaLimite: '',
      descripcion: '',
    };
  }

  guardarOrden() {
    if (!this.Sistema) return;

    const equipoId = Number(this.formOrden.equipoId);
    const equipo = this.equiposInventario.find((e) => e.id === equipoId);
    if (!equipo) {
      alert('Por favor selecciona un equipo');
      return;
    }

    const nuevaOrden = {
      equipoId: equipo.id,
      equipoNombre: equipo.nombre,
      ubicacion: equipo.ubicacion,
      estado: 'Pendiente',
      prioridad: this.formOrden.prioridad,
      tipo: this.formOrden.tipo,
      asignado: this.formOrden.asignado,
      fechaLimite: new Date(this.formOrden.fechaLimite).toLocaleDateString('es-EC'),
      descripcion: this.formOrden.descripcion,
    };

    this.Sistema.Ordenes.agregar(nuevaOrden);
    alert('✅ Orden de trabajo creada correctamente');
    this.cerrarModalOrden();
    this.cargarDatos();
  }

  verDetalleOrden(orden: Orden) {
    this.ordenActual = orden;
    this.notaNueva = '';
    this.modalDetalleAbierto = true;
  }

  cerrarModalDetalle() {
    this.modalDetalleAbierto = false;
    this.ordenActual = null;
    this.notaNueva = '';
  }

  agregarNotaOrden() {
    if (!this.Sistema || !this.ordenActual) return;
    const nota = this.notaNueva.trim();
    if (!nota) {
      alert('Por favor escribe una nota');
      return;
    }

    this.Sistema.Ordenes.agregarNota(this.ordenActual.id, nota);
    alert('✅ Nota agregada correctamente');
    this.cargarDatos();
    const actualizada = this.ordenes.find((o) => o.id === this.ordenActual!.id);
    if (actualizada) this.ordenActual = actualizada;
    this.notaNueva = '';
  }

  cambiarEstadoOrden(orden: Orden, nuevoEstado: string) {
    if (!this.Sistema) return;
    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    this.Sistema.Ordenes.cambiarEstado(orden.id, nuevoEstado);
    alert('✅ Estado actualizado correctamente');
    this.cargarDatos();
  }

  cerrarSesion() {
    this.Sistema?.Utils?.cerrarSesionGlobal();
    this.router.navigate(['/login']);
  }

  irGestionXmlJson() {
    this.router.navigate(['/exportacion-importacion']);
  }
}
