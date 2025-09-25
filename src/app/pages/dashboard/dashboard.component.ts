// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { interval } from 'rxjs';

declare const L: any;

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
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private alive = true;
  private map: any;
  
  // Status cards for lower section (keeping for compatibility)
  statusCards: CardSettings[] = [
    {
      title: 'Total Verifications',
      value: '0',
      unitOfMeasurement: 'today',
      iconClass: 'nb-checkmark-circle',
      type: 'primary',
    },
    {
      title: 'Average Match Rate',
      value: '0',
      unitOfMeasurement: '%',
      iconClass: 'nb-bar-chart',
      type: 'success',
    },
    {
      title: 'Active Countries',
      value: '21',
      unitOfMeasurement: 'regions',
      iconClass: 'nb-location',
      type: 'info',
    },
    {
      title: 'Avg Response Time',
      value: '0',
      unitOfMeasurement: 'ms',
      iconClass: 'nb-gear',
      type: 'warning',
    }
  ];

  // Data center locations
  dataCenters = [
    // Asia Pacific
    { name: 'Australia', coords: [-33.8688, 151.2093], status: 'online' },
    { name: 'Indonesia', coords: [-6.2088, 106.8456], status: 'online' },
    { name: 'Malaysia', coords: [3.1390, 101.6869], status: 'online' },
    { name: 'Japan', coords: [35.6762, 139.6503], status: 'online' },
    { name: 'Thailand', coords: [13.7563, 100.5018], status: 'online' },
    { name: 'Singapore', coords: [1.3521, 103.8198], status: 'online' },
    { name: 'Philippines', coords: [14.5995, 120.9842], status: 'online' },
    { name: 'Vietnam', coords: [10.8231, 106.6297], status: 'online' },
    { name: 'South Korea', coords: [37.5665, 126.9780], status: 'online' },
    { name: 'Hong Kong', coords: [22.3193, 114.1694], status: 'online' },
    { name: 'Bangladesh', coords: [23.8103, 90.4125], status: 'online' },
    { name: 'Sri Lanka', coords: [6.9271, 79.8612], status: 'online' },
    { name: 'New Zealand', coords: [-36.8485, 174.7633], status: 'online' },
    
    // Middle East & Africa
    { name: 'Saudi Arabia', coords: [24.7136, 46.6753], status: 'online' },
    { name: 'Turkey', coords: [41.0082, 28.9784], status: 'online' },
    { name: 'UAE', coords: [25.2048, 55.2708], status: 'online' },
    { name: 'Egypt', coords: [30.0444, 31.2357], status: 'online' },
    { name: 'South Africa', coords: [-26.2041, 28.0473], status: 'online' },
    
    // Americas
    { name: 'Canada', coords: [43.6532, -79.3832], status: 'online' },
    { name: 'Mexico', coords: [19.4326, -99.1332], status: 'online' },
    
    // Europe
    { name: 'France', coords: [48.8566, 2.3522], status: 'online' },
    { name: 'Czech Republic', coords: [50.0755, 14.4378], status: 'coming-soon' },
  ];

  constructor(
    private themeService: NbThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load metrics data
    this.loadMetrics();
    
    // Update metrics every 30 seconds
    interval(30000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        this.loadMetrics();
      });
  }

  ngAfterViewInit() {
    // Initialize map after view loads
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  initializeMap() {
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded, using fallback map');
      return;
    }

    try {
      // Initialize the map
      this.map = L.map('world-map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      // Add dark theme tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(this.map);

      // Add markers for data centers
      this.dataCenters.forEach(dc => {
        const color = dc.status === 'online' ? '#00D68F' : 
                     dc.status === 'coming-soon' ? '#FFAA00' : '#FF3D71';
        
        const marker = L.circleMarker(dc.coords, {
          radius: 6,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map);
        
        // Add popup
        marker.bindPopup(`
          <div style="color: #000; font-family: Inter, sans-serif;">
            <strong>${dc.name}</strong><br>
            Status: ${dc.status}
          </div>
        `);
      });

      // Fit map to show all markers
      const bounds = L.latLngBounds(this.dataCenters.map(dc => dc.coords));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  loadMetrics() {
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
        
        this.statusCards[0].value = todaysVerifications.length.toString();
        
        // Calculate average match rate
        if (history.length > 0) {
          const avgMatch = history.reduce((sum: number, v: any) => sum + (v.matchScore || 0), 0) / history.length;
          this.statusCards[1].value = avgMatch.toFixed(1);
        }
        
        // Set average response time
        this.statusCards[3].value = '403';
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    }
  }

  contactUs() {
    // Open contact form or navigate to contact page
    window.open('https://identitypulse.com/contact', '_blank');
  }

  ngOnDestroy() {
    this.alive = false;
    if (this.map) {
      this.map.remove();
    }
  }
}