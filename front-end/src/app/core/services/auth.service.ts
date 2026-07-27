// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('sigea_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  get role(): string | null {
    return this.currentUser?.role || null;
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('sigea_token', res.data.token);
          localStorage.setItem('sigea_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('sigea_token', res.data.token);
          localStorage.setItem('sigea_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
        }
      })
    );
  }

  // Método público para actualizar o utilizador após edição de perfil
  updateCurrentUser(user: User): void {
    localStorage.setItem('sigea_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('sigea_token');
    localStorage.removeItem('sigea_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  redirectByRole(): void {
    const role = this.role;
    if (role === 'admin')           this.router.navigate(['/admin/dashboard']);
    else if (role === 'instructor') this.router.navigate(['/instructor/dashboard']);
    else                            this.router.navigate(['/student/dashboard']);
  }

  private getStoredUser(): User | null {
    try {
      const u = localStorage.getItem('sigea_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
}