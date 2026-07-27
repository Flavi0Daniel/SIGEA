// src/app/core/services/enrollment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../models/enrollment.model';
import { Payment } from '../models/payment.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  constructor(private http: HttpClient) {}

  enroll(classId: number): Observable<ApiResponse<{ enrollment: Enrollment; payment: Payment }>> {
    return this.http.post<ApiResponse<any>>(`${API}/enrollments`, { class_id: classId });
  }

  getMyEnrollments(): Observable<ApiResponse<Enrollment[]>> {
    return this.http.get<ApiResponse<Enrollment[]>>(`${API}/enrollments/me`);
  }

  getAllEnrollments(): Observable<ApiResponse<Enrollment[]>> {
    return this.http.get<ApiResponse<Enrollment[]>>(`${API}/enrollments`);
  }

  getByClass(classId: number): Observable<ApiResponse<Enrollment[]>> {
    return this.http.get<ApiResponse<Enrollment[]>>(`${API}/enrollments/class/${classId}`);
  }

  activate(id: number): Observable<any> {
    return this.http.put(`${API}/enrollments/${id}/activate`, {});
  }

  cancel(id: number): Observable<any> {
    return this.http.put(`${API}/enrollments/${id}/cancel`, {});
  }

  complete(id: number): Observable<any> {
    return this.http.put(`${API}/enrollments/${id}/complete`, {});
  }
}