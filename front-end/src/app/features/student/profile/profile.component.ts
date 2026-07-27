// src/app/features/student/profile/profile.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { User } from '../../../core/models/user.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class StudentProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('profileCard')   profileCard!:   ElementRef;
  @ViewChild('enrollSection') enrollSection!: ElementRef;
  @ViewChild('editModal')     editModal?:     ElementRef;

  user: User | null = null;
  enrollments: Enrollment[] = [];
  profile = { gender: '', birthDate: '' };

  editOpen = false;
  saving   = false;
  errorMsg = '';
  editForm = { name: '', phone: '' };

  private sub!: Subscription;
  private ctx!: gsap.Context;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.editForm = { name: u.name, phone: u.phone || '' };
      }
    });
    this.loadEnrollments();
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from(this.profileCard.nativeElement, {
        y: -30, opacity: 0, duration: 0.6, ease: 'power2.out'
      });
      gsap.from(this.enrollSection.nativeElement, {
        y: 30, opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out'
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.ctx?.revert();
  }

  loadEnrollments(): void {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: res => this.enrollments = res.data || []
    });
  }

  openEdit(): void {
    this.errorMsg = '';
    this.editOpen = true;
    setTimeout(() => {
      if (this.editModal) {
        gsap.fromTo(this.editModal.nativeElement,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' }
        );
      }
    }, 10);
  }

  closeEdit(): void { this.editOpen = false; }

  saveProfile(): void {
    if (!this.user) return;
    if (!this.editForm.name.trim()) {
      this.errorMsg = 'O nome não pode estar vazio.';
      return;
    }

    this.saving   = true;
    this.errorMsg = '';

    // Usa PUT /api/users/me (rota correcta do backend)
    this.userService.update(this.user.id, {
      name:  this.editForm.name,
      phone: this.editForm.phone || undefined
    }).subscribe({
      next: res => {
        this.saving   = false;
        this.editOpen = false;
        // Actualiza o utilizador no localStorage e no BehaviorSubject
        const updated = res.data;
        localStorage.setItem('sigea_user', JSON.stringify(updated));
        this.auth.updateCurrentUser(updated);
      },
      error: err => {
        this.saving   = false;
        this.errorMsg = err.error?.message || 'Erro ao guardar. Tente novamente.';
      }
    });
  }

  cancelEnrollment(id: number): void {
    if (!confirm('Tem a certeza que quer cancelar esta inscrição?')) return;
    this.enrollmentService.cancel(id).subscribe({
      next: () => this.loadEnrollments()
    });
  }

  onAvatarChange(event: Event): void {
    // TODO: upload de avatar
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendente', active: 'Activa',
      completed: 'Concluída', cancelled: 'Cancelada'
    };
    return map[status] || status;
  }
}