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
    if (this.azureAuthService.isAuthenticated()) {
      return of(true);
    } else {
      // Store the attempted URL for redirecting after login
      if (state.url !== '/login') {
        localStorage.setItem('redirectUrl', state.url);
      }
      
      // Redirect to login page
      return of(this.router.createUrlTree(['/login']));
    }
  }
}