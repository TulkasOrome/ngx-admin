import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AzureAuthService } from '../@core/services/azure-auth.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string;
  showPassword = false;
  isDevelopment = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AzureAuthService,
    private toastr: NbToastrService
  ) {
    console.log('LoginComponent constructor called'); // Debug log
    this.isDevelopment = window.location.hostname === 'localhost';
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/pages/dashboard']);
    }
  }

  ngOnInit() {
    console.log('LoginComponent ngOnInit called'); // Debug log
    
    // Hide the spinner once component loads
    const spinnerElement = document.getElementById('nb-global-spinner');
    if (spinnerElement) {
      spinnerElement.style.display = 'none';
    }
    
    this.loginForm = this.formBuilder.group({
      email: ['admin@identitypulse.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required],
      rememberMe: [true]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/pages/dashboard';
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login form submitted'); // Debug log
    
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    if (this.isDevelopment) {
      // Development mode - use simple auth
      this.authService.devLogin(this.email.value, this.password.value)
        .subscribe(
          success => {
            if (success) {
              this.toastr.success('Welcome to IdentityPulse!', 'Login Successful');
              this.router.navigate([this.returnUrl]);
            } else {
              this.toastr.danger('Invalid email or password', 'Login Failed');
              this.loading = false;
            }
          },
          error => {
            this.toastr.danger('Invalid email or password', 'Login Failed');
            this.loading = false;
          }
        );
    } else {
      // Production - redirect to Azure auth
      this.loginWithProvider('github');
    }
  }

  loginWithProvider(provider: 'github' | 'aad' | 'google') {
    this.authService.login(provider);
  }
}