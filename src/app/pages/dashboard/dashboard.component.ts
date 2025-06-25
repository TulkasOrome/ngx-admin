import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { ElasticsearchService } from '../../@core/services/elasticsearch.service';
import { IdentityPulseService } from '../../@core/services/identitypulse.service';
import { interval } from 'rxjs';
import { environment } from '../../../environments/environment';

interface CardSettings {
  title: string;
  value: string;
  unitOfMeasurement: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  private alive = true;

  // Key metrics for IdentityPulse
  verificationCard: CardSettings = {
    title: 'Total Verifications',
    value: '0',
    unitOfMeasurement: 'today',
    iconClass: 'nb-checkmark-circle',
    type: 'primary',
  };
  
  matchRateCard: CardSettings = {
    title: 'Average Match Rate',
    value: '0',
    unitOfMeasurement: '%',
    iconClass: 'nb-bar-chart',
    type: 'success',
  };
  
  countriesCard: CardSettings = {
    title: 'Active Countries',
    value: '21',
    unitOfMeasurement: 'regions',
    iconClass: 'nb-location',
    type: 'info',
  };
  
  apiResponseCard: CardSettings = {
    title: 'Avg Response Time',
    value: '0',
    unitOfMeasurement: 'ms',
    iconClass: 'nb-gear',
    type: 'warning',
  };

  statusCards: CardSettings[];

  commonStatusCardsSet: CardSettings[] = [
    this.verificationCard,
    this.matchRateCard,
    this.countriesCard,
    this.apiResponseCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
    marketsoft: CardSettings[];
    identitypulse: CardSettings[];
    
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: this.commonStatusCardsSet,
    dark: this.commonStatusCardsSet,
    marketsoft: this.commonStatusCardsSet,
    identitypulse: this.commonStatusCardsSet,
  };

  constructor(
    private themeService: NbThemeService,
    private elasticsearchService: ElasticsearchService,
    private identityPulseService: IdentityPulseService
  ) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
      });
  }

  ngOnInit() {
    // Load initial metrics from localStorage
    this.loadStoredMetrics();
    
    // Update metrics immediately
    this.updateMetrics();
    
    // Update metrics every 30 seconds
    interval(30000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => this.updateMetrics());
      
    // Update real-time metrics every 5 seconds
    interval(5000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => this.updateRealtimeMetrics());
  }

  loadStoredMetrics() {
    // Load verification history to calculate metrics
    const historyStr = localStorage.getItem('verificationHistory');
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        
        // Calculate today's verifications
        const today = new Date().toDateString();
        const todaysVerifications = history.filter((v: any) => 
          new Date(v.timestamp).toDateString() === today
        );
        
        this.verificationCard.value = todaysVerifications.length.toString();
        
        // Calculate average match rate
        if (history.length > 0) {
          const avgMatch = history.reduce((sum: number, v: any) => sum + (v.matchScore || 0), 0) / history.length;
          this.matchRateCard.value = avgMatch.toFixed(1);
        }
      } catch (error) {
        console.error('Error loading stored metrics:', error);
      }
    }
  }

  updateRealtimeMetrics() {
    // Update from localStorage for real-time changes
    this.loadStoredMetrics();
  }

  updateMetrics() {
    // Test API response times for each active country
    const apiConfig = environment.identityPulseApi;
    const testRequests = [
      { country: 'AU', name: 'Australia' },
      { country: 'ID', name: 'Indonesia' },
      { country: 'MY', name: 'Malaysia' },
      { country: 'JP', name: 'Japan' }
    ];
    
    let totalResponseTime = 0;
    let successfulTests = 0;
    let completedTests = 0;
    
    testRequests.forEach(test => {
      const startTime = Date.now();
      const testData = {
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '19900101',
        Country: test.country,
        MatchStrictness: 'strict' as 'strict' | 'normal' | 'loose'
      };
      
      this.identityPulseService.verifyIdentity(testData).subscribe(
        (response) => {
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          successfulTests++;
          completedTests++;
          
          if (completedTests === testRequests.length) {
            this.finalizeMetrics(successfulTests, totalResponseTime);
          }
        },
        (error) => {
          completedTests++;
          console.warn(`API test failed for ${test.name}:`, error);
          
          if (completedTests === testRequests.length) {
            this.finalizeMetrics(successfulTests, totalResponseTime);
          }
        }
      );
    });
  }

  private finalizeMetrics(onlineServers: number, totalResponseTime: number) {
    // Update active countries count - now always 21
    this.countriesCard.value = '21';
    
    // Update average response time
    if (onlineServers > 0) {
      const avgResponseTime = Math.round(totalResponseTime / onlineServers);
      this.apiResponseCard.value = avgResponseTime.toString();
    } else {
      this.apiResponseCard.value = '---';
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}