import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles: string[] = route.data['roles'] || [];
    const userRole = this.auth.role;

    if (userRole && allowedRoles.includes(userRole)) return true;

    // Redireciona para o dashboard correcto em vez de mostrar erro
    this.auth.redirectByRole();
    return false;
  }
}