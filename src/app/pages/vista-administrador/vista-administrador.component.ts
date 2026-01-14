import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id?: number;
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  rol: string;
  estado: string;
  ultimoAcceso?: string;
}

interface RegistroAuditoria {
  fecha: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalles: string;
}

@Component({
  selector: 'app-vista-administrador',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './vista-administrador.component.html',
  styleUrls: ['./vista-administrador.component.scss'],
})
export class VistaAdministradorComponent {
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

  constructor(private router: Router) {
    this.cargarDatos(); // aquí luego metemos las llamadas a SistemaULEAM
  }

  cargarDatos() {
    // TODO: leer de SistemaULEAM.* y llenar usuarios, stats y registrosAuditoria
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
    if (this.usuarioEditandoId != null) {
      // editar
      // TODO: llamar a SistemaULEAM.Usuarios.actualizar(...)
    } else {
      // nuevo
      // TODO: llamar a SistemaULEAM.Usuarios.agregar(...)
    }
    this.cerrarModal();
    this.cargarDatos();
  }

  eliminarUsuario(user: Usuario) {
    // TODO: confirm + SistemaULEAM.Usuarios.eliminar(user.id)
    this.cargarDatos();
  }

  guardarConfiguracion() {
    alert('✅ Configuración guardada correctamente');
  }

  cerrarSesion() {
    // TODO: SistemaULEAM.Utils.cerrarSesionGlobal();
    this.router.navigate(['/login']);
  }

  irGestionXmlJson() {
    this.router.navigate(['/exportacion-importacion']);
  }
}
