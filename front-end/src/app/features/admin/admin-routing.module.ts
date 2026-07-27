// src/app/features/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { DashboardComponent }    from './dashboard/dashboard.component';
import { UsersComponent }        from './users/users.component';
import { CoursesComponent }      from './courses/courses.component';
import { ClassesComponent }      from './classes/classes.component';
import { EnrollmentsComponent }  from './enrollments/enrollments.component';
import { PaymentsComponent }     from './payments/payments.component';
import { CertificatesComponent } from './certificates/certificates.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,   // ← shell com sidebar + topbar
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   component: DashboardComponent   },
      { path: 'courses',     component: CoursesComponent     },
      { path: 'classes',     component: ClassesComponent     },
      { path: 'users',       component: UsersComponent       },
      { path: 'enrollments', component: EnrollmentsComponent },
      { path: 'payments',    component: PaymentsComponent    },
      { path: 'certificates',component: CertificatesComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}