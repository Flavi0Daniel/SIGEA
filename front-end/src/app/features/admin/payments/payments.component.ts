// src/app/features/admin/payments/payments.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit, AfterViewInit {

  payments: Payment[] = [];
  filtered: Payment[] = [];
  search  = '';
  loading = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit():        void { this.load(); }
  ngAfterViewInit(): void { gsap.from('.admin-page', { y: 20, opacity: 0, duration: 0.4 }); }

  load(): void {
    this.loading = true;
    this.paymentService.getAllPayments().subscribe({
      next: res => { this.payments = res.data || []; this.applyFilter(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  applyFilter(): void {
    const s = this.search.toLowerCase();
    this.filtered = s
      ? this.payments.filter(p =>
          (p.student_name || '').toLowerCase().includes(s) ||
          (p.reference    || '').toLowerCase().includes(s))
      : [...this.payments];
  }

  confirmManual(id: number): void {
    if (!confirm('Confirmar pagamento manualmente?')) return;
    this.paymentService.confirmManual(id).subscribe({ next: () => this.load() });
  }

  statusLabel(s: string): string {
    const m: Record<string,string> = {
      PENDING:'Pendente', COMPLETED:'Pago', FAILED:'Falhado', CANCELLED:'Cancelado'
    };
    return m[s] || s;
  }

  statusClass(s: string): string {
    const m: Record<string,string> = {
      PENDING:'badge-pending', COMPLETED:'badge-active',
      FAILED:'badge-cancelled', CANCELLED:'badge-cancelled'
    };
    return m[s] || '';
  }

  methodLabel(m: string | undefined): string {
    const map: Record<string,string> = {
      referencia:'Referência', multicaixa_express:'GPO',
      cash:'Numerário', transfer:'Transferência'
    };
    return m ? (map[m] || m) : '—';
  }
}