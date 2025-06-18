// src/app/@core/services/azure-auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AzureUser {
  clientPrincipal: {
    userId: string;
    userRoles: string[];
    claims: Array<{ typ: string; val: string }>;
    identityProvider: string;
    userDetails: string;
  };
}

export interface User {
  email: string;
  name: string;
  role: string;
  provider?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.loadUser();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  loadUser(): void {
    // Check if we're in development mode
    if (this.isDevelopment()) {
      // In development, use mock auth
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
      return;
    }

    // In production, use Azure auth
    this.http.get<AzureUser>('/.auth/me')
      .pipe(
        map(response => this.mapAzureUserToUser(response)),
        catchError(() => of(null))
      )
      .subscribe(user => {
        this.currentUserSubject.next(user);
      });
  }

  private mapAzureUserToUser(azureUser: AzureUser): User | null {
    if (!azureUser?.clientPrincipal) return null;

    const emailClaim = azureUser.clientPrincipal.claims?.find(
      c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    );

    return {
      email: emailClaim?.val || azureUser.clientPrincipal.userDetails || 'user@example.com',
      name: azureUser.clientPrincipal.userDetails || 'User',
      role: azureUser.clientPrincipal.userRoles[0] || 'authenticated',
      provider: azureUser.clientPrincipal.identityProvider
    };
  }

  login(provider: 'github' | 'aad' | 'google' | 'twitter' = 'github'): void {
    if (this.isDevelopment()) {
      // Mock login for development
      const mockUser: User = {
        email: 'admin@identitypulse.com',
        name: 'Admin User',
        role: 'authenticated'
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      this.router.navigate(['/pages/dashboard']);
    } else {
      // Azure SWA login
      window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=/pages/dashboard`;
    }
  }

  // For development - simple email/password login
  devLogin(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const user: User = {
          email: email,
          name: email.split('@')[0],
          role: 'authenticated'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    if (this.isDevelopment()) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } else {
      window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
}