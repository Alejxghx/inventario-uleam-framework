import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

export interface Usuario {
  id?: number;
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  rol: string;
  estado: string;
  ultimoAcceso?: string;
  fechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private storage: StorageService) {
    this.inicializarDatos();
  }

  private inicializarDatos() {
    const usuarios = this.obtenerTodos();
    if (usuarios.length === 0) {
      console.log('📝 Inicializando usuarios por defecto en localStorage...');
      const inicial: Usuario[] = [
        {
          id: 1,
          nombre: 'Administrador ULEAM',
          usuario: 'admin',
          email: 'admin@uleam.edu.ec',
          password: '1234',
          rol: 'Administrador',
          estado: 'Activo',
          ultimoAcceso: new Date().toLocaleDateString('es-EC'),
          fechaCreacion: '01/01/2024'
        },
        {
          id: 2,
          nombre: 'Juan Pérez',
          usuario: 'inventario',
          email: 'inventario@uleam.edu.ec',
          password: '1234',
          rol: 'Encargado de Inventario',
          estado: 'Activo',
          ultimoAcceso: new Date().toLocaleDateString('es-EC'),
          fechaCreacion: '01/01/2024'
        },
        {
          id: 3,
          nombre: 'María González',
          usuario: 'mantenimiento',
          email: 'mantenimiento@uleam.edu.ec',
          password: '1234',
          rol: 'Técnico de Mantenimiento',
          estado: 'Activo',
          ultimoAcceso: new Date().toLocaleDateString('es-EC'),
          fechaCreacion: '01/01/2024'
        },
        {
          id: 4,
          nombre: 'Carlos Ramírez',
          usuario: 'usuario',
          email: 'usuario@uleam.edu.ec',
          password: '1234',
          rol: 'Decanos, Directores y Profesores',
          estado: 'Activo',
          ultimoAcceso: new Date().toLocaleDateString('es-EC'),
          fechaCreacion: '01/01/2024'
        }
      ];
      this.guardarTodos(inicial);
      console.log('✅ Usuarios inicializados en localStorage');
    } else {
      console.log(`✅ Se cargaron ${usuarios.length} usuarios de localStorage`);
    }
  }

  obtenerTodos(): Usuario[] {
    return this.storage.get<Usuario[]>(this.storage.keys.USUARIOS) || [];
  }

  obtenerPorId(id: number): Usuario | null {
    const usuarios = this.obtenerTodos();
    return usuarios.find(u => u.id === id) || null;
  }

  agregar(usuario: Usuario): Observable<Usuario> {
    const usuarios = this.obtenerTodos();
    const nuevoId = usuarios.length > 0 
      ? Math.max(...usuarios.map(u => u.id || 0)) + 1 
      : 1;
    
    const nuevoUsuario: Usuario = {
      ...usuario,
      id: nuevoId,
      ultimoAcceso: new Date().toLocaleDateString('es-EC'),
      fechaCreacion: new Date().toLocaleDateString('es-EC')
    };
    
    usuarios.push(nuevoUsuario);
    this.guardarTodos(usuarios);
    
    console.log('✅ Usuario agregado:', nuevoUsuario);
    return of(nuevoUsuario);
  }

  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    const usuarios = this.obtenerTodos();
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
      usuarios[index] = { ...usuario, id };
      this.guardarTodos(usuarios);
      console.log('✅ Usuario actualizado:', usuarios[index]);
      return of(usuarios[index]);
    }
    
    return of(usuario);
  }

  eliminar(id: number): Observable<void> {
    const usuarios = this.obtenerTodos();
    const filtrados = usuarios.filter(u => u.id !== id);
    this.guardarTodos(filtrados);
    console.log(`🗑️ Usuario con ID ${id} eliminado`);
    return of(void 0);
  }

  private guardarTodos(usuarios: Usuario[]) {
    this.storage.set(this.storage.keys.USUARIOS, usuarios);
  }

  // Buscar usuario por credenciales (para login)
  buscarPorCredenciales(usuario: string, password: string): Usuario | null {
    const usuarios = this.obtenerTodos();
    return usuarios.find(u => 
      u.usuario === usuario && 
      u.password === password && 
      u.estado === 'Activo'
    ) || null;
  }
}