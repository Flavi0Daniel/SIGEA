import { Component, OnInit, OnDestroy, ViewChild,
  ElementRef, HostListener } from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('menuRef') menuRef!: ElementRef;
 
  user: User | null = null;
  open = false;
  private sub!: Subscription;
 
  constructor(private auth: AuthService, private router: Router) {}
 
  ngOnInit(): void {
    this.sub = this.auth.currentUser$.subscribe(u => this.user = u);
  }
 
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
 
  toggleMenu(): void { this.open = !this.open; }
 
  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.menuRef && !this.menuRef.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }
 
  navigate(path: string): void {
    this.open = false;
    const role = this.auth.role;
    this.router.navigate([`/${role}/${path}`]);
  }
 
  logout(): void {
    this.open = false;
    this.auth.logout();
  }

}
