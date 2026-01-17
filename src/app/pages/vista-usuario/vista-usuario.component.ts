import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, Equipo, StatsInventario } from '../../services/inventario.service';
import { OrdenesService, Orden } from '../../services/ordenes.service';
import { AuditoriaService } from '../../services/auditoria.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vista-usuario',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, CurrencyPipe],
  templateUrl: './vista-usuario.component.html',
  styleUrls: ['./vista-usuario.component.scss'],
})
export class VistaUsuarioComponent implements OnInit {
  tabActivo: 'inventario' | 'ubicaciones' | 'estadisticas' | 'mantenimientos' = 'inventario';

  equipos: Equipo[] = [];
  inventarioFiltrado: Equipo[] = [];

  tipos: string[] = [];
  ubicaciones: string[] = [];

  filtros = {
    tipo: '',
    ubicacion: '',
    estado: '',
    buscar: '',
  };

  stats: StatsInventario = { total: 0, activos: 0, enReparacion: 0, dadosDeBaja: 0, valorTotal: 0 };
  porcActivos = 0;
  porcReparacion = 0;
  porcBaja = 0;
  resumenTexto = 'Cargando datos...';

  resumenUbicaciones: { nombre: string; total: number; activos: number; tipos: { tipo: string; cantidad: number }[] }[] = [];
  barrasTipos: { tipo: string; cantidad: number; altura: number; color: string }[] = [];

  inversionTotal = 0;
  promedioEquipo = 0;
  valorReparacion = 0;

  timelineMantenimiento: Orden[] = [];

  constructor(
    private router: Router,
    private inventarioService: InventarioService,
    private ordenesService: OrdenesService,
    private auditoriaService: AuditoriaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    console.log('🔍 Vista Usuario - Cargando datos...');
    
    this.inventarioService.getTodosLocal().subscribe(equipos => {
      console.log('✅ Equipos cargados:', equipos.length);
      
      this.equipos = equipos;
      this.inventarioFiltrado = [...this.equipos];

      const stats = this.inventarioService.obtenerEstadisticas(equipos);
      this.stats = stats;

      const total = stats.total || 0;
      this.porcActivos = total ? Math.round((stats.activos / total) * 100) : 0;
      this.porcReparacion = total ? Math.round((stats.enReparacion / total) * 100) : 0;
      this.porcBaja = total ? Math.round((stats.dadosDeBaja / total) * 100) : 0;

      const ubicacionesUnicas = new Set(this.equipos.map((e) => e.ubicacion)).size;
      this.resumenTexto = `Su facultad cuenta con <strong>${total} equipos registrados</strong> distribuidos en <strong>${ubicacionesUnicas} ubicaciones</strong>. 
        El <strong>${this.porcActivos}% están operativos</strong> y hay <strong>${stats.enReparacion} equipos</strong> en mantenimiento.`;

      this.inversionTotal = stats.valorTotal;
      this.promedioEquipo = total ? stats.valorTotal / total : 0;
      this.valorReparacion = this.equipos
        .filter((e) => e.estado === 'En reparación')
        .reduce((sum, e) => sum + (e.valor || 0), 0);

      this.cargarFiltrosBase();
      this.calcularUbicaciones();
      this.calcularBarrasTipos();
    });

    // Cargar órdenes para el timeline
    this.ordenesService.obtenerTodas().subscribe(ordenes => {
      console.log('✅ Órdenes cargadas:', ordenes.length);
      this.calcularTimeline(ordenes);
    });
  }

  cargarFiltrosBase() {
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
    const { tipo, ubicacion, estado, buscar } = this.filtros;
    const q = buscar.toLowerCase();

    this.inventarioFiltrado = this.equipos.filter((item) => {
      const coincideBusqueda =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.serie.toLowerCase().includes(q) ||
        item.responsable.toLowerCase().includes(q);

      return (
        coincideBusqueda &&
        (!tipo || item.tipo === tipo) &&
        (!ubicacion || item.ubicacion === ubicacion) &&
        (!estado || item.estado === estado)
      );
    });
  }

  badgeClase(estado: string) {
    if (estado === 'En reparación') return 'reparacion';
    if (estado === 'Dado de baja') return 'baja';
    return 'activo';
  }

  cambiarTab(tab: 'inventario' | 'ubicaciones' | 'estadisticas' | 'mantenimientos') {
    this.tabActivo = tab;

    if (tab === 'ubicaciones') this.calcularUbicaciones();
    if (tab === 'estadisticas') this.calcularBarrasTipos();
  }

  calcularUbicaciones() {
    const mapa: Record<string, { total: number; activos: number; porTipo: Record<string, number> }> = {};
    this.equipos.forEach((eq) => {
      if (!mapa[eq.ubicacion]) {
        mapa[eq.ubicacion] = { total: 0, activos: 0, porTipo: {} };
      }
      const m = mapa[eq.ubicacion];
      m.total++;
      if (eq.estado === 'Activo') m.activos++;
      m.porTipo[eq.tipo] = (m.porTipo[eq.tipo] || 0) + 1;
    });

    this.resumenUbicaciones = Object.entries(mapa).map(([nombre, datos]) => ({
      nombre,
      total: datos.total,
      activos: datos.activos,
      tipos: Object.entries(datos.porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad })),
    }));
  }

  calcularBarrasTipos() {
    const conteo: Record<string, number> = {};
    this.equipos.forEach((eq) => {
      conteo[eq.tipo] = (conteo[eq.tipo] || 0) + 1;
    });
    const max = Math.max(...Object.values(conteo), 1);

    const colores: Record<string, string> = {
      Computador: 'linear-gradient(to top, #47b562, #6fd68a)',
      Proyector: 'linear-gradient(to top, #3477f7, #5a95f9)',
      Impresora: 'linear-gradient(to top, #f39c12, #f5b041)',
      Tablet: 'linear-gradient(to top, #9b59b6, #bb8fce)',
      Servidor: 'linear-gradient(to top, #e74c3c, #ec7063)',
      Router: 'linear-gradient(to top, #1abc9c, #48c9b0)',
      UPS: 'linear-gradient(to top, #34495e, #5d6d7e)',
    };

    this.barrasTipos = Object.entries(conteo).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      altura: (cantidad / max) * 100,
      color: colores[tipo] || 'linear-gradient(to top, #95a5a6, #bdc3c7)',
    }));
  }

  calcularTimeline(ordenes: Orden[]) {
    this.timelineMantenimiento = ordenes.slice().reverse().slice(0, 10);
  }

  exportarExcel() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Usuario';

    this.auditoriaService.registrar({
      usuario: usuarioActual,
      accion: 'Exportación Excel',
      modulo: 'Reportes',
      detalles: `Exportación de inventario completo (${this.equipos.length} equipos)`
    });

    // Crear CSV (como Excel básico)
    const headers = ['Equipo', 'Tipo', 'Ubicación', 'Estado', 'Serie', 'Responsable', 'Valor', 'Fecha'];
    const rows = this.inventarioFiltrado.map(e => [
      e.nombre,
      e.tipo,
      e.ubicacion,
      e.estado,
      e.serie,
      e.responsable,
      e.valor?.toString() || '0',
      e.fecha || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    alert('✅ Archivo Excel descargado correctamente');
  }

  exportarPDF() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Usuario';

    this.auditoriaService.registrar({
      usuario: usuarioActual,
      accion: 'Exportación PDF',
      modulo: 'Reportes',
      detalles: `Generación de reporte PDF (${this.equipos.length} equipos)`
    });

    // Abrir ventana de impresión (simula PDF)
    window.print();
    
    alert('📄 Use "Guardar como PDF" en la ventana de impresión');
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