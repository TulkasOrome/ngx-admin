// src/app/pages/dashboard/identity-verification/identity-verification.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'ngx-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss'],
})
export class IdentityVerificationComponent implements OnInit, OnDestroy {
  private alive = true;
  
  // Form data
  formData = {
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
  };

  // Match results when verification is performed
  matchResult = {
    confidence: 87,
    fieldMatches: {
      name: { confidence: 92, value: 'John Smith' },
      dob: { confidence: 100, value: '1985-07-15' },
      address: { confidence: 75, value: '123 Main St, Sydney NSW 2000' },
      email: { confidence: 90, value: 'john.smith@example.com' },
    },
    submitted: false,
  };

  // Country selection
  selectedCountry = 'aus';
  countries = [
    { id: 'aus', name: 'Australia', code: 'AU', available: true },
    { id: 'indo', name: 'Indonesia', code: 'ID', available: true },
    { id: 'malay', name: 'Malaysia', code: 'MY', available: true },
    { id: 'singapore', name: 'Singapore', code: 'SG', available: true },
    { id: 'japan', name: 'Japan', code: 'JP', available: true },
    { id: 'china', name: 'China', code: 'CN', available: false },
    { id: 'india', name: 'India', code: 'IN', available: false },
  ];

  constructor(private themeService: NbThemeService) {}

  ngOnInit() {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        // Theme-specific initializations can go here
      });
  }

  onSubmit() {
    // In a real application, this would call your API
    this.matchResult.submitted = true;
    
    // Here we'd normally process the API response
    // For now, we'll use our mock data
    console.log('Form submitted:', this.formData);
  }

  onCountrySelected(countryId: string) {
    this.selectedCountry = countryId;
    // In a real app, we might load country-specific validation rules here
  }

  ngOnDestroy() {
    this.alive = false;
  }
}