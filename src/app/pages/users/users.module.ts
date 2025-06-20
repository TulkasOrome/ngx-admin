// src/app/pages/users/users.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbIconModule,
  NbSpinnerModule,
  NbUserModule,
  NbListModule,
  NbTagModule,
  NbTooltipModule,
  NbTabsetModule,
  NbSelectModule,
  NbBadgeModule,
  NbToggleModule,
  NbDialogModule,
  NbAlertModule
} from '@nebular/theme';

import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ThemeModule } from '../../@theme/theme.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: UserListComponent
  },
  {
    path: 'profile',
    component: UserProfileComponent
  },
  {
    path: ':id',
    component: UserDetailComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ThemeModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
    NbSpinnerModule,
    NbUserModule,
    NbListModule,
    NbTagModule,
    NbTooltipModule,
    NbTabsetModule,
    NbSelectModule,
    NbBadgeModule,
    NbToggleModule,
    NbDialogModule.forChild(),
    NbAlertModule
  ],
  declarations: [
    UserListComponent,
    UserDetailComponent,
    UserProfileComponent
  ]
})
export class UsersModule { }