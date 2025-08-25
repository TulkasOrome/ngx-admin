// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AzureAuthService } from '../@core/services/azure-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private azureAuthService: AzureAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Check authentication status using our custom service
    const isAuthenticated = this.azureAuthService.isAuthenticated();
    
    console.log('AuthGuard check:', {
      isAuthenticated,
      currentUser: this.azureAuthService.currentUserValue,
      attemptedUrl: state.url
    });
    
    if (isAuthenticated) {
      return of(true);
    } else {
      // Store the attempted URL for redirecting after login
      if (state.url !== '/login') {
        localStorage.setItem('redirectUrl', state.url);
      }
      
      // Check if user is logged in but not authorized (external email)
      const user = this.azureAuthService.currentUserValue;
      if (user) {
        console.error(`User ${user.email} is not authorized. Not an IdentityPulse email or allowed external email.`);
        // You might want to show a different error page here
        // For now, we'll redirect to login with an error message
      }
      
      // Redirect to login page
      return of(this.router.createUrlTree(['/login']));
    }
  }
}