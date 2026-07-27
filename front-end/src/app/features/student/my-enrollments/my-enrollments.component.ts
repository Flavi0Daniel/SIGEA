import { Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';

import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseService } from '../../../core/services/course.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Course } from '../../../core/models/course.model';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-my-enrollments',
  templateUrl: './my-enrollments.component.html',
  styleUrls: ['./my-enrollments.component.scss']
})
export class MyEnrollmentsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('pageHeader')    pageHeader!:    ElementRef;
  @ViewChild('pageBody')      pageBody!:      ElementRef;
  @ViewChild('selectorModal') selectorModal?: ElementRef;
  @ViewChildren('enrollCard') enrollCards!:   QueryList<ElementRef>;
 
  enrollments:      Enrollment[] = [];
  filtered:         Enrollment[] = [];
  availableCourses: Course[]     = [];
  paymentModal:     Payment | null = null;
 
  loading        = false;
  loadingCourses = false;
  showCourseSelector = false;
  activeTab = 'all';
 
  tabs = [
    { label: 'Todas',      value: 'all'       },
    { label: 'Activas',    value: 'active'    },
    { label: 'Pendentes',  value: 'pending'   },
    { label: 'Concluídas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' }
  ];
 
  private ctx!: gsap.Context;
 
  constructor(
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private paymentService: PaymentService,
    private router: Router
  ) {}
 
  ngOnInit(): void { this.loadEnrollments(); }
 
  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from(this.pageHeader.nativeElement, {
        y: -20, opacity: 0, duration: 0.5, ease: 'power2.out'
      });
      gsap.from(this.pageBody.nativeElement, {
        y: 30, opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.out'
      });
    });
  }
 
  ngOnDestroy(): void { this.ctx?.revert(); }
 
  loadEnrollments(): void {
    this.loading = true;
    this.enrollmentService.getMyEnrollments().subscribe({
      next: res => {
        this.enrollments = res.data || [];
        this.applyFilter();
        this.loading = false;
        setTimeout(() => this.animateCards(), 100);
      },
      error: () => this.loading = false
    });
  }
 
  setTab(value: string): void {
    this.activeTab = value;
    this.applyFilter();
    setTimeout(() => this.animateCards(), 50);
  }
 
  applyFilter(): void {
    this.filtered = this.activeTab === 'all'
      ? this.enrollments
      : this.enrollments.filter(e => e.status === this.activeTab);
  }
 
  animateCards(): void {
    const cards = this.enrollCards.map(c => c.nativeElement);
    if (cards.length) {
      gsap.from(cards, {
        y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out'
      });
    }
  }
 
  openCourseSelector(): void {
    this.showCourseSelector = true;
    this.loadingCourses = true;
    this.courseService.getActive().subscribe({
      next: res => {
        this.availableCourses = res.data || [];
        this.loadingCourses = false;
        setTimeout(() => {
          if (this.selectorModal) {
            gsap.fromTo(this.selectorModal.nativeElement,
              { y: -30, opacity: 0, scale: 0.96 },
              { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
            );
          }
        }, 10);
      },
      error: () => this.loadingCourses = false
    });
  }
 
  closeCourseSelector(): void { this.showCourseSelector = false; }
 
  selectCourse(course: Course): void {
    this.showCourseSelector = false;
    // Redireciona para a landing com o modal de inscrição aberto
    // Por agora inscreve directamente na primeira turma do curso
    const classId = (course as any).class_id || course.id;
    this.enrollmentService.enroll(classId).subscribe({
      next: res => {
        alert('Inscrição criada com sucesso! Consulte a referência de pagamento.');
        this.loadEnrollments();
      },
      error: err => alert(err.error?.message || 'Erro ao criar inscrição.')
    });
  }
 
  viewPayment(enrollment: Enrollment): void {
    this.paymentService.getByEnrollment(enrollment.id).subscribe({
      next: res => {
        const payments = res.data || [];
        if (payments.length > 0) {
          this.paymentModal = { ...payments[0], course_name: enrollment.course_name } as any;
        }
      }
    });
  }
 
  viewGrades(enrollment: Enrollment): void {
    this.router.navigate(['/student/my-grades']);
  }
 
  cancel(id: number): void {
    if (!confirm('Tem a certeza que quer cancelar esta inscrição?')) return;
    this.enrollmentService.cancel(id).subscribe({
      next: () => this.loadEnrollments()
    });
  }
 
  statusLabel(s: string): string {
    const m: Record<string,string> = {
      pending: 'Pendente', active: 'Activa',
      completed: 'Concluída', cancelled: 'Cancelada'
    };
    return m[s] || s;
  }
 
  paymentLabel(s: string): string {
    const m: Record<string,string> = {
      pending: 'Pendente', paid: 'Pago', overdue: 'Em atraso'
    };
    return m[s] || s;
  }

}
