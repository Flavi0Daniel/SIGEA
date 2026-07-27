// src/app/features/admin/enrollments/enrollments.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment } from '../../../core/models/enrollment.model';

@Component({
  selector: 'app-admin-enrollments',
  templateUrl: './enrollments.component.html',
  styleUrls: ['./enrollments.component.scss']
})
export class EnrollmentsComponent implements OnInit, AfterViewInit {

  enrollments: Enrollment[] = [];
  filtered:    Enrollment[] = [];
  search  = '';
  loading = false;

  constructor(private enrollmentService: EnrollmentService) {}

  ngOnInit():        void { this.load(); }
  ngAfterViewInit(): void { gsap.from('.admin-page', { y: 20, opacity: 0, duration: 0.4 }); }

  load(): void {
    this.loading = true;
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (res: any) => { this.enrollments = res.data || []; this.applyFilter(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  applyFilter(): void {
    const s = this.search.toLowerCase();
    this.filtered = s
      ? this.enrollments.filter(e =>
          (e.student_name || '').toLowerCase().includes(s) ||
          (e.course_name  || '').toLowerCase().includes(s))
      : [...this.enrollments];
  }

  activate(id: number): void {
    this.enrollmentService.activate(id).subscribe({ next: () => this.load() });
  }

  cancel(id: number): void {
    if (!confirm('Cancelar esta inscrição?')) return;
    this.enrollmentService.cancel(id).subscribe({ next: () => this.load() });
  }

  complete(id: number): void {
    this.enrollmentService.complete(id).subscribe({ next: () => this.load() });
  }

  statusLabel(s: string): string {
    const m: Record<string,string> = {
      pending:'Pendente', active:'Activa', completed:'Concluída', cancelled:'Cancelada'
    };
    return m[s] || s;
  }
}