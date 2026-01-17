import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

interface RolResumen {
  titulo: string;
  items: string[];
}

@Component({
  selector: 'app-seleccion-usuario',
  standalone: true,
  imports: [NgFor],
  templateUrl: './seleccion-usuario.component.html',
  styleUrls: ['./seleccion-usuario.component.scss'],
})
export class SeleccionUsuarioComponent {
  roles = [
    {
      nombre: 'Administrador',
      descripcion:
        'Acceso total al sistema, gestión de usuarios, permisos y configuración general.',
    },
    {
      nombre: 'Encargado de Inventario',
      descripcion:
        'Control de existencias, entradas/salidas, órdenes de compra y reportes de inventario.',
    },
    {
      nombre: 'Técnico de Mantenimiento',
      descripcion:
        'Gestión de órdenes de trabajo, historial y seguimiento de equipos.',
    },
    {
      nombre: 'Decanos, Directores y Profesores',
      descripcion:
        'Acceso a reportes, estadísticas y gestión del inventario para decisiones estratégicas.',
    },
  ];

  rolActivo = 'Administrador';

  resumenes: Record<string, RolResumen> = {
    Administrador: {
      titulo: 'Administrador',
      items: [
        'Gestión de usuarios y permisos',
        'Configuración global del sistema',
        'Acceso a reportes y auditorías',
      ],
    },
    'Encargado de Inventario': {
      titulo: 'Encargado de Inventario',
      items: [
        'Control de existencias',
        'Entradas y salidas',
        'Órdenes de compra y reportes',
      ],
    },
    'Técnico de Mantenimiento': {
      titulo: 'Técnico de Mantenimiento',
      items: [
        'Gestión de órdenes de trabajo',
        'Historial y seguimiento de equipos',
      ],
    },
    'Decanos, Directores y Profesores': {
      titulo: 'Decanos, Directores y Profesores',
      items: [
        'Acceso a reportes, estadísticas',
        'Gestión para decisiones estratégicas',
      ],
    },
  };

  get resumen(): RolResumen {
    return this.resumenes[this.rolActivo] || { titulo: 'Rol no encontrado', items: [] };
  }

  constructor(private router: Router) {}

  seleccionarRol(rol: { nombre: string }) {
    this.rolActivo = rol.nombre;
  }

  confirmar() {
    this.router.navigate(['/login'], { queryParams: { rol: this.rolActivo } });
  }

  volver() {
    // aquí puedes ir a la pantalla anterior o al home
    this.router.navigate(['/']);
  }
}
