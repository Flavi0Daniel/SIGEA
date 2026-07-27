import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef  } from '@angular/core';

import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { GradeService } from '../../../core/services/grade.service';
import { User } from '../../../core/models/user.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Grade } from '../../../core/models/grade.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-grades',
  templateUrl: './my-grades.component.html',
  styleUrls: ['./my-grades.component.scss']
})
export class MyGradesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('gradesHeader')    gradesHeader!:    ElementRef;
  @ViewChild('gradesContainer') gradesContainer!: ElementRef;
 
  user: User | null = null;
  enrollments: Enrollment[] = [];
  grades: Grade[] = [];
  average: number | null = null;          // ← number em vez de string
  selectedEnrollmentId = '';
  selectedEnrollment: Enrollment | null = null;
 
  String = String;
 
  private sub!: Subscription;
  private ctx!: gsap.Context;
 
  constructor(
    private auth: AuthService,
    private enrollmentService: EnrollmentService,
    private gradeService: GradeService
  ) {}
 
  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe(u => this.user = u);
    this.enrollmentService.getMyEnrollments().subscribe({
      next: res => {
        this.enrollments = (res.data || []).filter(
          (e: Enrollment) => e.status === 'active' || e.status === 'completed'
        );
      }
    });
  }
 
  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from(this.gradesHeader.nativeElement, {
        y: -20, opacity: 0, duration: 0.5, ease: 'power2.out'
      });
      gsap.from(this.gradesContainer.nativeElement, {
        y: 30, opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.out'
      });
    });
  }
 
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.ctx?.revert();
  }
 
  loadGrades(): void {
    if (!this.selectedEnrollmentId) {
      this.selectedEnrollment = null;
      this.grades = [];
      this.average = null;
      return;
    }
 
    const id = parseInt(this.selectedEnrollmentId);
    this.selectedEnrollment = this.enrollments.find(e => e.id === id) || null;
    if (!this.selectedEnrollment) return;
 
    this.gradeService.getByEnrollment(id).subscribe({
      next: res => {
        this.grades = res.data || [];
        if (this.grades.length > 0) {
          const sum = this.grades.reduce((acc, g) => acc + Number(g.grade), 0);
          this.average = parseFloat((sum / this.grades.length).toFixed(2)); // ← number
        } else {
          this.average = null;
        }
 
        setTimeout(() => {
          const rows = document.querySelectorAll('.grades-table tbody tr');
          if (rows.length) {
            gsap.from(Array.from(rows), {
              x: -20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out'
            });
          }
        }, 50);
      }
    });
  }

}
