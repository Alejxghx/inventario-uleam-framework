import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService, Orden, HistorialItem, StatsOrdenes } from '../../services/ordenes.service';
import { InventarioService, Equipo } from '../../services/inventario.service';
import { AuditoriaService } from '../../services/auditoria.service';
import { AuthService } from '../../services/auth.service';

interface EquipoInv {
  id: number;
  nombre: string;
  ubicacion: string;
  serie: string;
}

@Component({
  selector: 'app-vista-mantenimiento',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './vista-mantenimiento.component.html',
  styleUrls: ['./vista-mantenimiento.component.scss'],
})
export class VistaMantenimientoComponent implements OnInit {
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
    equipoId: '' as number | '',
    tipo: '',
    prioridad: 'Media',
    asignado: '',
    fechaLimite: '',
    descripcion: '',
  };

  ordenActual: Orden | null = null;
  notaNueva = '';

  constructor(
    private router: Router,
    private ordenesService: OrdenesService,
    private inventarioService: InventarioService,
    private auditoriaService: AuditoriaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar órdenes
    this.ordenesService.obtenerTodas().subscribe(ordenes => {
      this.ordenes = ordenes;
      this.actualizarEstadisticas();
      this.filtrarOrdenes();
      this.calcularHistorial();
      this.calcularCalendario();
    });

    // Cargar equipos del inventario
    this.inventarioService.getTodosLocal().subscribe(equipos => {
      this.equiposInventario = equipos.map(e => ({
        id: e.id || 0,
        nombre: e.nombre,
        ubicacion: e.ubicacion,
        serie: e.serie
      }));
    });
  }

  actualizarEstadisticas() {
    this.stats = this.ordenesService.obtenerEstadisticas();
  }

  filtrarOrdenes() {
    const { busqueda, estado, prioridad } = this.filtros;
    const q = busqueda.toLowerCase();

    this.ordenesFiltradas = this.ordenes.filter((orden) => {
      const coincideBusqueda =
        !q ||
        orden.id?.toLowerCase().includes(q) ||
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
    this.filtrarOrdenes();
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
        .sort((a, b) => (a.fechaCreacion && b.fechaCreacion && a.fechaCreacion < b.fechaCreacion ? 1 : -1)),
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
    const equipoId = Number(this.formOrden.equipoId);
    const equipo = this.equiposInventario.find((e) => e.id === equipoId);
    
    if (!equipo) {
      alert('Por favor selecciona un equipo');
      return;
    }

    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    const nuevaOrden: Partial<Orden> = {
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

    this.ordenesService.agregar(nuevaOrden).subscribe(orden => {
      // Registrar en auditoría
      this.auditoriaService.registrar({
        usuario: usuarioActual,
        accion: 'Creación de orden',
        modulo: 'Mantenimiento',
        detalles: `Orden ${orden.id} creada para equipo: ${orden.equipoNombre}`
      });

      alert('✅ Orden de trabajo creada correctamente');
      this.cerrarModalOrden();
      this.cargarDatos();
    });
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
    if (!this.ordenActual || !this.ordenActual.id) return;
    
    const nota = this.notaNueva.trim();
    if (!nota) {
      alert('Por favor escribe una nota');
      return;
    }

    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    this.ordenesService.agregarNota(this.ordenActual.id, `${usuarioActual}: ${nota}`)
      .subscribe(ordenActualizada => {
        if (ordenActualizada) {
          alert('✅ Nota agregada correctamente');
          this.ordenActual = ordenActualizada;
          this.notaNueva = '';
          this.cargarDatos();
        }
      });
  }

  cambiarEstadoOrden(orden: Orden, nuevoEstado: string) {
    if (!orden.id) return;
    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    this.ordenesService.cambiarEstado(orden.id, nuevoEstado).subscribe(() => {
      // Registrar en auditoría
      this.auditoriaService.registrar({
        usuario: usuarioActual,
        accion: 'Cambio de estado',
        modulo: 'Mantenimiento',
        detalles: `Orden ${orden.id}: ${orden.estado} → ${nuevoEstado}`
      });

      alert('✅ Estado actualizado correctamente');
      this.cargarDatos();
    });
  }

  cerrarSesion() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Usuario';

    this.auditoriaService.registrar({
      usuario: usuarioActual,
      accion: 'Cierre de sesión',
      modulo: 'Autenticación',
      detalles: 'Sesión cerrada'
    });

    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irGestionXmlJson() {
    this.router.navigate(['/storage-manager']);
  }
}