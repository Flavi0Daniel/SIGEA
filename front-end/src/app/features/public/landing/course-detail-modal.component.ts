// src/app/features/public/landing/course-detail-modal.component.ts
import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { gsap } from 'gsap';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-detail-modal',
  templateUrl: './course-detail-modal.component.html',
  styleUrls: ['./modal.component.scss', './course-detail-modal.component.scss']
})
export class CourseDetailModalComponent implements AfterViewInit {

  @Input()  course!: Course;
  @Output() close  = new EventEmitter<void>();
  @Output() enroll = new EventEmitter<Course>();

  @ViewChild('modalBox') modalBox!: ElementRef;

  ngAfterViewInit(): void {
    gsap.fromTo(
      this.modalBox.nativeElement,
      { y: -40, opacity: 0, scale: 0.95 },
      { y: 0,   opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }

  getCourseImage(): string {
    return `http://localhost:3000/uploads/courses/${this.course.id}.jpg`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.jpg';
  }

  onEnroll(): void {
    this.enroll.emit(this.course);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}