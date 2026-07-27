import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { gsap } from 'gsap';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-my-payments',
  templateUrl: './my-payments.component.html',
  styleUrls: ['./my-payments.component.scss']
})
export class MyPaymentsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('pageHeader') pageHeader!: ElementRef;
  @ViewChild('pageBody')   pageBody!:   ElementRef;
 
  payments: Payment[] = [];
  loading = false;
 
  get pendingCount(): number { return this.payments.filter(p => p.status === 'PENDING').length; }
  get paidCount():    number { return this.payments.filter(p => p.status === 'COMPLETED').length; }
  get failedCount():  number { return this.payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length; }
 
  private ctx!: gsap.Context;
 
  constructor(private paymentService: PaymentService) {}
 
  ngOnInit(): void {
    this.loading = true;
    this.paymentService.getMyPayments().subscribe({
      next: res => { this.payments = res.data || []; this.loading = false; },
      error: ()  => this.loading = false
    });
  }
 
  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from(this.pageHeader.nativeElement, { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
      gsap.from(this.pageBody.nativeElement,   { y: 30,  opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
    });
  }
 
  ngOnDestroy(): void { this.ctx?.revert(); }
 
  statusLabel(s: string): string {
    const m: Record<string,string> = {
      PENDING: 'Pendente', COMPLETED: 'Pago', FAILED: 'Falhado', CANCELLED: 'Cancelado'
    };
    return m[s] || s;
  }
 
  statusClass(s: string): string {
    const m: Record<string,string> = {
      PENDING: 'badge-pending', COMPLETED: 'badge-active',
      FAILED: 'badge-cancelled', CANCELLED: 'badge-cancelled'
    };
    return m[s] || '';
  }
 
  methodLabel(m: string | undefined): string {
    const map: Record<string,string> = {
      referencia: 'Referência', multicaixa_express: 'GPO', cash: 'Numerário', transfer: 'Transferência'
    };
    return m ? (map[m] || m) : '—';
  }

}
