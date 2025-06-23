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
            catchError(error => {
              console.error('Graph API error:', error);
              // Return mock data as fallback
              return of(this.getMockUsers());
            })
          )
      ),
      catchError(error => {
        console.error('Auth error:', error);
        // Return mock data as fallback
        return of(this.getMockUsers());
      })
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
            catchError(error => {
              console.error('Error fetching current user profile:', error);
              // Fallback to auth service user
              const currentUser = this.azureAuthService.currentUserValue;
              if (currentUser) {
                return of({
                  id: 'current-user-id',
                  displayName: currentUser.name,
                  mail: currentUser.email,
                  userPrincipalName: currentUser.email,
                  givenName: currentUser.name.split(' ')[0] || currentUser.name,
                  surname: currentUser.name.split(' ')[1] || '',
                  jobTitle: 'User',
                  department: 'General',
                  officeLocation: 'Sydney',
                  mobilePhone: '',
                  accountEnabled: true
                });
              }
              return of(null);
            })
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
    // Try to get token from MSAL first
    return this.authService.getAccessToken().pipe(
      map(token => {
        if (!token) {
          throw new Error('No access token available');
        }
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      })
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
        jobTitle: 'Senior Verification Analyst',
        department: 'Identity Operations',
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
        jobTitle: 'Verification Team Lead',
        department: 'Identity Operations',
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
        jobTitle: 'Identity Data Analyst',
        department: 'Analytics',
        officeLocation: 'Brisbane',
        mobilePhone: '+61 400 333 333',
        accountEnabled: false
      },
      {
        id: '4',
        displayName: 'Sarah Williams',
        mail: 'sarah.williams@identitypulse.com',
        userPrincipalName: 'sarah.williams@identitypulse.com',
        givenName: 'Sarah',
        surname: 'Williams',
        jobTitle: 'Compliance Officer',
        department: 'Compliance',
        officeLocation: 'Sydney',
        mobilePhone: '+61 400 444 444',
        accountEnabled: true
      },
      {
        id: '5',
        displayName: 'Michael Chen',
        mail: 'michael.chen@identitypulse.com',
        userPrincipalName: 'michael.chen@identitypulse.com',
        givenName: 'Michael',
        surname: 'Chen',
        jobTitle: 'Identity Verification Specialist',
        department: 'Identity Operations',
        officeLocation: 'Sydney',
        mobilePhone: '+61 400 555 555',
        accountEnabled: true
      },
      {
        id: '6',
        displayName: 'Emma Davis',
        mail: 'emma.davis@identitypulse.com',
        userPrincipalName: 'emma.davis@identitypulse.com',
        givenName: 'Emma',
        surname: 'Davis',
        jobTitle: 'Operations Manager',
        department: 'Identity Operations',
        officeLocation: 'Melbourne',
        mobilePhone: '+61 400 666 666',
        accountEnabled: true
      }
    ];
  }
}