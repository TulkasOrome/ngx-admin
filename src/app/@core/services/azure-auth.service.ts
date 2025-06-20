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
    console.log('Loading user...');
    
    // Check if we're in development mode
    if (this.isDevelopment()) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
      return;
    }

    // In production, check for Azure Static Web Apps authentication
    this.http.get<any>('/.auth/me')
      .pipe(
        tap(response => console.log('Auth response:', response)),
        map(response => {
          // Azure SWA returns an array with the user info
          if (response && Array.isArray(response) && response.length > 0) {
            return this.mapAzureUserToUser({ clientPrincipal: response[0] });
          } else if (response && response.clientPrincipal) {
            return this.mapAzureUserToUser(response);
          }
          return null;
        }),
        catchError((error) => {
          console.log('Auth check failed:', error);
          return of(null);
        })
      )
      .subscribe(user => {
        console.log('Mapped user:', user);
        this.currentUserSubject.next(user);
        
        // If we have a user and we're on the login page, redirect to dashboard
        if (user && window.location.pathname === '/login') {
          const redirectUrl = localStorage.getItem('redirectUrl') || '/pages/dashboard';
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        }
      });
  }

  private mapAzureUserToUser(response: any): User | null {
    const principal = response.clientPrincipal;
    if (!principal || !principal.userId) return null;

    console.log('Mapping principal:', principal);

    // Find email from claims
    const emailClaim = principal.claims?.find(
      (c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
                  c.typ === 'emails' ||
                  c.typ === 'email'
    );

    const nameClaim = principal.claims?.find(
      (c: any) => c.typ === 'name' ||
                  c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    );

    return {
      email: emailClaim?.val || principal.userDetails || 'user@example.com',
      name: nameClaim?.val || principal.userDetails || 'User',
      role: principal.userRoles?.[0] || 'authenticated',
      provider: principal.identityProvider
    };
  }

  login(provider: 'github' | 'aad' | 'google' | 'twitter' = 'aad'): void {
    if (this.isDevelopment()) {
      const mockUser: User = {
        email: 'admin@identitypulse.com',
        name: 'Admin User',
        role: 'authenticated'
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      this.router.navigate(['/pages/dashboard']);
    } else {
      // Store current location for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.setItem('redirectUrl', currentPath);
      }
      
      // Azure SWA login
      window.location.href = `/.auth/login/${provider}`;
    }
  }

  devLogin(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const allowedUsers = [
          { email: 'admin@identitypulse.com', password: 'admin123', name: 'Admin User' },
          { email: 'test@identitypulse.com', password: 'test123', name: 'Test User' }
        ];
        
        const user = allowedUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (user) {
          const authUser: User = {
            email: user.email,
            name: user.name,
            role: 'authenticated'
          };
          localStorage.setItem('currentUser', JSON.stringify(authUser));
          this.currentUserSubject.next(authUser);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('redirectUrl');
    this.currentUserSubject.next(null);
    
    if (this.isDevelopment()) {
      this.router.navigate(['/login']);
    } else {
      window.location.href = '/.auth/logout';
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  public isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
}