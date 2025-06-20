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
    console.log('LoginComponent constructor called');
    this.isDevelopment = this.authService.isDevelopment();
    
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/pages/dashboard']);
    }
  }

  ngOnInit() {
    console.log('LoginComponent ngOnInit called');
    
    // Hide the spinner once component loads
    setTimeout(() => {
      const spinnerElement = document.getElementById('nb-global-spinner');
      if (spinnerElement) {
        spinnerElement.style.display = 'none';
      }
    }, 0);
    
    this.loginForm = this.formBuilder.group({
      email: ['admin@identitypulse.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required],
      rememberMe: [true]
    });

    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/pages/dashboard';
    
    // Check if there's a stored redirect URL
    const storedRedirectUrl = localStorage.getItem('redirectUrl');
    if (storedRedirectUrl) {
      this.returnUrl = storedRedirectUrl;
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login form submitted');
    
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key).markAsTouched();
      });
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
              
              // Clear any stored redirect URL
              localStorage.removeItem('redirectUrl');
              
              // Navigate to return URL
              this.router.navigate([this.returnUrl]);
            } else {
              this.toastr.danger('Invalid email or password', 'Login Failed');
              this.loading = false;
            }
          },
          error => {
            console.error('Login error:', error);
            this.toastr.danger('An error occurred during login', 'Login Failed');
            this.loading = false;
          }
        );
    } else {
      // Production - redirect to Azure auth
      // For now, show a message that social login is required
      this.toastr.info('Please use one of the social login options below', 'Social Login Required');
      this.loading = false;
    }
  }

  loginWithProvider(provider: 'github' | 'aad' | 'google' | 'twitter') {
    console.log(`Login with ${provider} clicked`);
    
    // Store the return URL before redirecting
    if (this.returnUrl && this.returnUrl !== '/pages/dashboard') {
      localStorage.setItem('redirectUrl', this.returnUrl);
    }
    
    this.authService.login(provider);
  }
}