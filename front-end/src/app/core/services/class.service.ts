import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Class } from '../models/class.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

// ─── class.service.ts ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ClassService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Class[]>> {
    return this.http.get<ApiResponse<Class[]>>(`${API}/classes`);
  }

  getActive(): Observable<ApiResponse<Class[]>> {
    return this.http.get<ApiResponse<Class[]>>(`${API}/classes/active`);
  }

  getById(id: number): Observable<ApiResponse<Class>> {
    return this.http.get<ApiResponse<Class>>(`${API}/classes/${id}`);
  }

  getByCourse(courseId: number): Observable<ApiResponse<Class[]>> {
    return this.http.get<ApiResponse<Class[]>>(`${API}/classes/course/${courseId}`);
  }

  getMyClasses(): Observable<ApiResponse<Class[]>> {
    return this.http.get<ApiResponse<Class[]>>(`${API}/classes/instructor/me`);
  }

  create(data: Partial<Class>): Observable<ApiResponse<Class>> {
    return this.http.post<ApiResponse<Class>>(`${API}/classes`, data);
  }

  update(id: number, data: Partial<Class>): Observable<ApiResponse<Class>> {
    return this.http.put<ApiResponse<Class>>(`${API}/classes/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/classes/${id}`);
  }
}
