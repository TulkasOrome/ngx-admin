import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { NbThemeService } from '@nebular/theme';
import { interval } from 'rxjs';

interface Verification {
  id: string;
  country: string;
  timestamp: Date;
  matchScore: number;
  status: 'verified' | 'partial' | 'failed';
  type: string;
  responseTime?: number;
}

@Component({
  selector: 'ngx-recent-verifications',
  styleUrls: ['./recent-verifications.component.scss'],
  templateUrl: './recent-verifications.component.html',
})
export class RecentVerificationsComponent implements OnInit, OnDestroy {

  private alive = true;
  private verificationIdCounter = 1000;

  verifications: Verification[] = [];

  verificationTypes = [
    'Identity Check',
    'Full KYC',
    'Address Verification',
    'Document Verify',
    'Phone Validation',
    'Email Check'
  ];

  countries = ['Australia', 'Indonesia', 'Japan', 'Malaysia'];

  constructor(private themeService: NbThemeService) {}

  ngOnInit() {
    // Load initial verifications from localStorage or generate default ones
    this.loadStoredVerifications();
    
    // Simulate new verifications coming in
    this.simulateNewVerifications();
  }

  loadStoredVerifications() {
    const stored = localStorage.getItem('recentVerifications');
    if (stored) {
      this.verifications = JSON.parse(stored).map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
    } else {
      // Generate initial verifications
      this.generateInitialVerifications();
    }
  }

  generateInitialVerifications() {
    const now = Date.now();
    const verificationData = [
      { offset: 120000, score: 95, status: 'verified' },
      { offset: 300000, score: 78, status: 'partial' },
      { offset: 600000, score: 92, status: 'verified' },
      { offset: 900000, score: 45, status: 'failed' },
      { offset: 1200000, score: 88, status: 'verified' },
      { offset: 1500000, score: 91, status: 'verified' }
    ];

    this.verifications = verificationData.map((data, index) => ({
      id: `VER-2024-${(this.verificationIdCounter++).toString().padStart(3, '0')}`,
      country: this.countries[index % this.countries.length],
      timestamp: new Date(now - data.offset),
      matchScore: data.score,
      status: data.status as 'verified' | 'partial' | 'failed',
      type: this.verificationTypes[index % this.verificationTypes.length],
      responseTime: 200 + Math.random() * 300
    }));
  }

  simulateNewVerifications() {
    // Add a new verification every 10-30 seconds
    interval(10000 + Math.random() * 20000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        const matchScore = Math.floor(Math.random() * 100);
        let status: 'verified' | 'partial' | 'failed';
        
        if (matchScore >= 80) {
          status = 'verified';
        } else if (matchScore >= 60) {
          status = 'partial';
        } else {
          status = 'failed';
        }

        const newVerification: Verification = {
          id: `VER-2024-${(this.verificationIdCounter++).toString().padStart(3, '0')}`,
          country: this.countries[Math.floor(Math.random() * this.countries.length)],
          timestamp: new Date(),
          matchScore,
          status,
          type: this.verificationTypes[Math.floor(Math.random() * this.verificationTypes.length)],
          responseTime: 200 + Math.random() * 300
        };

        // Add to beginning of array
        this.verifications.unshift(newVerification);
        
        // Keep only last 20 verifications
        if (this.verifications.length > 20) {
          this.verifications = this.verifications.slice(0, 20);
        }
        
        // Store in localStorage
        this.storeVerifications();
      });
  }

  storeVerifications() {
    localStorage.setItem('recentVerifications', JSON.stringify(this.verifications));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'verified':
        return 'checkmark-circle-2-outline';
      case 'partial':
        return 'alert-triangle-outline';
      case 'failed':
        return 'close-circle-outline';
      default:
        return 'minus-circle-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'verified':
        return 'success';
      case 'partial':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'basic';
    }
  }

  getCountryFlag(country: string): string {
    const flags = {
      'Australia': '🇦🇺',
      'Indonesia': '🇮🇩',
      'Malaysia': '🇲🇾',
      'Japan': '🇯🇵'
    };
    return flags[country] || '🌏';
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  ngOnDestroy() {
    this.alive = false;
  }
}