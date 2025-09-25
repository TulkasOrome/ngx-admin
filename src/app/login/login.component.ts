// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AzureAuthService } from '../@core/services/azure-auth.service';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../environments/environment';
import { finalize, delay } from 'rxjs/operators';

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
  isProduction = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AzureAuthService,
    private toastr: NbToastrService
  ) {
    console.log('LoginComponent constructor called');
    
    // Check environment
    this.isProduction = environment.production;
    this.isDevelopment = !this.isProduction;
    
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting to dashboard');
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
    
    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
    const email = this.email.value;
    const password = this.password.value;
    
    console.log('Attempting login for:', email);
    
    // Use the backend authentication service
    this.authService.login(email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        success => {
          console.log('Login result:', success);
          
          if (success) {
            this.toastr.success('Welcome to IdentityPulse!', 'Login Successful');
            
            // Clear any stored redirect URL
            localStorage.removeItem('redirectUrl');
            
            // Small delay to ensure everything is set up
            setTimeout(() => {
              console.log('Navigating to:', this.returnUrl);
              this.router.navigate([this.returnUrl]).then(
                () => console.log('Navigation successful'),
                (err) => console.error('Navigation failed:', err)
              );
            }, 100);
          } else {
            this.toastr.danger('Invalid email or password', 'Login Failed');
          }
        },
        error => {
          console.error('Login error:', error);
          this.toastr.danger('An error occurred during login', 'Login Failed');
          this.loading = false;
        }
      );
  }

  // Remove or disable social login methods since we're using database auth
  loginWithProvider(provider: string) {
    this.toastr.info('Social login is not available. Please use email and password.', 'Information');
  }
}