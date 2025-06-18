// src/app/auth/auth.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { 
  AuthenticationResult, 
  InteractionStatus, 
  EventType,
  AccountInfo,
  InteractionRequiredAuthError
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

  private checkAndSetActiveAccount(): void {
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
    this.getGraphProfile().subscribe(
      profile => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
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
    this.msalService.loginRedirect({
      scopes: environment.azure.scopes
    });
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    });
  }

  isAuthenticated(): Observable<boolean> {
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

  getAccessToken(): Observable<string> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      return of('');
    }

    return from(
      this.msalService.acquireTokenSilent({
        scopes: environment.azure.scopes,
        account: account
      })
    ).pipe(
      map((response: AuthenticationResult) => response.accessToken),
      catchError((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          // Fallback to interaction when silent call fails
          this.msalService.acquireTokenRedirect({
            scopes: environment.azure.scopes
          });
        }
        return of('');
      })
    );
  }

  private getGraphProfile(): Observable<any> {
    return this.getAccessToken().pipe(
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