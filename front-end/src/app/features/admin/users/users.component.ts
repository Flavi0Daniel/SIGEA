// src/app/features/admin/users/users.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {

  @ViewChild('modalRef') modalRef?: ElementRef;

  users:    User[] = [];
  filtered: User[] = [];
  search   = '';
  loading  = false;
  showModal = false;
  saving    = false;
  errorMsg  = '';

  form = { name: '', email: '', password: '', phone: '', description: '', role: 'instructor' };

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    gsap.from('.admin-page', { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: res => {
        this.users    = (res.data || []).filter((u: User) => u.role === 'instructor');
        this.filtered = [...this.users];
        this.loading  = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter(): void {
    const s = this.search.toLowerCase();
    this.filtered = s
      ? this.users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
      : [...this.users];
  }

  openAdd(): void {
    this.form = { name: '', email: '', password: '', phone: '', description: '', role: 'instructor' };
    this.errorMsg = '';
    this.showModal = true;
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
    if (!this.form.name.trim())    { this.errorMsg = 'O nome é obrigatório.'; return; }
    if (!this.form.email.trim())   { this.errorMsg = 'O email é obrigatório.'; return; }
    if (!this.form.password || this.form.password.length < 6) {
      this.errorMsg = 'A senha deve ter pelo menos 6 caracteres.'; return;
    }

    this.saving = true;
    this.errorMsg = '';

    this.userService.create({
      name:     this.form.name,
      email:    this.form.email,
      password: this.form.password,
      phone:    this.form.phone || undefined,
      role:     'instructor'
    }).subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.errorMsg = err.error?.message || 'Erro ao criar formador.'; }
    });
  }

  toggleActive(user: User): void {
    const obs = user.is_active
      ? this.userService.deactivate(user.id)
      : this.userService.reactivate(user.id);
    obs.subscribe({ next: () => this.load() });
  }
}