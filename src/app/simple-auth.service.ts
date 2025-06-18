import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class SimpleAuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<boolean> {
    // Simple mock authentication - accept any email/password
    // In production, this would call an API
    return new Observable(observer => {
      setTimeout(() => {
        // Create mock user
        const user: User = {
          email: email,
          name: email.split('@')[0],
          role: 'user'
        };
        
        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        
        observer.next(true);
        observer.complete();
      }, 1000); // Simulate network delay
    });
  }

  logout() {
    // Remove user from localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}