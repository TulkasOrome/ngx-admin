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
import { map, take } from 'rxjs/operators';

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
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    
    // Check if we have a token and user
    const token = localStorage.getItem('access_token');
    const user = this.azureAuthService.currentUserValue;
    
    console.log('AuthGuard check:', {
      hasToken: !!token,
      hasUser: !!user,
      user: user,
      attemptedUrl: state.url
    });
    
    // If we have both token and user, allow access
    if (token && user) {
      return true;
    }
    
    // If we have a token but no user yet, the service might still be loading the user
    // Give it a moment to load
    if (token && !user) {
      console.log('Token exists but user not loaded yet, waiting...');
      
      return this.azureAuthService.currentUser.pipe(
        take(1),
        map(currentUser => {
          console.log('User loaded:', currentUser);
          if (currentUser) {
            return true;
          } else {
            // Token might be invalid
            console.log('Failed to load user with token, redirecting to login');
            localStorage.setItem('redirectUrl', state.url);
            return this.router.createUrlTree(['/login']);
          }
        })
      );
    }
    
    // No token, redirect to login
    console.log('No token, redirecting to login');
    if (state.url !== '/login') {
      localStorage.setItem('redirectUrl', state.url);
    }
    
    return this.router.createUrlTree(['/login']);
  }
}