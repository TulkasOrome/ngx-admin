// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Observable, of } from 'rxjs';
import { filter, switchMap, take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        take(1),
        switchMap(() => {
          if (this.msalService.instance.getAllAccounts().length > 0) {
            return of(true);
          }
          
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectUrl', state.url);
          
          // Initiate login
          this.msalService.loginRedirect();
          return of(false);
        })
      );
  }
}