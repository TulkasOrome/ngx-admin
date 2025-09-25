// src/app/@core/services/azure-auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  id?: number;
  provider?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // Backend API URL
  private apiUrl = environment.production 
    ? 'https://identitypulse-backend.azurewebsites.net/api'
    : '/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for stored user and token
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('access_token');
    
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser && token ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Verify token on initialization if it exists
    if (token && !this.currentUserSubject.value) {
      this.verifyToken();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with email and password - FIXED VERSION
   * Returns true when login AND profile loading is complete
   */
  login(email: string, password: string): Observable<boolean> {
    console.log('Starting login process for:', email);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/signin`, {
      email,
      password
    }).pipe(
      switchMap(response => {
        console.log('Login successful, received tokens');
        
        // Store tokens
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Now load the user profile and wait for it to complete
        return this.loadUserProfileAsync();
      }),
      map(user => {
        console.log('User profile loaded:', user);
        return !!user;  // Return true if user was loaded successfully
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.clearAuth();
        return of(false);
      })
    );
  }

  /**
   * Load user profile from backend - Returns Observable
   */
  private loadUserProfileAsync(): Observable<User | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Loading user profile...');
    
    return this.http.get<UserResponse>(`${this.apiUrl}/users/me`, { headers })
      .pipe(
        map(response => this.mapUserResponse(response)),
        tap(user => {
          console.log('Setting current user:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Failed to load user profile:', error);
          // If token is invalid, clear everything
          if (error.status === 401) {
            this.clearAuth();
          }
          return of(null);
        })
      );
  }

  /**
   * Load user profile - fire and forget version (for initialization)
   */
  loadUserProfile(): void {
    this.loadUserProfileAsync().subscribe();
  }

  /**
   * Map backend user response to our User interface
   */
  private mapUserResponse(response: UserResponse): User {
    const firstName = response.first_name || '';
    const lastName = response.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || response.username || response.email;
    
    return {
      id: response.id,
      email: response.email,
      username: response.username,
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      role: response.role
    };
  }

  /**
   * Verify stored token is still valid
   */
  private verifyToken(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<UserResponse>(`${this.apiUrl}/users/me`, { headers })
      .pipe(
        map(response => this.mapUserResponse(response)),
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Token verification failed:', error);
          // If token is invalid, try to refresh
          if (error.status === 401) {
            return this.refreshToken();
          }
          this.clearAuth();
          return of(null);
        })
      ).subscribe();
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.clearAuth();
      return of(null);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      switchMap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        // Return the user profile loading
        return this.loadUserProfileAsync();
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.clearAuth();
        return of(null);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('Logging out user');
    const token = localStorage.getItem('access_token');
    
    // Call backend logout endpoint if token exists
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      this.http.post(`${this.apiUrl}/auth/sign-out`, {}, { headers })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    
    // Clear local storage and redirect
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('redirectUrl');
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    const token = localStorage.getItem('access_token');
    return !!user && !!token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'admin';
  }

  /**
   * Development mode check
   */
  public isDevelopment(): boolean {
    return !environment.production;
  }

  /**
   * Dev login for backwards compatibility
   */
  devLogin(email: string, password: string): Observable<boolean> {
    return this.login(email, password);
  }

  /**
   * For compatibility with old code
   */
  public isEmailAllowed(email: string): boolean {
    return true;
  }

  public getAllowedDomains(): string[] {
    return ['All registered users'];
  }

  loginWithProvider(provider: string): void {
    console.log('Social login not implemented for backend auth');
  }
}