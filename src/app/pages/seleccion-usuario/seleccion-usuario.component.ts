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
      iconoSvg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            viewBox="0 0 24 24"><path d="M12 22c5-1 8-5 8-10V5l-8-3-8 3v7c0 5 3 9 8 10z"></path></svg>`,
    },
    {
      nombre: 'Encargado de Inventario',
      descripcion:
        'Control de existencias, entradas/salidas, órdenes de compra y reportes de inventario.',
      iconoSvg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"></path></svg>`,
    },
    {
      nombre: 'Técnico de Mantenimiento',
      descripcion:
        'Gestión de órdenes de trabajo, historial y seguimiento de equipos.',
      iconoSvg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    },
    {
      nombre: 'Decanos, Directores y Profesores',
      descripcion:
        'Acceso a reportes, estadísticas y gestión del inventario para decisiones estratégicas.',
      iconoSvg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"></path></svg>`,
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
    return this.resumenes[this.rolActivo];
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
