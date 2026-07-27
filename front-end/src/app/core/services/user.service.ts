// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${API}/users/me`);
  }

  update(id: number, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${API}/users/me`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${API}/users/me/password`, data);
  }

  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${API}/users/all`);
  }

  // Filtra por role localmente (o backend /all devolve todos)
  getByRole(role: string): Observable<ApiResponse<User[]>> {
    return this.getAll().pipe(
      map(res => ({
        ...res,
        data: (res.data || []).filter((u: User) => u.role === role)
      }))
    );
  }

  create(data: Partial<User> & { password: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${API}/users/create`, data);
  }

  deactivate(id: number): Observable<any> {
    return this.http.put(`${API}/users/${id}/deactivate`, {});
  }

  reactivate(id: number): Observable<any> {
    return this.http.put(`${API}/users/${id}/reactivate`, {});
  }
}