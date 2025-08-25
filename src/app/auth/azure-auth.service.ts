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
  
  // Allowed email domains
  private readonly ALLOWED_DOMAINS = ['identitypulse.ai', 'identitypulse.com', 'data-direct.com.au'];

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
        const user = JSON.parse(storedUser);
        // For dev mode, skip domain validation for stored users
        this.currentUserSubject.next(user);
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
        
        if (user && this.isEmailAllowed(user.email)) {
          this.currentUserSubject.next(user);
          
          // If we have a user and we're on the login page, redirect to dashboard
          if (window.location.pathname === '/login') {
            const redirectUrl = localStorage.getItem('redirectUrl') || '/pages/dashboard';
            localStorage.removeItem('redirectUrl');
            this.router.navigate([redirectUrl]);
          }
        } else if (user) {
          // User authenticated but not authorized
          console.error('User authenticated but not authorized:', user.email);
          this.showUnauthorizedMessage(user.email);
          this.logout();
        } else {
          this.currentUserSubject.next(null);
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
                  c.typ === 'email' ||
                  c.typ === 'preferred_username'
    );

    const nameClaim = principal.claims?.find(
      (c: any) => c.typ === 'name' ||
                  c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    );

    const email = emailClaim?.val || principal.userDetails || '';
    
    // Return user object (domain validation happens in loadUser)
    return {
      email: email,
      name: nameClaim?.val || principal.userDetails || 'User',
      role: principal.userRoles?.[0] || 'authenticated',
      provider: principal.identityProvider
    };
  }

  private isEmailAllowed(email: string): boolean {
    if (!email) return false;
    
    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@')[1];
    
    // Check if it's an allowed domain
    if (this.ALLOWED_DOMAINS.includes(domain)) {
      return true;
    }
    
    // Check if user is in the allowed external emails list
    const allowedExternalEmails = [     
      'earl@data-direct.com.au',
      'jedwards@buzzsaw.media'
      // Add more external emails here as needed
    ];     
    
    return allowedExternalEmails.includes(emailLower);
  }

  private showUnauthorizedMessage(email: string): void {
    // Store unauthorized attempt
    localStorage.setItem('unauthorizedEmail', email);
    
    // You can also trigger a toast notification here if you have access to NbToastrService
    alert(`Access denied. Only users with @identitypulse.ai or @identitypulse.com email addresses are allowed. Your email: ${email}`);
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
      
      // Azure SWA login with domain hint
      const loginUrl = provider === 'aad' 
        ? `/.auth/login/${provider}?domain_hint=identitypulse.ai`
        : `/.auth/login/${provider}`;
      
      window.location.href = loginUrl;
    }
  }

  devLogin(email: string, password: string): Observable<boolean> {
    console.log('devLogin called with:', email);
    
    return new Observable(observer => {
      setTimeout(() => {
        const allowedUsers = [
          { email: 'admin@identitypulse.com', password: 'admin123', name: 'Admin User' },
          { email: 'test@identitypulse.ai', password: 'test123', name: 'Test User' },
          { email: 'demo@identitypulse.ai', password: 'demo123', name: 'Demo User' },
          { email: 'earl@data-direct.com.au', password: 'E@rl#D@t@2024!Pulse', name: 'Earl' }
        ];
        
        // Debug with alert
        const user = allowedUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (!user) {
          // Check if it's the email or password that's wrong
          const emailExists = allowedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (emailExists) {
            alert(`Password mismatch for ${email}. Make sure you're entering: E@rl#D@t@2024!Pulse`);
          } else {
            alert(`Email ${email} not found in allowed users.`);
          }
        }
        
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
    localStorage.removeItem('unauthorizedEmail');
    this.currentUserSubject.next(null);
    
    if (this.isDevelopment()) {
      this.router.navigate(['/login']);
    } else {
      window.location.href = '/.auth/logout';
    }
  }

  isAuthenticated(): boolean {
  const user = this.currentUserValue;
  // In development, skip domain check for authenticated users
  if (this.isDevelopment()) {
    return !!user;
  }
  return !!user && this.isEmailAllowed(user.email);
}

  public isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  public getAllowedDomains(): string[] {
    return [...this.ALLOWED_DOMAINS];
  }
}