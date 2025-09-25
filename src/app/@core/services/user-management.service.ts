// src/app/@core/services/user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AzureAuthService } from '../services/azure-auth.service';
import { environment } from '../../../environments/environment';

export interface BackendUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = environment.production 
    ? 'https://identitypulse-backend.azurewebsites.net/api'
    : 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AzureAuthService
  ) {}

  /**
   * Get all users from backend
   */
  getAllUsers(): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(`${this.apiUrl}/users`)
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  /**
   * Get single user from backend
   */
  getUser(userId: string | number): Observable<BackendUser> {
    return this.http.get<BackendUser>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user:', error);
          return of(null);
        })
      );
  }

  /**
   * Get current user's profile
   */
  getCurrentUserProfile(): Observable<BackendUser> {
    return this.http.get<BackendUser>(`${this.apiUrl}/users/me`)
      .pipe(
        catchError(error => {
          console.error('Error fetching current user profile:', error);
          return of(null);
        })
      );
  }

  /**
   * Update user (admin only)
   */
  updateUserProfile(userId: string | number, updates: UserUpdate): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}`, updates)
      .pipe(
        catchError(error => {
          console.error('Error updating user:', error);
          throw error;
        })
      );
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(userId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting user:', error);
          throw error;
        })
      );
  }

  /**
   * Get pending approvals (admin only)
   */
  getPendingApprovals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approval/pending`)
      .pipe(
        catchError(error => {
          console.error('Error fetching pending approvals:', error);
          return of([]);
        })
      );
  }

  /**
   * Map backend user to display format
   */
  mapBackendUserToDisplay(user: BackendUser): any {
    return {
      id: user.id.toString(),
      displayName: `${user.first_name} ${user.last_name}`.trim() || user.username,
      mail: user.email,
      userPrincipalName: user.email,
      givenName: user.first_name,
      surname: user.last_name,
      jobTitle: user.role === 'admin' ? 'Administrator' : 'User',
      department: 'Identity Operations',
      officeLocation: 'Sydney',
      mobilePhone: '',
      accountEnabled: user.is_active,
      businessPhones: []
    };
  }

  /**
   * Get user with roles (for compatibility)
   */
  getUserWithRoles(userId: string): Observable<any> {
    return this.getUser(userId).pipe(
      map(user => {
        if (!user) return null;
        
        const mappedUser = this.mapBackendUserToDisplay(user);
        return {
          ...mappedUser,
          roles: [user.role]
        };
      })
    );
  }

  /**
   * Enable/Disable user
   */
  disableUser(userId: string): Observable<any> {
    // This would need to be implemented in the backend
    // For now, we can update the user with is_active = false
    return of({ success: true });
  }

  enableUser(userId: string): Observable<any> {
    // This would need to be implemented in the backend
    // For now, we can update the user with is_active = true
    return of({ success: true });
  }

  // Activity logging methods - these can be stored locally or sent to backend
  logUserActivity(activity: any): Observable<any> {
    // Store locally for now
    const activities = this.getStoredActivities();
    activities.push({
      ...activity,
      timestamp: new Date()
    });
    
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
    return of({ success: true });
  }

  getUserActivities(userId?: string): Observable<any[]> {
    const activities = this.getStoredActivities();
    
    if (userId) {
      return of(activities.filter(a => a.userId === userId));
    }
    
    return of(activities);
  }

  private getStoredActivities(): any[] {
    const stored = localStorage.getItem('userActivities');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<BackendUser[]> {
    // For now, get all users and filter client-side
    // You might want to add a search endpoint to your backend
    return this.getAllUsers().pipe(
      map(users => users.filter(u => 
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(query.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  getUserRoles(userId: string): Observable<string[]> {
    return this.getUser(userId).pipe(
      map(user => user ? [user.role] : [])
    );
  }
}