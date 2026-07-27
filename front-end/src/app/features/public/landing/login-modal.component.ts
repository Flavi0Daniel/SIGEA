// login-modal.component.ts
import { Component, OnInit, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class LoginModalComponent implements AfterViewInit {

  @Output() close           = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  @ViewChild('modalBox') modalBox!: ElementRef;

  form = { email: '', password: '' };
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
    if (!this.form.email || !this.form.password) {
      this.errorMsg = 'Preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.authService.login(this.form).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.close.emit();
          this.authService.redirectByRole();
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Email ou senha incorrectos.';
        gsap.fromTo(this.modalBox.nativeElement,
          { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        );
      }
    });
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}