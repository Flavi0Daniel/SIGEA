// src/app/features/public/landing/enroll-modal.component.ts
import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { gsap } from 'gsap';
import { Course } from '../../../core/models/course.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-enroll-modal',
  templateUrl: './enroll-modal.component.html',
  styleUrls: ['./modal.component.scss', './enroll-modal.component.scss']
})
export class EnrollModalComponent implements AfterViewInit {

  @Input()  course!: Course;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalBox') modalBox!: ElementRef;

  step = 1;

  enrollment = {
    name:      '',
    gender:    '',
    birthDate: '',
    bi:        ''
  };

  paymentMethod = 'referencia';
  phoneNumber   = '';
  loading       = false;
  errorMsg      = '';
  paymentResult: Payment | null = null;
  processNumber = 'SIGEA-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  constructor(private enrollmentService: EnrollmentService) {}

  ngAfterViewInit(): void {
    gsap.fromTo(
      this.modalBox.nativeElement,
      { y: -40, opacity: 0, scale: 0.95 },
      { y: 0,   opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }

  goToPayment(): void {
    if (!this.enrollment.name.trim()) {
      alert('Por favor preencha o nome completo.');
      return;
    }
    this.step = 2;
  }

  submitPayment(): void {
    this.errorMsg = '';
    this.loading  = true;

    const classId = (this.course as any).class_id || this.course.id;

    this.enrollmentService.enroll(classId).subscribe({
      next: res => {
        this.loading       = false;
        this.paymentResult = res.data?.payment || null;
        this.step          = 3;
      },
      error: err => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Erro ao processar. Tente novamente.';
      }
    });
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}