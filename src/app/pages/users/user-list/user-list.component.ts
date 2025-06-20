// src/app/pages/users/user-list/user-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { UserManagementService } from '../../../@core/services/user-management.service';
import { AzureUser } from '../../../@core/models/user.model';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  users: AzureUser[] = [];
  filteredUsers: AzureUser[] = [];
  loading = true;
  searchQuery = '';
  
  // Pagination
  pageSize = 10;
  currentPage = 1;
  
  // Stats
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;

  constructor(
    private userService: UserManagementService,
    private router: Router,
    private toastr: NbToastrService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        users => {
          this.users = users;
          this.filteredUsers = users;
          this.calculateStats();
          this.loading = false;
          
          // Log activity
          this.userService.logUserActivity({
            userId: 'current-user', // You'd get this from auth service
            userEmail: 'current-user@example.com',
            action: 'Viewed user list',
            details: { userCount: users.length }
          }).subscribe();
        },
        error => {
          console.error('Error loading users:', error);
          this.toastr.danger('Failed to load users', 'Error');
          this.loading = false;
        }
      );
  }

  setupSearch() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    if (!query) {
      this.filteredUsers = this.users;
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.displayName?.toLowerCase().includes(lowerQuery) ||
      user.mail?.toLowerCase().includes(lowerQuery) ||
      user.userPrincipalName?.toLowerCase().includes(lowerQuery) ||
      user.department?.toLowerCase().includes(lowerQuery)
    );
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.accountEnabled !== false).length;
    this.inactiveUsers = this.users.filter(u => u.accountEnabled === false).length;
  }

  viewUserDetails(user: AzureUser) {
    this.router.navigate(['/pages/users', user.id]);
  }

  exportUsers() {
    const csvContent = this.convertToCSV(this.filteredUsers);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.toastr.success('Users exported successfully', 'Export Complete');
  }

  private convertToCSV(users: AzureUser[]): string {
    const headers = ['Display Name', 'Email', 'Department', 'Job Title', 'Status'];
    const rows = users.map(user => [
      user.displayName || '',
      user.mail || '',
      user.department || '',
      user.jobTitle || '',
      user.accountEnabled !== false ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  refresh() {
    this.loadUsers();
  }

  get paginatedUsers(): AzureUser[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}