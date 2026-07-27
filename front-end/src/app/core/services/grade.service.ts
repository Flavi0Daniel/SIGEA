import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grade } from '../models/grade.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

// ─── grade.service.ts ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class GradeService {
  constructor(private http: HttpClient) {}

  create(data: { enrollment_id: number; grade: number; attendance_percentage?: number; observations?: string }): Observable<ApiResponse<Grade>> {
    return this.http.post<ApiResponse<Grade>>(`${API}/grades`, data);
  }

  update(id: number, data: Partial<Grade>): Observable<ApiResponse<Grade>> {
    return this.http.put<ApiResponse<Grade>>(`${API}/grades/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API}/grades/${id}`);
  }

  getByEnrollment(enrollmentId: number): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${API}/grades/enrollment/${enrollmentId}`);
  }

  getByClass(classId: number): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${API}/grades/class/${classId}`);
  }

  getMyGrades(classId: number): Observable<ApiResponse<{ grades: Grade[]; average: string }>> {
    return this.http.get<ApiResponse<any>>(`${API}/grades/me/class/${classId}`);
  }
}