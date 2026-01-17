# UleamInventory

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


# 📦 Sistema de Almacenamiento Local - ULEAM

## 🎯 Información General

**TODA la información del sistema se guarda en localStorage del navegador.**

### Claves de localStorage utilizadas:

| Clave | Contenido | Descripción |
|-------|-----------|-------------|
| `uleam_usuarios` | Array de usuarios | Todos los usuarios del sistema |
| `uleam_inventario` | Array de equipos | Inventario completo |
| `uleam_ordenes` | Array de órdenes | Órdenes de mantenimiento |
| `uleam_auditoria` | Array de registros | Historial de auditoría |
| `uleam_config` | Objeto de configuración | Configuración del sistema |
| `uleam_usuario_sesion` | Objeto de sesión | Sesión actual del usuario |
| `uleam_contador_ordenes` | Número | Contador para IDs de órdenes |
| `uleam_data_version` | String | Versión de los datos |

## 📁 Estructura de Archivos

### Servicios Principales:

```
src/app/services/
├── storage.service.ts          # Servicio centralizado de localStorage
├── auth.service.ts             # Autenticación y sesiones
├── usuarios.service.ts         # Gestión de usuarios
├── inventario.service.ts       # Gestión de inventario (actualizado)
├── ordenes.service.ts          # Gestión de órdenes (actualizado)
├── auditoria.service.ts        # Registro de auditoría (actualizado)
└── config.service.ts           # Configuración del sistema (NUEVO)
```

### Componentes:

```
src/app/pages/
├── storage-manager/            # Gestor de localStorage (NUEVO)
│   └── storage-manager.component.ts
├── vista-administrador/
├── vista-inventario/
├── vista-mantenimiento/
└── vista-usuario/
```

## 🚀 Características Implementadas

### ✅ Persistencia Total

- **Usuarios**: Todos los usuarios se guardan automáticamente
- **Inventario**: Cada equipo se persiste en localStorage
- **Órdenes**: Todas las órdenes con su historial
- **Auditoría**: Registro completo de acciones (max 500)
- **Configuración**: Preferencias del sistema
- **Sesión**: Se mantiene entre recargas de página

### ✅ Datos de Ejemplo Precargados

Al iniciar por primera vez, el sistema carga:
- 4 usuarios (admin, inventario, mantenimiento, usuario)
- 5 equipos de ejemplo
- 3 órdenes de mantenimiento
- 5 registros de auditoría
- Configuración por defecto

### ✅ Operaciones Soportadas

**CRUD Completo en todos los módulos:**
- ✅ Crear (Create)
- ✅ Leer (Read)
- ✅ Actualizar (Update)
- ✅ Eliminar (Delete)

## 🔧 Uso del StorageService

### Importar el servicio:

```typescript
import { StorageService } from './services/storage.service';

constructor(private storage: StorageService) {}
```

### Guardar datos:

```typescript
const datos = { nombre: 'Ejemplo', valor: 123 };
this.storage.set('mi_clave', datos);
```

### Leer datos:

```typescript
const datos = this.storage.get<MiTipo>('mi_clave');
```

### Eliminar datos:

```typescript
this.storage.remove('mi_clave');
```

## 💾 Backup y Restauración

### Acceder al gestor:

1. Inicia sesión como **Administrador**
2. Ve a: `/storage-manager`
3. Opciones disponibles:
   - 📥 Exportar todo (descarga JSON)
   - 📤 Importar todo (carga JSON)
   - 🗑️ Limpiar todo (reiniciar sistema)

### Exportar manualmente desde consola:

```javascript
// Abrir DevTools (F12) y ejecutar:
const backup = localStorage.getItem('uleam_inventario');
console.log(backup);
```

### Importar manualmente desde consola:

```javascript
// Restaurar datos desde JSON:
const datos = { /* tu JSON aquí */ };
localStorage.setItem('uleam_inventario', JSON.stringify(datos));
```

## 🔍 Verificar Datos en el Navegador

### Chrome/Edge:
1. F12 → Application → Local Storage
2. Selecciona tu dominio
3. Verás todas las claves `uleam_*`

### Firefox:
1. F12 → Storage → Local Storage
2. Selecciona tu dominio

## ⚠️ Limitaciones de localStorage

- **Tamaño máximo**: ~5-10 MB por dominio
- **Sincronización**: Solo en el mismo navegador
- **Privacidad**: Datos visibles en DevTools
- **Persistencia**: Se mantiene hasta limpiar datos del navegador

## 🔐 Seguridad

**IMPORTANTE**: localStorage NO es seguro para datos sensibles en producción.

Para producción se recomienda:
- Backend con base de datos (PostgreSQL/MySQL)
- Autenticación JWT
- Encriptación de datos sensibles
- HTTPS obligatorio

## 🐛 Troubleshooting

### Los datos no se guardan:
```typescript
// Verificar si localStorage está disponible
if (this.storage.isDisponible()) {
  console.log('✅ localStorage disponible');
} else {
  console.error('❌ localStorage no disponible');
}
```

### Ver tamaño usado:
```typescript
console.log('Tamaño:', this.storage.getTamanoUsado());
```

### Limpiar datos corruptos:
```javascript
// Desde la consola del navegador:
localStorage.clear();
location.reload();
```

## 📊 Monitoreo

Todos los servicios loguean sus operaciones en consola:
- ✅ Operaciones exitosas
- ❌ Errores
- 📝 Registros de auditoría
- 🗑️ Eliminaciones

Abre DevTools (F12) → Console para ver los logs.

## 🎓 Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | 1234 | Administrador |
| inventario | 1234 | Encargado de Inventario |
| mantenimiento | 1234 | Técnico de Mantenimiento |
| usuario | 1234 | Decanos/Directores |

## 📞 Soporte

Para problemas con localStorage:
1. Verifica la consola del navegador (F12)
2. Revisa el tamaño usado
3. Exporta un backup antes de limpiar
4. Recarga la página (Ctrl + Shift + R)