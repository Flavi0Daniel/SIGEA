import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

// ─── course.service.ts ────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${API}/courses`);
  }

  getActive(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${API}/courses/active`);
  }

  getById(id: number): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${API}/courses/${id}`);
  }

  create(data: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(`${API}/courses`, data);
  }

  update(id: number, data: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${API}/courses/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/courses/${id}`);
  }
}