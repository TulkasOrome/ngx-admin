import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AzureAuthService } from '../@core/services/azure-auth.service';
import { NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private azureAuthService: AzureAuthService,
    private router: Router,
    private toastr: NbToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.azureAuthService.currentUser.pipe(
      take(1),
      map(user => {
        // Check if user exists
        if (!user) {
          // Store the attempted URL for redirecting after login
          if (state.url !== '/login') {
            localStorage.setItem('redirectUrl', state.url);
          }
          return this.router.createUrlTree(['/login']);
        }

        // Check if user's email domain is allowed
        const email = user.email.toLowerCase();
        const domain = email.split('@')[1];
        const allowedDomains = this.azureAuthService.getAllowedDomains();

        if (!allowedDomains.includes(domain)) {
          // Log unauthorized access attempt
          console.error(`Unauthorized access attempt from: ${email}`);
          
          // Show error message
          this.toastr.danger(
            `Access denied. Only users with ${allowedDomains.join(' or ')} email addresses are allowed.`,
            'Unauthorized',
            { duration: 5000 }
          );

          // Clear auth and redirect to login
          this.azureAuthService.logout();
          return this.router.createUrlTree(['/login']);
        }

        // User is authenticated and authorized
        return true;
      })
    );
  }
}