// src/app/@core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AzureAuthService } from '../services/azure-auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AzureAuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth header if token exists and request is to our API
    const token = this.authService.getAccessToken();
    const isApiRequest = request.url.includes('/api/') && 
                        (request.url.includes('identitypulse-backend') || 
                         request.url.includes('localhost:8000') ||
                         request.url.includes('localhost:4200/api/'));
    
    if (token && isApiRequest) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else if (error instanceof HttpErrorResponse && error.status === 403) {
          // Handle forbidden - user doesn't have permission
          this.router.navigate(['/login']);
          return throwError(error);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          
          const newToken = this.authService.getAccessToken();
          if (newToken) {
            return next.handle(this.addToken(request, newToken));
          } else {
            // If refresh failed, redirect to login
            this.router.navigate(['/login']);
            return throwError('Token refresh failed');
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.router.navigate(['/login']);
          return throwError(err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => {
          const newToken = this.authService.getAccessToken();
          if (newToken) {
            return next.handle(this.addToken(request, newToken));
          } else {
            return throwError('No token available');
          }
        })
      );
    }
  }
}