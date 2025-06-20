import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'ngx-auth-debug',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Authentication Debug Info</h5>
      </nb-card-header>
      <nb-card-body>
        <h6>Current URL</h6>
        <pre>{{ currentUrl }}</pre>
        
        <h6>Auth Endpoint Response</h6>
        <pre>{{ authResponse | json }}</pre>
        
        <h6>Local Storage</h6>
        <pre>{{ localStorageData | json }}</pre>
        
        <button nbButton (click)="checkAuth()">Refresh Auth Check</button>
        <button nbButton status="danger" (click)="clearAuth()">Clear Auth</button>
      </nb-card-body>
    </nb-card>
  `
})
export class AuthDebugComponent implements OnInit {
  currentUrl = window.location.href;
  authResponse: any;
  localStorageData: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkAuth();
    this.checkLocalStorage();
  }

  checkAuth() {
    this.http.get('/.auth/me').subscribe(
      response => {
        this.authResponse = response;
        console.log('Auth response:', response);
      },
      error => {
        this.authResponse = { error: error.message };
        console.error('Auth error:', error);
      }
    );
  }

  checkLocalStorage() {
    this.localStorageData = {
      currentUser: localStorage.getItem('currentUser'),
      redirectUrl: localStorage.getItem('redirectUrl')
    };
  }

  clearAuth() {
    localStorage.clear();
    window.location.href = '/.auth/logout';
  }
}