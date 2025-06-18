// src/app/auth/azure-auth.service.ts
import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, EventType } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  displayName: string;
  email: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService {
  private readonly _destroying$ = new Subject<void>();
  loggedIn = false;
  user: User | null = null;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient,
    private router: Router
  ) {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: any) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: any) => {
        const payload = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(payload.account);
        this.checkAndSetActiveAccount();
        
        // Check for redirect URL
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/pages/dashboard']);
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });
  }

  checkAndSetActiveAccount() {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    
    if (this.msalService.instance.getActiveAccount()) {
      this.loggedIn = true;
      const account = this.msalService.instance.getActiveAccount();
      if (account) {
        this.user = {
          displayName: account.name || account.username,
          email: account.username,
          id: account.localAccountId
        };
      }
    }
  }

  login() {
    this.msalService.loginRedirect();
  }

  logout() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/'
    });
  }

  getUser(): User | null {
    return this.user;
  }

  getUserProfile(): Observable<any> {
    return this.http.get('https://graph.microsoft.com/v1.0/me');
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}