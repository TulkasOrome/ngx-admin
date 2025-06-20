import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { AzureAuthService } from '../services/azure-auth.service';
import { AzureUser, UserActivity, UserWithRoles } from '../models/user.model';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private graphApiUrl = 'https://graph.microsoft.com/v1.0';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private azureAuthService: AzureAuthService,
    private elasticsearchService: ElasticsearchService
  ) {}

  // Get all users from Azure AD
  getAllUsers(): Observable<AzureUser[]> {
    // In development, return mock data
    if (this.azureAuthService.isDevelopment()) {
      return of(this.getMockUsers());
    }

    return this.getGraphHeaders().pipe(
      switchMap(headers => 
        this.http.get<any>(`${this.graphApiUrl}/users`, { headers })
          .pipe(
            map(response => response.value || []),
            catchError(this.handleError<AzureUser[]>('getAllUsers', []))
          )
      )
    );
  }

  // Get single user from Azure AD
  getUser(userId: string): Observable<AzureUser> {
    if (this.azureAuthService.isDevelopment()) {
      const mockUser = this.getMockUsers().find(u => u.id === userId);
      return of(mockUser);
    }

    return this.getGraphHeaders().pipe(
      switchMap(headers =>
        this.http.get<AzureUser>(`${this.graphApiUrl}/users/${userId}`, { headers })
          .pipe(
            catchError(this.handleError<AzureUser>('getUser'))
          )
      )
    );
  }

  // Get current user's profile
  getCurrentUserProfile(): Observable<AzureUser> {
    if (this.azureAuthService.isDevelopment()) {
      // Return mock current user
      return of({
        id: 'current-user-id',
        displayName: 'Admin User',
        mail: 'admin@identitypulse.com',
        userPrincipalName: 'admin@identitypulse.com',
        givenName: 'Admin',
        surname: 'User',
        jobTitle: 'System Administrator',
        department: 'IT',
        officeLocation: 'Sydney',
        mobilePhone: '+61 400 123 456',
        accountEnabled: true
      });
    }

    return this.getGraphHeaders().pipe(
      switchMap(headers =>
        this.http.get<AzureUser>(`${this.graphApiUrl}/me`, { headers })
          .pipe(
            catchError(this.handleError<AzureUser>('getCurrentUserProfile'))
          )
      )
    );
  }

  // Search users in Azure AD
  searchUsers(query: string): Observable<AzureUser[]> {
    if (this.azureAuthService.isDevelopment()) {
      const filtered = this.getMockUsers().filter(u => 
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.mail.toLowerCase().includes(query.toLowerCase())
      );
      return of(filtered);
    }

    const filter = `startswith(displayName,'${query}') or startswith(mail,'${query}')`;
    
    return this.getGraphHeaders().pipe(
      switchMap(headers =>
        this.http.get<any>(`${this.graphApiUrl}/users?$filter=${encodeURIComponent(filter)}`, { headers })
          .pipe(
            map(response => response.value || []),
            catchError(this.handleError<AzureUser[]>('searchUsers', []))
          )
      )
    );
  }

  // Get user's roles from Azure AD
  getUserRoles(userId: string): Observable<string[]> {
    if (this.azureAuthService.isDevelopment()) {
      // Return mock roles
      return of(['User', 'Admin']);
    }

    return this.getGraphHeaders().pipe(
      switchMap(headers =>
        this.http.get<any>(`${this.graphApiUrl}/users/${userId}/appRoleAssignments`, { headers })
          .pipe(
            map(response => {
              const assignments = response.value || [];
              return assignments.map((a: any) => a.appRoleId);
            }),
            catchError(this.handleError<string[]>('getUserRoles', []))
          )
      )
    );
  }

  // Get user with roles
  getUserWithRoles(userId: string): Observable<UserWithRoles> {
    return this.getUser(userId).pipe(
      switchMap(user => 
        this.getUserRoles(userId).pipe(
          map(roles => ({
            ...user,
            roles
          }))
        )
      )
    );
  }

  // Log user activity to Elasticsearch
  logUserActivity(activity: Omit<UserActivity, 'timestamp'>): Observable<any> {
    const activityWithTimestamp: UserActivity = {
      ...activity,
      timestamp: new Date()
    };

    // Since we don't have a backend, we'll store this in localStorage for now
    this.storeActivityLocally(activityWithTimestamp);
    
    return of({ success: true });
  }

  // Get user activities from localStorage (temporary solution)
  getUserActivities(userId?: string): Observable<UserActivity[]> {
    const activities = this.getStoredActivities();
    
    if (userId) {
      return of(activities.filter(a => a.userId === userId));
    }
    
    return of(activities);
  }

  // Update user profile in Azure AD (requires admin permissions)
  updateUserProfile(userId: string, updates: Partial<AzureUser>): Observable<any> {
    if (this.azureAuthService.isDevelopment()) {
      // Mock update
      return of({ success: true });
    }

    return this.getGraphHeaders().pipe(
      switchMap(headers =>
        this.http.patch(`${this.graphApiUrl}/users/${userId}`, updates, { headers })
          .pipe(
            catchError(this.handleError('updateUserProfile'))
          )
      )
    );
  }

  // Disable user in Azure AD (requires admin permissions)
  disableUser(userId: string): Observable<any> {
    return this.updateUserProfile(userId, { accountEnabled: false });
  }

  // Enable user in Azure AD (requires admin permissions)
  enableUser(userId: string): Observable<any> {
    return this.updateUserProfile(userId, { accountEnabled: true });
  }

  // Private helper methods
  private getGraphHeaders(): Observable<HttpHeaders> {
    return this.authService.getAccessToken().pipe(
      map(token => new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }

  // Temporary local storage for activities
  private storeActivityLocally(activity: UserActivity): void {
    const activities = this.getStoredActivities();
    activities.push(activity);
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
  }

  private getStoredActivities(): UserActivity[] {
    const stored = localStorage.getItem('userActivities');
    return stored ? JSON.parse(stored) : [];
  }

  // Mock data for development
  private getMockUsers(): AzureUser[] {
    return [
      {
        id: '1',
        displayName: 'John Doe',
        mail: 'john.doe@identitypulse.com',
        userPrincipalName: 'john.doe@identitypulse.com',
        givenName: 'John',
        surname: 'Doe',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        officeLocation: 'Sydney',
        mobilePhone: '+61 400 111 111',
        accountEnabled: true
      },
      {
        id: '2',
        displayName: 'Jane Smith',
        mail: 'jane.smith@identitypulse.com',
        userPrincipalName: 'jane.smith@identitypulse.com',
        givenName: 'Jane',
        surname: 'Smith',
        jobTitle: 'Product Manager',
        department: 'Product',
        officeLocation: 'Melbourne',
        mobilePhone: '+61 400 222 222',
        accountEnabled: true
      },
      {
        id: '3',
        displayName: 'Bob Johnson',
        mail: 'bob.johnson@identitypulse.com',
        userPrincipalName: 'bob.johnson@identitypulse.com',
        givenName: 'Bob',
        surname: 'Johnson',
        jobTitle: 'Data Analyst',
        department: 'Analytics',
        officeLocation: 'Brisbane',
        mobilePhone: '+61 400 333 333',
        accountEnabled: false
      }
    ];
  }
}