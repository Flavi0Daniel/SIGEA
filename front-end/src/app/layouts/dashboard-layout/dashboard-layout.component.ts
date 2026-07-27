// src/app/layouts/dashboard-layout/dashboard-layout.component.ts
import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {

  @ViewChild('menuRef') menuRef!: ElementRef;

  user: User | null = null;
  open = false;
  private sub!: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe(u => this.user = u);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  toggleMenu(): void { this.open = !this.open; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.menuRef && !this.menuRef.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }

  logout(): void { this.auth.logout(); }
}