// src/app/features/admin/courses/courses.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit, AfterViewInit {

  @ViewChild('modalRef') modalRef?: ElementRef;

  courses:  Course[] = [];
  filtered: Course[] = [];
  search   = '';
  loading  = false;
  showModal = false;
  saving    = false;
  errorMsg  = '';
  editingCourse: Course | null = null;

  form = { name: '', category: '', price: 0, duration_hours: 0, description: '' };

  constructor(private courseService: CourseService) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    gsap.from('.admin-page', { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }

  load(): void {
    this.loading = true;
    this.courseService.getAll().subscribe({
      next: res => { this.courses = res.data || []; this.applyFilter(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  applyFilter(): void {
    const s = this.search.toLowerCase();
    this.filtered = s
      ? this.courses.filter(c => c.name.toLowerCase().includes(s))
      : [...this.courses];
  }

  openAdd(): void {
    this.editingCourse = null;
    this.form = { name: '', category: '', price: 0, duration_hours: 0, description: '' };
    this.errorMsg = '';
    this.showModal = true;
    this.animateModal();
  }

  openEdit(course: Course): void {
    this.editingCourse = course;
    this.form = {
      name: course.name,
      category: course.category || '',
      price: course.price,
      duration_hours: course.duration_hours,
      description: course.description || ''
    };
    this.errorMsg = '';
    this.showModal = true;
    this.animateModal();
  }

  animateModal(): void {
    setTimeout(() => {
      if (this.modalRef) {
        gsap.fromTo(this.modalRef.nativeElement,
          { y: -30, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
        );
      }
    }, 10);
  }

  closeModal(): void { this.showModal = false; this.errorMsg = ''; }

  save(): void {
    if (!this.form.name.trim()) { this.errorMsg = 'O nome do curso é obrigatório.'; return; }
    if (!this.form.price || this.form.price <= 0) { this.errorMsg = 'O valor deve ser maior que zero.'; return; }
    if (!this.form.duration_hours || this.form.duration_hours <= 0) { this.errorMsg = 'A duração deve ser maior que zero.'; return; }

    this.saving = true;
    this.errorMsg = '';

    const obs = this.editingCourse
      ? this.courseService.update(this.editingCourse.id, this.form)
      : this.courseService.create(this.form);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.errorMsg = err.error?.message || 'Erro ao guardar.'; }
    });
  }

  toggleActive(course: Course): void {
    const action = course.is_active
      ? this.courseService.update(course.id, { is_active: false })
      : this.courseService.update(course.id, { is_active: true });
    action.subscribe({ next: () => this.load() });
  }
}