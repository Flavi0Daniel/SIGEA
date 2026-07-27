// src/app/features/student/my-certificates/my-certificates.component.ts
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, ElementRef, QueryList
} from '@angular/core';
import { gsap } from 'gsap';
import { CertificateService } from '../../../core/services/certificate.service';
import { Certificate } from '../../../core/models/certificate.model';
import { ApiResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-my-certificates',
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.scss']
})
export class MyCertificatesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('pageHeader') pageHeader!: ElementRef;
  @ViewChild('pageBody')   pageBody!:   ElementRef;
  @ViewChildren('certCard') certCards!: QueryList<ElementRef>;

  certificates: Certificate[] = [];
  loading = false;
  private ctx!: gsap.Context;

  constructor(private certService: CertificateService) {}

  ngOnInit(): void {
    this.loading = true;
    this.certService.getMyCertificates().subscribe({
      next: (res: ApiResponse<Certificate[]>) => {
        this.certificates = res.data || [];
        this.loading = false;
        setTimeout(() => this.animateCards(), 100);
      },
      error: () => this.loading = false
    });
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from(this.pageHeader.nativeElement, { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
      gsap.from(this.pageBody.nativeElement,   { y: 30,  opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
    });
  }

  ngOnDestroy(): void { this.ctx?.revert(); }

  animateCards(): void {
    const cards = this.certCards.map(c => c.nativeElement);
    if (cards.length) {
      gsap.from(cards, { y: 30, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.3)' });
    }
  }

  getDownloadUrl(id: number): string {
    return this.certService.getDownloadUrl(id);
  }

  sendWhatsApp(cert: Certificate): void {
    if (!confirm('Enviar este certificado via WhatsApp?')) return;
    this.certService.sendWhatsApp(cert.id).subscribe({
      next: () => {
        cert.whatsapp_sent = true;
        alert('Certificado enviado via WhatsApp com sucesso!');
      },
      error: (err: any) => alert(err.error?.message || 'Erro ao enviar. Verifique o número de telefone.')
    });
  }
}