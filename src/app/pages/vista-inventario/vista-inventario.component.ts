import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService,
  Equipo,
  StatsInventario,
} from '../../services/inventario'; 

@Component({
  selector: 'app-vista-inventario',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './vista-inventario.component.html',
  styleUrls: ['./vista-inventario.component.scss'],
})
export class VistaInventarioComponent {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];

  tipos: string[] = [];
  ubicaciones: string[] = [];

  filtros = {
    busqueda: '',
    tipo: '',
    ubicacion: '',
    estado: '',
  };

  stats: StatsInventario = {
    total: 0,
    activos: 0,
    enReparacion: 0,
    dadosDeBaja: 0,
    valorTotal: 0,
  };

  formEquipo: Equipo = {
    nombre: '',
    tipo: '',
    ubicacion: '',
    estado: 'Activo',
    serie: '',
    responsable: '',
    marca: '',
    modelo: '',
    valor: 0,
    proveedor: '',
    notas: '',
  };

  editando = false;
  equipoEditandoId: number | null = null;

  constructor(
    private router: Router,
    private inventarioService: InventarioService,
  ) {
    this.cargarDatos();
  }

  // usar localStorage
  cargarDatos() {
    this.inventarioService.getTodosLocal().subscribe((lista) => {
      this.equipos = lista;
      this.aplicarFiltrosInterno();
      this.cargarFiltrosDesdeEquipos();

      const stats = this.inventarioService.obtenerEstadisticas(lista);
      this.stats = {
        total: stats.total,
        activos: stats.activos,
        enReparacion: stats.enReparacion,
        dadosDeBaja: stats.dadosDeBaja,
        valorTotal: stats.valorTotal,
      };
    });
  }

  private cargarFiltrosDesdeEquipos() {
    const tipos = new Set<string>();
    const ubicaciones = new Set<string>();

    this.equipos.forEach((e) => {
      if (e.tipo) tipos.add(e.tipo);
      if (e.ubicacion) ubicaciones.add(e.ubicacion);
    });

    this.tipos = Array.from(tipos).sort();
    this.ubicaciones = Array.from(ubicaciones).sort();
  }

  aplicarFiltros() {
    this.aplicarFiltrosInterno();
  }

  private aplicarFiltrosInterno() {
    const { busqueda, tipo, ubicacion, estado } = this.filtros;
    const q = busqueda.toLowerCase();

    this.equiposFiltrados = this.equipos.filter((eq) => {
      const coincideBusqueda =
        !q ||
        eq.nombre.toLowerCase().includes(q) ||
        eq.serie.toLowerCase().includes(q) ||
        eq.responsable.toLowerCase().includes(q);

      return (
        coincideBusqueda &&
        (!tipo || eq.tipo === tipo) &&
        (!ubicacion || eq.ubicacion === ubicacion) &&
        (!estado || eq.estado === estado)
      );
    });
  }

  limpiarFiltros() {
    this.filtros = { busqueda: '', tipo: '', ubicacion: '', estado: '' };
    this.cargarDatos();
  }

  badgeEstado(estado: string): string {
    if (estado === 'Activo') {
      return '<span class="badge-gris">✓ Activo</span>';
    }
    if (estado === 'En reparación') {
      return '<span class="badge-repar">⚠️ En reparación</span>';
    }
    if (estado === 'Dado de baja') {
      return '<span class="badge-baja">✖️ Dado de baja</span>';
    }
    return `<span class="badge-gris">${estado}</span>`;
  }

  guardarEquipo() {
    const equipo = { ...this.formEquipo };

    if (this.equipoEditandoId != null) {
      this.inventarioService
        .actualizar(this.equipoEditandoId, equipo)
        .subscribe(() => this.postGuardar('actualizado'));
    } else {
      this.inventarioService
        .crear(equipo)
        .subscribe(() => this.postGuardar('agregado'));
    }
  }

  private postGuardar(msg: 'agregado' | 'actualizado') {
    alert(`✅ Equipo ${msg} correctamente`);
    this.cargarDatos();
    this.cancelarEdicion();
    window.scrollTo(0, 0);
  }

  editarEquipo(eq: Equipo) {
    this.editando = true;
    this.equipoEditandoId = eq.id ?? null;
    this.formEquipo = { ...eq };
  }

  eliminarEquipo(eq: Equipo) {
    if (eq.id == null) return;
    if (!confirm(`¿Eliminar "${eq.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;

    this.inventarioService.eliminar(eq.id).subscribe(() => {
      alert('✅ Equipo eliminado correctamente');
      this.cargarDatos();
    });
  }

    nuevoEquipo() {
      this.cancelarEdicion();
    }

  cancelarEdicion() {
    this.editando = false;
    this.equipoEditandoId = null;
    this.formEquipo = {
      nombre: '',
      tipo: '',
      ubicacion: '',
      estado: 'Activo',
      serie: '',
      responsable: '',
      marca: '',
      modelo: '',
      valor: 0,
      proveedor: '',
      notas: '',
    };
  }

  cerrarSesion() {
    const globalAny = window as any;
    globalAny.SistemaULEAM?.Utils?.cerrarSesionGlobal();
    this.router.navigate(['/login']);
  }

  irGestionXmlJson() {
    this.router.navigate(['/exportacion-importacion']);
  }
}
