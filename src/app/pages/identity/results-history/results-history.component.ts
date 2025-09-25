// src/app/pages/identity/results-history/results-history.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface VerificationEntry {
  id: number;
  timestamp: string;
  country: string;
  name: string;
  matchScore: number;
  confidenceLevel: string;
  matchTier: string;
  status: 'Verified' | 'Partial Match' | 'No Match';
  request: any;
  response: any;
}

@Component({
  selector: 'ngx-results-history',
  template: `
    <div class="results-history-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Past Searches</h1>
      </div>

      <!-- Stats Summary Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">
            <nb-icon icon="checkmark-circle-outline" pack="eva"></nb-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">13</div>
            <div class="stat-label">Total Verifications Today</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <nb-icon icon="percent-outline" pack="eva"></nb-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">67%</div>
            <div class="stat-label">Average Match Rate</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <nb-icon icon="clock-outline" pack="eva"></nb-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">289ms</div>
            <div class="stat-label">Average Response Time</div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th>DATE/TIME</th>
              <th>COUNTRY</th>
              <th>MATCH SCORE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of recentSearches">
              <td class="date-column">{{ entry.date }}</td>
              <td class="country-column">{{ entry.country }}</td>
              <td class="score-column">
                <div class="match-score-wrapper">
                  <div class="score-box" [style.background-color]="getScoreColor(entry.score)">
                    {{ entry.score }}%
                  </div>
                </div>
              </td>
              <td class="status-column">
                <div class="status-badge" [class.verified]="entry.status === 'Verified'" 
                     [class.partial]="entry.status === 'Partial Match'"
                     [class.no-match]="entry.status === 'No Match'">
                  {{ entry.status }}
                </div>
              </td>
              <td class="actions-column">
                <button class="action-button view" (click)="viewDetails(entry)">
                  <nb-icon icon="eye-outline" pack="eva"></nb-icon>
                </button>
                <button class="action-button download" (click)="downloadReport(entry)">
                  <nb-icon icon="download-outline" pack="eva"></nb-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./results-history.component.scss']
})
export class ResultsHistoryComponent implements OnInit {
  
  recentSearches: any[] = [];
  totalVerifications: number = 0;
  averageMatchRate: number = 0;
  averageResponseTime: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadVerificationHistory();
    this.calculateStats();
  }

  loadVerificationHistory() {
    try {
      const historyStr = localStorage.getItem('verificationHistory');
      if (historyStr) {
        const history: VerificationEntry[] = JSON.parse(historyStr);
        
        // Transform for display - sort by date descending
        this.recentSearches = history
          .map(entry => ({
            id: entry.id,
            date: new Date(entry.timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            country: this.getCountryName(entry.country),
            score: entry.matchScore,
            status: this.getStatusFromConfidence(entry.confidenceLevel),
            fullData: entry
          }))
          .sort((a, b) => b.id - a.id); // Sort by ID descending (newest first)
      } else {
        // Load demo data if no history
        this.loadDemoData();
      }
    } catch (error) {
      console.error('Error loading verification history:', error);
      this.loadDemoData();
    }
  }

  loadDemoData() {
    const now = new Date();
    const demoData = [
      { 
        date: this.formatDate(new Date(now.getTime() - 2 * 60 * 60 * 1000)), 
        country: 'Australia', 
        score: 95, 
        status: 'Verified' as const 
      },
      { 
        date: this.formatDate(new Date(now.getTime() - 3 * 60 * 60 * 1000)), 
        country: 'Indonesia', 
        score: 82, 
        status: 'Verified' as const 
      },
      { 
        date: this.formatDate(new Date(now.getTime() - 5 * 60 * 60 * 1000)), 
        country: 'Malaysia', 
        score: 60, 
        status: 'Partial Match' as const 
      },
      { 
        date: this.formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)), 
        country: 'Japan', 
        score: 42, 
        status: 'No Match' as const 
      },
      { 
        date: this.formatDate(new Date(now.getTime() - 25 * 60 * 60 * 1000)), 
        country: 'Australia', 
        score: 88, 
        status: 'Verified' as const 
      },
      { 
        date: this.formatDate(new Date(now.getTime() - 26 * 60 * 60 * 1000)), 
        country: 'Indonesia', 
        score: 76, 
        status: 'Verified' as const 
      }
    ];
    
    this.recentSearches = demoData.map((item, index) => ({
      ...item,
      id: demoData.length - index,
      fullData: {
        id: demoData.length - index,
        timestamp: item.date,
        country: item.country,
        matchScore: item.score,
        confidenceLevel: this.getConfidenceFromScore(item.score),
        status: item.status
      }
    }));
  }

  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateStats() {
    if (this.recentSearches.length > 0) {
      // Today's verifications
      const today = new Date().toDateString();
      this.totalVerifications = this.recentSearches.filter(entry => {
        const entryDate = new Date(entry.date).toDateString();
        return entryDate === today;
      }).length || 13; // Default to 13 if no entries today

      // Average match rate
      this.averageMatchRate = Math.round(
        this.recentSearches.reduce((sum, entry) => sum + entry.score, 0) / this.recentSearches.length
      );

      // Average response time (simulated)
      this.averageResponseTime = 289;
    }
  }

  getCountryName(countryCode: string): string {
    const countryMap = {
      'AU': 'Australia',
      'ID': 'Indonesia', 
      'MY': 'Malaysia',
      'JP': 'Japan',
      'TH': 'Thailand',
      'PH': 'Philippines',
      'VN': 'Vietnam',
      'NZ': 'New Zealand',
      'SA': 'Saudi Arabia',
      'AE': 'UAE',
      'TR': 'Turkey',
      'EG': 'Egypt',
      'QA': 'Qatar',
      'ZA': 'South Africa',
      'MA': 'Morocco',
      'CZ': 'Czech Republic',
      'FR': 'France',
      'CA': 'Canada',
      'MX': 'Mexico',
      'PK': 'Pakistan'
    };
    return countryMap[countryCode] || countryCode;
  }

  getStatusFromConfidence(confidence: string): 'Verified' | 'Partial Match' | 'No Match' {
    switch (confidence) {
      case 'VERY_HIGH':
      case 'HIGH':
      case 'CONFIRMED_MATCH':
        return 'Verified';
      case 'MEDIUM':
      case 'POSSIBLE_MATCH':
        return 'Partial Match';
      case 'LOW':
      case 'VERY_LOW':
      case 'NO_MATCH':
      default:
        return 'No Match';
    }
  }

  getConfidenceFromScore(score: number): string {
    if (score >= 80) return 'HIGH';
    if (score >= 60) return 'MEDIUM';
    if (score >= 40) return 'LOW';
    return 'NO_MATCH';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#00D68F'; // Green
    if (score >= 60) return '#FFAA00'; // Orange
    if (score >= 40) return '#FF3D71'; // Red
    return '#FF3D71'; // Red for very low scores
  }

  viewDetails(entry: any) {
    if (entry.fullData) {
      console.log('Verification Details:', entry.fullData);
      // Navigate to manual lookup with pre-filled data
      this.router.navigate(['/pages/identity/manual-lookup'], {
        queryParams: { 
          viewMode: 'details',
          entryId: entry.id 
        }
      });
    }
  }

  downloadReport(entry: any) {
    if (entry.fullData) {
      const report = {
        verificationId: entry.id,
        timestamp: entry.date,
        country: entry.country,
        matchScore: entry.score,
        status: entry.status,
        details: entry.fullData
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verification-${entry.id}-report.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }
}