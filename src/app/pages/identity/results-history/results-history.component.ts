import { Component, OnInit } from '@angular/core';

interface VerificationEntry {
  id: number;
  timestamp: string;
  country: string;
  name: string;
  matchScore: number;
  confidenceLevel: string;
  matchTier: string;
  request: any;
  response: any;
}

@Component({
  selector: 'ngx-results-history',
  templateUrl: './results-history.component.html',
  styleUrls: ['./results-history.component.scss']
})
export class ResultsHistoryComponent implements OnInit {
  
  recentLookups: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadVerificationHistory();
  }

  loadVerificationHistory() {
    try {
      const historyStr = localStorage.getItem('verificationHistory');
      if (historyStr) {
        const history: VerificationEntry[] = JSON.parse(historyStr);
        
        // Transform for display
        this.recentLookups = history.map(entry => ({
          date: new Date(entry.timestamp).toLocaleString(),
          country: this.getCountryName(entry.country),
          score: entry.matchScore,
          status: this.getStatusFromConfidence(entry.confidenceLevel),
          fullData: entry
        }));
      } else {
        // If no history, load demo data
        this.loadDemoData();
      }
    } catch (error) {
      console.error('Error loading verification history:', error);
      // Fall back to demo data if there's an error
      this.loadDemoData();
    }
  }

  loadDemoData() {
    this.recentLookups = [
      { date: '2025-05-19 10:30', country: 'Australia', score: 95, status: 'Verified' },
      { date: '2025-05-19 09:15', country: 'Indonesia', score: 82, status: 'Verified' },
      { date: '2025-05-18 16:45', country: 'Malaysia', score: 60, status: 'Partial Match' },
      { date: '2025-05-18 14:20', country: 'Japan', score: 42, status: 'No Match' },
      { date: '2025-05-17 11:30', country: 'Australia', score: 88, status: 'Verified' },
      { date: '2025-05-17 09:45', country: 'Indonesia', score: 76, status: 'Verified' },
    ];
  }

  getCountryName(countryCode: string): string {
    const countryMap = {
      'AU': 'Australia',
      'ID': 'Indonesia',
      'MY': 'Malaysia',
      'JP': 'Japan'
    };
    return countryMap[countryCode] || countryCode;
  }

  getStatusFromConfidence(confidence: string): string {
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
        return 'Low Confidence';
      case 'NO_MATCH':
      default:
        return 'No Match';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Partial Match':
        return 'warning';
      case 'Low Confidence':
        return 'info';
      case 'No Match':
        return 'danger';
      default:
        return 'basic';
    }
  }

  viewDetails(lookup: any) {
    if (lookup.fullData) {
      console.log('Verification Details:', lookup.fullData);
      // You could open a modal or navigate to a detail view here
      // For now, just log to console
      alert(`Details for verification:\n\nRequest: ${JSON.stringify(lookup.fullData.request, null, 2)}\n\nResponse: ${JSON.stringify(lookup.fullData.response, null, 2)}`);
    }
  }

  downloadReport(lookup: any) {
    if (lookup.fullData) {
      const report = {
        timestamp: lookup.fullData.timestamp,
        request: lookup.fullData.request,
        response: lookup.fullData.response
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verification-${lookup.fullData.id}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }
}