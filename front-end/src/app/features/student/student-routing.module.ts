// src/app/features/student/student-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }        from './dashboard/dashboard.component';
import { StudentProfileComponent }   from './profile/profile.component';
import { MyGradesComponent }         from './my-grades/my-grades.component';
import { MyEnrollmentsComponent }    from './my-enrollments/my-enrollments.component';
import { MyPaymentsComponent }       from './my-payments/my-payments.component';
import { MyCertificatesComponent }   from './my-certificates/my-certificates.component';

const routes: Routes = [
  { path: '',                 redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',       component: DashboardComponent },
  { path: 'profile',         component: StudentProfileComponent },
  { path: 'my-grades',       component: MyGradesComponent },
  { path: 'my-enrollments',  component: MyEnrollmentsComponent },
  { path: 'my-payments',     component: MyPaymentsComponent },
  { path: 'my-certificates', component: MyCertificatesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {}