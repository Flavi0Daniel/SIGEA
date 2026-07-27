// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Layout shell
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';

// Páginas admin
import { DashboardComponent }    from './dashboard/dashboard.component';
import { CoursesComponent }      from './courses/courses.component';
import { ClassesComponent }      from './classes/classes.component';
import { UsersComponent }        from './users/users.component';
import { EnrollmentsComponent }  from './enrollments/enrollments.component';
import { PaymentsComponent }     from './payments/payments.component';
import { CertificatesComponent } from './certificates/certificates.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,   // ← declarado aqui, não no AppModule
    DashboardComponent,
    CoursesComponent,
    ClassesComponent,
    UsersComponent,
    EnrollmentsComponent,
    PaymentsComponent,
    CertificatesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule {}