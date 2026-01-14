import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { inventarioGuard } from './guards/inventario-guard';
import { mantenimientoGuard } from './guards/mantenimiento-guard';
import { LoginComponent } from './pages/login/login.component';
import { SeleccionUsuarioComponent } from './pages/seleccion-usuario/seleccion-usuario.component';
import { VistaAdministradorComponent } from './pages/vista-administrador/vista-administrador.component';
import { VistaInventarioComponent } from './pages/vista-inventario/vista-inventario.component';
import { VistaMantenimientoComponent } from './pages/vista-mantenimiento/vista-mantenimiento.component';
import { VistaUsuarioComponent } from './pages/vista-usuario/vista-usuario.component';


export const routes: Routes = [
  { path: '', redirectTo: 'seleccion-usuario', pathMatch: 'full' },
  { path: 'seleccion-usuario', component: SeleccionUsuarioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: VistaAdministradorComponent, canActivate: [AuthGuard, adminGuard] },
  { path: 'inventario', component: VistaInventarioComponent, canActivate: [AuthGuard, inventarioGuard] },
  { path: 'mantenimiento', component: VistaMantenimientoComponent, canActivate: [AuthGuard, mantenimientoGuard] },
  { path: 'usuario', component: VistaUsuarioComponent, canActivate: [AuthGuard] },
];
