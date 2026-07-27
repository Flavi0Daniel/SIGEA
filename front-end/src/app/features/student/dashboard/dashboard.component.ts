// src/app/features/student/dashboard/dashboard.component.ts
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, ElementRef, QueryList
} from '@angular/core';
import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CertificateService } from '../../../core/services/certificate.service';
import { User } from '../../../core/models/user.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { ApiResponse } from '../../../core/models/auth.model';
import { Payment } from '../../../core/models/payment.model';
import { Certificate } from '../../../core/models/certificate.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('welcomeBar') welcomeBar!: ElementRef;
  @ViewChild('statsGrid')  statsGrid!:  ElementRef;
  @ViewChild('mainGrid')   mainGrid!:   ElementRef;
  @ViewChildren('statCard') statCards!: QueryList<ElementRef>;

  user: User | null = null;
  enrollments: Enrollment[] = [];
  stats = {
    activeEnrollments: 0,
    pendingPayments:   0,
    completedCourses:  0,
    certificates:      0
  };

  private sub!: Subscription;
  private ctx!: gsap.Context;

  constructor(
    private auth: AuthService,
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe((u: User | null) => this.user = u);
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from(this.welcomeBar.nativeElement, {
        y: -30, opacity: 0, duration: 0.5, ease: 'power2.out'
      })
      .from(this.statCards.map(c => c.nativeElement), {
        y: 40, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)'
      }, '-=0.2')
      .from(this.mainGrid.nativeElement.children, {
        y: 30, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out'
      }, '-=0.3');
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.ctx?.revert();
  }

  loadData(): void {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res: ApiResponse<Enrollment[]>) => {
        this.enrollments = res.data || [];
        this.stats.activeEnrollments = this.enrollments.filter(
          e => e.status === 'active' || e.status === 'pending'
        ).length;
        this.stats.completedCourses = this.enrollments.filter(
          e => e.status === 'completed'
        ).length;
      }
    });

    this.paymentService.getMyPayments().subscribe({
      next: (res: ApiResponse<Payment[]>) => {
        this.stats.pendingPayments = (res.data || []).filter(
          p => p.status === 'PENDING'
        ).length;
      }
    });

    this.certificateService.getMyCertificates().subscribe({
      next: (res: ApiResponse<Certificate[]>) => {
        this.stats.certificates = (res.data || []).length;
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending:   'Pendente',
      active:    'Activa',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return map[status] || status;
  }
}