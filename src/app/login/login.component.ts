import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SimpleAuthService } from '../simple-auth.service';
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

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: SimpleAuthService,
    private toastr: NbToastrService
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/pages/dashboard']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['admin@identitypulse.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required],
      rememberMe: [true]
    });

    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/pages/dashboard';
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.email.value, this.password.value)
      .subscribe(
        success => {
          if (success) {
            this.toastr.success('Welcome to IdentityPulse!', 'Login Successful');
            this.router.navigate([this.returnUrl]);
          }
        },
        error => {
          this.toastr.danger('Invalid email or password', 'Login Failed');
          this.loading = false;
        }
      );
  }
}