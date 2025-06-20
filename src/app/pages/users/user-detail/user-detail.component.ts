// src/app/pages/users/user-detail/user-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { UserManagementService } from '../../../@core/services/user-management.service';
import { UserWithRoles, UserActivity } from '../../../@core/models/user.model';

@Component({
  selector: 'ngx-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: UserWithRoles | null = null;
  activities: UserActivity[] = [];
  loading = true;
  loadingActivities = false;
  
  // Tab tracking
  activeTab = 'profile';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserManagementService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params.id) {
          this.loadUser(params.id);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(userId: string) {
    this.loading = true;
    this.userService.getUserWithRoles(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        user => {
          this.user = user;
          this.loading = false;
          this.loadUserActivities(userId);
          
          // Log activity
          this.userService.logUserActivity({
            userId: 'current-user',
            userEmail: 'current-user@example.com',
            action: 'Viewed user details',
            details: { viewedUserId: userId, viewedUserEmail: user.mail }
          }).subscribe();
        },
        error => {
          console.error('Error loading user:', error);
          this.toastr.danger('Failed to load user details', 'Error');
          this.loading = false;
        }
      );
  }

  loadUserActivities(userId: string) {
    this.loadingActivities = true;
    this.userService.getUserActivities(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        activities => {
          this.activities = activities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.loadingActivities = false;
        },
        error => {
          console.error('Error loading activities:', error);
          this.loadingActivities = false;
        }
      );
  }

  toggleUserStatus() {
    if (!this.user) return;

    const action = this.user.accountEnabled ? 'disable' : 'enable';
    const confirmMessage = `Are you sure you want to ${action} this user?`;

    if (confirm(confirmMessage)) {
      const operation = this.user.accountEnabled
        ? this.userService.disableUser(this.user.id)
        : this.userService.enableUser(this.user.id);

      operation.pipe(takeUntil(this.destroy$)).subscribe(
        () => {
          this.toastr.success(`User ${action}d successfully`, 'Success');
          if (this.user) {
            this.user.accountEnabled = !this.user.accountEnabled;
          }
        },
        error => {
          console.error('Error updating user status:', error);
          this.toastr.danger(`Failed to ${action} user`, 'Error');
        }
      );
    }
  }

  resetPassword() {
    // In a real app, this would trigger a password reset flow
    this.toastr.info('Password reset email sent to user', 'Password Reset');
  }

  goBack() {
    this.router.navigate(['/pages/users/list']);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleColor(role: string): string {
    const roleColors = {
      'Admin': 'danger',
      'User': 'primary',
      'Manager': 'warning',
      'Viewer': 'info'
    };
    return roleColors[role] || 'basic';
  }

  formatActivityTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }
}