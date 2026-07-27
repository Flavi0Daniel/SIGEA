// src/app/features/admin/dashboard/dashboard.component.ts
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, ElementRef, QueryList
} from '@angular/core';
import { gsap } from 'gsap';
import { Chart, registerables } from 'chart.js';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseService } from '../../../core/services/course.service';
import { ClassService } from '../../../core/services/class.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CertificateService } from '../../../core/services/certificate.service';
import { UserService } from '../../../core/services/user.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { ApiResponse } from '../../../core/models/auth.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('statsGrid')   statsGrid!:   ElementRef;
  @ViewChild('chartsRow')   chartsRow!:   ElementRef;
  @ViewChild('tableCard')   tableCard!:   ElementRef;
  @ViewChild('lineChart')   lineChartEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart')    barChartEl!:  ElementRef<HTMLCanvasElement>;
  @ViewChildren('statCard') statCards_el!: QueryList<ElementRef>;

  statCards = [
    { label: 'Total de Cursos',       value: 0, icon: 'bi-book-half',    color: '#D32F2F' },
    { label: 'Total de Inscrições',   value: 0, icon: 'bi-list-check',   color: '#1565C0' },
    { label: 'Total de Formadores',   value: 0, icon: 'bi-person-badge', color: '#2E7D32' },
    { label: 'Total de Turmas',       value: 0, icon: 'bi-people',       color: '#E65100' },
    { label: 'Total de Certificados', value: 0, icon: 'bi-patch-check',  color: '#6A1B9A' }
  ];

  recentEnrollments: Enrollment[] = [];

  private lineChart!: Chart;
  private barChart!:  Chart;
  private ctx!: gsap.Context;

  constructor(
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private classService: ClassService,
    private paymentService: PaymentService,
    private certService: CertificateService,
    private userService: UserService
  ) {}

  ngOnInit(): void { this.loadStats(); }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from(this.statCards_el.map(c => c.nativeElement), {
        y: 40, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)'
      })
      .from([this.chartsRow.nativeElement, this.tableCard.nativeElement], {
        y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
      }, '-=0.2');
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.lineChart?.destroy();
    this.barChart?.destroy();
  }

  loadStats(): void {
    this.courseService.getAll().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.statCards[0].value = res.data?.length || 0;
      }
    });

    this.enrollmentService.getAllEnrollments().subscribe({
      next: (res: ApiResponse<Enrollment[]>) => {
        const all = res.data || [];
        this.statCards[1].value = all.length;
        this.recentEnrollments  = all.slice(0, 8);
        this.buildLineChart(all);
      }
    });

    this.userService.getByRole('instructor').subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.statCards[2].value = res.data?.length || 0;
      }
    });

    this.classService.getAll().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.statCards[3].value = res.data?.length || 0;
      }
    });

    this.certService.getMyCertificates().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.statCards[4].value = res.data?.length || 0;
      }
    });

    this.paymentService.getAllPayments().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.buildBarChart(res.data || []);
      }
    });
  }

  buildLineChart(enrollments: Enrollment[]): void {
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const counts  = new Array(12).fill(0);

    enrollments.forEach(e => {
      const m = new Date(e.enrollment_date).getMonth();
      if (!isNaN(m)) counts[m]++;
    });

    setTimeout(() => {
      if (this.lineChart) this.lineChart.destroy();
      this.lineChart = new Chart(this.lineChartEl.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Inscrições',
            data: counts,
            borderColor: '#D32F2F',
            backgroundColor: 'rgba(211,47,47,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#D32F2F',
            pointRadius: 4,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F0F0F0' }, ticks: { precision: 0 } as any },
            x: { grid: { display: false } }
          }
        }
      });
    }, 300);
  }

  buildBarChart(payments: any[]): void {
    const pending   = payments.filter(p => p.status === 'PENDING').length;
    const completed = payments.filter(p => p.status === 'COMPLETED').length;
    const failed    = payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length;

    setTimeout(() => {
      if (this.barChart) this.barChart.destroy();
      this.barChart = new Chart(this.barChartEl.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Pendentes', 'Pagos', 'Falhados'],
          datasets: [{
            label: 'Pagamentos',
            data: [pending, completed, failed],
            backgroundColor: ['#FFF8E1', '#E8F5E9', '#FFEBEE'],
            borderColor:     ['#E65100', '#2E7D32', '#C62828'],
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F0F0F0' }, ticks: { precision: 0 } as any },
            x: { grid: { display: false } }
          }
        }
      });
    }, 300);
  }

  statusLabel(s: string): string {
    const m: Record<string,string> = {
      pending:'Pendente', active:'Activa', completed:'Concluída', cancelled:'Cancelada'
    };
    return m[s] || s;
  }
}