// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
  styles: [`
    :host {
      display: block;
      background: #010A26;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {

  constructor(
    private analytics: AnalyticsService, 
    private seoService: SeoService,
    private themeService: NbThemeService
  ) {
    // Force IdentityPulse dark theme
    this.themeService.changeTheme('identitypulse');
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
    
    // Add dark theme class to body
    document.body.classList.add('nb-theme-identitypulse');
    document.body.style.background = '#010A26';
  }
}