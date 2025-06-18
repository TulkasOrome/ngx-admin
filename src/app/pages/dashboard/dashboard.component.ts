import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { ElasticsearchService } from '../../@core/services/elasticsearch.service';
import { interval } from 'rxjs';

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
    value: '0',
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
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: this.commonStatusCardsSet,
    dark: this.commonStatusCardsSet,
    marketsoft: this.commonStatusCardsSet,
  };

  constructor(
    private themeService: NbThemeService,
    private elasticsearchService: ElasticsearchService
  ) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
      });
  }

  ngOnInit() {
    // Update metrics immediately
    this.updateMetrics();
    
    // Update metrics every 30 seconds
    interval(30000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => this.updateMetrics());
      
    // Simulate real-time verification updates
    this.simulateVerifications();
  }

  updateMetrics() {
    // Check all servers health and calculate average response time
    this.elasticsearchService.checkAllServersHealth().subscribe(
      (healthMap) => {
        let totalResponseTime = 0;
        let onlineServers = 0;
        
        healthMap.forEach((health) => {
          if (health.status === 'online' && health.responseTime > 0) {
            totalResponseTime += health.responseTime;
            onlineServers++;
          }
        });
        
        // Update active countries count
        this.countriesCard.value = onlineServers.toString();
        
        // Update average response time
        if (onlineServers > 0) {
          const avgResponseTime = Math.round(totalResponseTime / onlineServers);
          this.apiResponseCard.value = avgResponseTime.toString();
        }
      }
    );
  }

  simulateVerifications() {
    // Simulate verification count increasing
    let verificationCount = parseInt(localStorage.getItem('verificationCount') || '1247', 10);
    let totalMatchScore = parseFloat(localStorage.getItem('totalMatchScore') || '87.3');
    let verificationsSinceLastAvg = parseInt(localStorage.getItem('verificationsSinceLastAvg') || '1', 10);
    
    interval(5000 + Math.random() * 10000) // Random interval between 5-15 seconds
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        // Increment verification count
        verificationCount++;
        this.verificationCard.value = verificationCount.toString();
        
        // Update average match rate with realistic variation
        const newMatchScore = 75 + Math.random() * 20; // Between 75-95%
        totalMatchScore = ((totalMatchScore * verificationsSinceLastAvg) + newMatchScore) / (verificationsSinceLastAvg + 1);
        verificationsSinceLastAvg++;
        
        this.matchRateCard.value = totalMatchScore.toFixed(1);
        
        // Store in localStorage for persistence
        localStorage.setItem('verificationCount', verificationCount.toString());
        localStorage.setItem('totalMatchScore', totalMatchScore.toString());
        localStorage.setItem('verificationsSinceLastAvg', verificationsSinceLastAvg.toString());
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}