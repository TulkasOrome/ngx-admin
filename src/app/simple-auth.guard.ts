import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SimpleAuthService } from './simple-auth.service';

@Injectable({ providedIn: 'root' })
export class SimpleAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: SimpleAuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      // User is logged in
      return true;
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}