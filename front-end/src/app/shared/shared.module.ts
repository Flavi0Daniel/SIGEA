// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent }            from './components/navbar/navbar.component';
import { SidebarComponent }           from './components/sidebar/sidebar.component';
import { LoadingSpinnerComponent }    from './components/loading-spinner/loading-spinner.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { PaymentModalComponent }      from './components/payment-modal/payment-modal.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    ConfirmationModalComponent,
    PaymentModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    ConfirmationModalComponent,
    PaymentModalComponent
  ]
})
export class SharedModule {}