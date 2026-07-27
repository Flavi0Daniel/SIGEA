// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard }  from './core/guards/role.guard';

const routes: Routes = [
  // ─── Página inicial pública ───────────────────────────────
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then(m => m.PublicModule)
  },

  // ─── Auth (login/register como modal na landing, mas também rota directa) ──
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ─── Admin ──────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // ─── Instructor ─────────────────────────────────────────────
  {
    path: 'instructor',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadChildren: () =>
      import('./features/instructor/instructor.module').then(m => m.InstructorModule)
  },

  // ─── Student ────────────────────────────────────────────────
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student', 'admin'] },
    loadChildren: () =>
      import('./features/student/student.module').then(m => m.StudentModule)
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}