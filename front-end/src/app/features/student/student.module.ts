// src/app/features/student/student.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentRoutingModule } from './student-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent }        from './dashboard/dashboard.component';
import { StudentProfileComponent }   from './profile/profile.component';
import { MyGradesComponent }         from './my-grades/my-grades.component';
import { MyEnrollmentsComponent }    from './my-enrollments/my-enrollments.component';
import { MyPaymentsComponent }       from './my-payments/my-payments.component';
import { MyCertificatesComponent }   from './my-certificates/my-certificates.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StudentProfileComponent,
    MyGradesComponent,
    MyEnrollmentsComponent,
    MyPaymentsComponent,
    MyCertificatesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StudentRoutingModule,
    SharedModule
  ]
})
export class StudentModule {}