// ─── instructor-routing.module.ts ────────────────────────────
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { DashboardComponent as InstructorDashboard }   from './dashboard/dashboard.component';
import { MyClassesComponent }                           from './my-classes/my-classes.component';
import { GradesComponent }                              from './grades/grades.component';

const instructorRoutes: Routes = [
  { path: '',            redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: InstructorDashboard },
  { path: 'my-classes', component: MyClassesComponent },
  { path: 'grades',     component: GradesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(instructorRoutes)],
  exports: [RouterModule]
})
export class InstructorRoutingModule {}