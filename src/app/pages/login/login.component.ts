import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService, UsuarioSesion } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service'; 

type RolKey =
  | 'Administrador'
  | 'Encargado de Inventario'
  | 'Técnico de Mantenimiento'
  | 'Decanos, Directores y Profesores';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  rol: RolKey = 'Administrador';
  titulo = 'Ingreso para Administrador';
  rolBreve = 'Administrador';
  permisosHtml = '';
  usuario = '';
  clave = '';
  error = false;

  private permisosRol: Record<RolKey, { titulo: string; breve: string; permisos: string }> = {
    Administrador: {
      titulo: 'Ingreso para Administrador',
      breve: 'Administrador',
      permisos:
        '<span>Permisos:</span><ul><li>Gestión total de usuarios y permisos</li><li>Configuración global del sistema</li><li>Acceso completo a reportes y auditorías</li></ul>',
    },
    'Encargado de Inventario': {
      titulo: 'Ingreso para Encargado de Inventario',
      breve: 'Encargado de Inventario',
      permisos:
        '<span>Permisos:</span><ul><li>Registro de entradas/salidas</li><li>Órdenes de compra</li><li>Generar reportes de inventario</li></ul>',
    },
    'Técnico de Mantenimiento': {
      titulo: 'Ingreso para Técnico de Mantenimiento',
      breve: 'Técnico de Mantenimiento',
      permisos:
        '<span>Permisos:</span><ul><li>Gestión de órdenes de trabajo</li><li>Historial de equipos</li></ul>',
    },
    'Decanos, Directores y Profesores': {
      titulo: 'Ingreso para Decanos, Directores y Profesores',
      breve: 'Decanos, Directores y Profesores',
      permisos:
        '<span>Permisos:</span><ul><li>Reportes y estadísticas</li><li>Gestión estratégica de inventario</li></ul>',
    },
  };

  private roleToPage: Record<RolKey, string> = {
    Administrador: '/admin',
    'Encargado de Inventario': '/inventario',
    'Técnico de Mantenimiento': '/mantenimiento',
    'Decanos, Directores y Profesores': '/usuario',
  };

  // Mapa RolKey -> rol del AuthService
  private rolMapa: Record<RolKey, UsuarioSesion['rol']> = {
    Administrador: 'ADMIN',
    'Encargado de Inventario': 'INVENTARIO',
    'Técnico de Mantenimiento': 'MANTENIMIENTO',
    'Decanos, Directores y Profesores': 'USUARIO',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private usuariosService: UsuariosService,
  ) {}

  ngOnInit() {
    const rolFromQuery = (this.route.snapshot.queryParamMap.get('rol') as RolKey) || 'Administrador';
    this.setRol(rolFromQuery);
  }

  private setRol(rol: RolKey) {
    this.rol = rol;
    const info = this.permisosRol[rol];
    this.titulo = info.titulo;
    this.rolBreve = info.breve;
    this.permisosHtml = info.permisos;
  }

  onSubmit() {
    const user = this.usuariosService.buscarPorCredenciales(this.usuario.trim(), this.clave.trim());
    if (user && user.estado === 'Activo') {
      const rolSesion = this.rolMapa[user.rol as RolKey];
      if (rolSesion) {
        // Actualizar último acceso
        user.ultimoAcceso = new Date().toLocaleDateString('es-EC');
        this.usuariosService.actualizar(user.id!, user).subscribe();

        this.auth.loginFake({
          id: user.id!,
          nombre: user.nombre,
          usuario: user.usuario,
          rol: rolSesion,
        });

        const destino = this.roleToPage[user.rol as RolKey] || '/usuario';
        this.router.navigateByUrl(destino);
      } else {
        this.error = true;
      }
    } else {
      this.error = true;
    }
  }

  volver() {
    this.router.navigate(['/seleccion-usuario']);
  }
}
