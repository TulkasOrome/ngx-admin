// src/app/login/login.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { 
  NbCardModule, 
  NbInputModule, 
  NbButtonModule, 
  NbCheckboxModule,
  NbAlertModule,
  NbIconModule,
  NbSpinnerModule,
  NbLayoutModule,  // Required for nb-layout
  NbToastrModule   // For toast notifications
} from '@nebular/theme';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginComponent,
      }
    ]),
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    NbAlertModule,
    NbIconModule,
    NbSpinnerModule,
    NbLayoutModule,  // Required for nb-layout wrapper
    NbToastrModule   // For toast notifications
  ],
  declarations: [LoginComponent],
})
export class LoginModule { }