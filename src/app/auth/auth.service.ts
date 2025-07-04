// src/app/auth/auth.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { 
  AuthenticationResult, 
  InteractionStatus, 
  EventType,
  AccountInfo,
  InteractionRequiredAuthError,
  SilentRequest
} from '@azure/msal-browser';
import { Observable, Subject, BehaviorSubject, of, from } from 'rxjs';
import { filter, takeUntil, map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  displayName: string;
  email: string;
  id: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Only initialize MSAL in development or when we have a proper Azure AD setup
    if (this.isDevelopment()) {
      return; // Skip MSAL initialization in development
    }

    // Listen for login success
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: any) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: any) => {
        const payload = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(payload.account);
        this.loadUserProfile();
        
        // Handle redirect after login
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/pages/dashboard']);
        }
      });

    // Check account status when interaction completes
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });

    // Initial account check
    this.checkAndSetActiveAccount();
  }

  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  private checkAndSetActiveAccount(): void {
    if (this.isDevelopment()) {
      return;
    }

    const activeAccount = this.msalService.instance.getActiveAccount();
    
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.setUserFromAccount(account);
      // Load additional profile data from Graph API
      this.loadUserProfile();
    } else {
      this.currentUserSubject.next(null);
    }
  }

  private setUserFromAccount(account: AccountInfo): void {
    const user: User = {
      displayName: account.name || account.username,
      email: account.username,
      id: account.localAccountId
    };
    this.currentUserSubject.next(user);
  }

  private loadUserProfile(): void {
    if (this.isDevelopment()) {
      return;
    }

    this.getGraphProfile().subscribe(
      profile => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && profile) {
          const updatedUser: User = {
            ...currentUser,
            displayName: profile.displayName || currentUser.displayName,
            email: profile.mail || profile.userPrincipalName || currentUser.email,
            firstName: profile.givenName,
            lastName: profile.surname
          };
          this.currentUserSubject.next(updatedUser);
        }
      },
      error => {
        console.log('Could not load user profile from Graph API:', error);
      }
    );
  }

  login(): void {
    if (!this.isDevelopment()) {
      this.msalService.loginRedirect({
        scopes: [...environment.azure.scopes, 'User.Read', 'User.ReadBasic.All']
      });
    }
  }

  logout(): void {
    if (!this.isDevelopment()) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
      });
    }
  }

  isAuthenticated(): Observable<boolean> {
    if (this.isDevelopment()) {
      return of(false); // Let AzureAuthService handle dev auth
    }

    return this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        map(() => {
          return this.msalService.instance.getAllAccounts().length > 0;
        })
      );
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(scopes?: string[]): Observable<string> {
    if (this.isDevelopment()) {
      return of('');
    }

    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      return of('');
    }

    const request: SilentRequest = {
      scopes: scopes || [...environment.azure.scopes, 'User.Read', 'User.ReadBasic.All'],
      account: account
    };

    return from(
      this.msalService.acquireTokenSilent(request)
    ).pipe(
      map((response: AuthenticationResult) => response.accessToken),
      catchError((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          // Fallback to interaction when silent call fails
          this.msalService.acquireTokenRedirect(request);
        }
        return of('');
      })
    );
  }

  private getGraphProfile(): Observable<any> {
    return this.getAccessToken(['User.Read']).pipe(
      filter(token => !!token),
      map(token => ({ 
        headers: { Authorization: `Bearer ${token}` } 
      })),
      switchMap(options => 
        this.http.get('https://graph.microsoft.com/v1.0/me', options)
      ),
      catchError(error => {
        console.error('Graph API error:', error);
        return of(null);
      })
    );
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}