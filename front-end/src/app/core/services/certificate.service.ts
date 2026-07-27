// src/app/core/services/certificate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from '../models/certificate.model';
import { ApiResponse } from '../models/auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  constructor(private http: HttpClient) {}

  generate(enrollmentId: number): Observable<ApiResponse<Certificate>> {
    return this.http.post<ApiResponse<Certificate>>(`${API}/certificates/generate/${enrollmentId}`, {});
  }

  getMyCertificates(): Observable<ApiResponse<Certificate[]>> {
    return this.http.get<ApiResponse<Certificate[]>>(`${API}/certificates/me`);
  }

  verify(certNumber: string): Observable<ApiResponse<Certificate>> {
    return this.http.get<ApiResponse<Certificate>>(`${API}/certificates/verify/${certNumber}`);
  }

  sendWhatsApp(id: number): Observable<any> {
    return this.http.post(`${API}/certificates/${id}/send-whatsapp`, {});
  }

  getDownloadUrl(id: number): string {
    return `${API}/certificates/${id}/download`;
  }
}