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
  NbLayoutModule,  // Add this
  NbToastrModule   // Add this
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
    NbLayoutModule,  // Add this
    NbToastrModule   // Add this
  ],
  declarations: [LoginComponent],
})
export class LoginModule { }