// register-modal.component.ts
import { Component, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class RegisterModalComponent implements AfterViewInit {

  @Output() close         = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  @ViewChild('modalBox') modalBox!: ElementRef;

  form = { name: '', email: '', password: '' };
  showPassword = false;
  loading      = false;
  errorMsg     = '';

  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    gsap.fromTo(this.modalBox.nativeElement,
      { y: -40, opacity: 0, scale: 0.95 },
      { y: 0,   opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.errorMsg = 'Preencha todos os campos.';
      return;
    }
    if (this.form.password.length < 6) {
      this.errorMsg = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.authService.register({ ...this.form, role: 'student' }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.close.emit();
          this.authService.redirectByRole();
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}