// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  getMyPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${API}/payments/me`);
  }

  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${API}/payments`);
  }

  getByEnrollment(enrollmentId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${API}/payments/enrollment/${enrollmentId}`);
  }

  checkStatus(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${API}/payments/${id}/status`);
  }

  confirmManual(id: number): Observable<any> {
    return this.http.put(`${API}/payments/${id}/confirm`, {});
  }
}