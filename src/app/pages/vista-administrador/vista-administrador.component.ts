import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { InventarioService } from '../../services/inventario.service';
import { OrdenesService } from '../../services/ordenes.service';
import { AuditoriaService, RegistroAuditoria } from '../../services/auditoria.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vista-administrador',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './vista-administrador.component.html',
  styleUrls: ['./vista-administrador.component.scss'],
})
export class VistaAdministradorComponent implements OnInit {
  // estadísticas
  totalUsuarios = 0;
  totalEquipos = 0;
  equiposReparacion = 0;
  ordenesCompletadas = 0;

  // tabs
  tabActivo: 'usuarios' | 'permisos' | 'auditoria' | 'config' = 'usuarios';

  // datos
  usuarios: Usuario[] = [];
  registrosAuditoria: RegistroAuditoria[] = [];

  // modal
  modalAbierto = false;
  modalTitulo = 'Nuevo Usuario';
  formUsuario: Usuario = {
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    rol: '',
    estado: 'Activo',
  };
  usuarioEditandoId: number | null = null;

  // configuración
  config = {
    nombreInstitucion: 'Universidad Laica Eloy Alfaro de Manabí',
    correoNotif: 'notificaciones@uleam.edu.ec',
    diasRetencion: 90,
    alertasAuto: 'Activadas',
    frecRespaldo: 'Diario',
  };

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private inventarioService: InventarioService,
    private ordenesService: OrdenesService,
    private auditoriaService: AuditoriaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar usuarios
    this.usuarios = this.usuariosService.obtenerTodos();
    this.totalUsuarios = this.usuarios.length;

    // Cargar estadísticas de inventario
    this.inventarioService.getTodosLocal().subscribe(equipos => {
      const stats = this.inventarioService.obtenerEstadisticas(equipos);
      this.totalEquipos = stats.total;
      this.equiposReparacion = stats.enReparacion;
    });

    // Cargar estadísticas de órdenes
    const statsOrdenes = this.ordenesService.obtenerEstadisticas();
    this.ordenesCompletadas = statsOrdenes.completadas;

    // Cargar auditoría
    this.registrosAuditoria = this.auditoriaService.obtenerTodos();
  }

  cambiarTab(tab: 'usuarios' | 'permisos' | 'auditoria' | 'config') {
    this.tabActivo = tab;
  }

  abrirModalNuevo() {
    this.modalTitulo = 'Nuevo Usuario';
    this.formUsuario = {
      nombre: '',
      usuario: '',
      email: '',
      password: '',
      rol: '',
      estado: 'Activo',
    };
    this.usuarioEditandoId = null;
    this.modalAbierto = true;
  }

  editarUsuario(user: Usuario) {
    this.modalTitulo = 'Editar Usuario';
    this.formUsuario = { ...user };
    this.usuarioEditandoId = user.id ?? null;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.usuarioEditandoId = null;
  }

  guardarUsuario() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    if (this.usuarioEditandoId != null) {
      // Editar usuario existente
      this.usuariosService.actualizar(this.usuarioEditandoId, this.formUsuario)
        .subscribe(() => {
          // Registrar en auditoría
          this.auditoriaService.registrar({
            usuario: usuarioActual,
            accion: 'Actualización de usuario',
            modulo: 'Usuarios',
            detalles: `Usuario actualizado: ${this.formUsuario.usuario}`
          });
          
          alert('✅ Usuario actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        });
    } else {
      // Crear nuevo usuario
      this.usuariosService.agregar(this.formUsuario)
        .subscribe(() => {
          // Registrar en auditoría
          this.auditoriaService.registrar({
            usuario: usuarioActual,
            accion: 'Creación de usuario',
            modulo: 'Usuarios',
            detalles: `Nuevo usuario: ${this.formUsuario.usuario}`
          });
          
          alert('✅ Usuario creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        });
    }
  }

  eliminarUsuario(user: Usuario) {
    if (!user.id) return;
    
    if (!confirm(`¿Está seguro de eliminar al usuario "${user.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    this.usuariosService.eliminar(user.id).subscribe(() => {
      // Registrar en auditoría
      this.auditoriaService.registrar({
        usuario: usuarioActual,
        accion: 'Eliminación de usuario',
        modulo: 'Usuarios',
        detalles: `Usuario eliminado: ${user.usuario}`
      });
      
      alert('✅ Usuario eliminado correctamente');
      this.cargarDatos();
    });
  }

  guardarConfiguracion() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Sistema';

    // Guardar configuración en localStorage
    try {
      localStorage.setItem('uleam_config', JSON.stringify(this.config));
      
      // Registrar en auditoría
      this.auditoriaService.registrar({
        usuario: usuarioActual,
        accion: 'Actualización de configuración',
        modulo: 'Configuración',
        detalles: 'Configuración del sistema actualizada'
      });
      
      alert('✅ Configuración guardada correctamente');
    } catch (e) {
      alert('❌ Error al guardar la configuración');
      console.error(e);
    }
  }

  cerrarSesion() {
    const sesion = this.authService.getSesion();
    const usuarioActual = sesion?.nombre || 'Usuario';

    // Registrar cierre de sesión
    this.auditoriaService.registrar({
      usuario: usuarioActual,
      accion: 'Cierre de sesión',
      modulo: 'Autenticación',
      detalles: 'Sesión cerrada correctamente'
    });

    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irGestionXmlJson() {
    this.router.navigate(['/storage-manager']);
  }
}