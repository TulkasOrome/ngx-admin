// src/app/pages/users/user-profile/user-profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { UserManagementService } from '../../../@core/services/user-management.service';
import { AzureAuthService } from '../../../@core/services/azure-auth.service';
import { AzureUser } from '../../../@core/models/user.model';

@Component({
  selector: 'ngx-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm: FormGroup;
  user: AzureUser | null = null;
  loading = true;
  saving = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private authService: AzureAuthService,
    private toastr: NbToastrService
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      givenName: [''],
      surname: [''],
      jobTitle: [''],
      department: [''],
      officeLocation: [''],
      mobilePhone: ['']
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile() {
    this.loading = true;
    this.userService.getCurrentUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        user => {
          this.user = user;
          this.populateForm(user);
          this.loading = false;
        },
        error => {
          console.error('Error loading profile:', error);
          this.toastr.danger('Failed to load profile', 'Error');
          this.loading = false;
        }
      );
  }

  populateForm(user: AzureUser) {
    this.profileForm.patchValue({
      displayName: user.displayName || '',
      givenName: user.givenName || '',
      surname: user.surname || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      officeLocation: user.officeLocation || '',
      mobilePhone: user.mobilePhone || ''
    });
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.user) return;

    this.saving = true;
    const updates = this.profileForm.value;

    this.userService.updateUserProfile(this.user.id, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.toastr.success('Profile updated successfully', 'Success');
          this.saving = false;
          
          // Log activity
          this.userService.logUserActivity({
            userId: this.user!.id,
            userEmail: this.user!.mail,
            action: 'Updated profile',
            details: updates
          }).subscribe();
        },
        error => {
          console.error('Error updating profile:', error);
          this.toastr.danger('Failed to update profile. Admin permissions may be required.', 'Error');
          this.saving = false;
        }
      );
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
}