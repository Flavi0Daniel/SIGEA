// src/app/features/public/public.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LandingComponent }           from './landing/landing.component';
import { LoginModalComponent }        from './landing/login-modal.component';
import { RegisterModalComponent }     from './landing/register-modal.component';
import { CourseDetailModalComponent } from './landing/course-detail-modal.component';
import { EnrollModalComponent }       from './landing/enroll-modal.component';

const routes: Routes = [
  { path: '', component: LandingComponent }
];

@NgModule({
  declarations: [
    LandingComponent,
    LoginModalComponent,
    RegisterModalComponent,
    CourseDetailModalComponent,
    EnrollModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicModule {}