import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstructorRoutingModule } from './instructor-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyClassesComponent } from './my-classes/my-classes.component';
import { GradesComponent } from './grades/grades.component';


@NgModule({
  declarations: [
    DashboardComponent,
    MyClassesComponent,
    GradesComponent
  ],
  imports: [
    CommonModule,
    InstructorRoutingModule
  ]
})
export class InstructorModule { }
