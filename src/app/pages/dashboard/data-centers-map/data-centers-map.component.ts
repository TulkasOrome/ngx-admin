import { Component, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { ElasticsearchService, ServerHealthResponse } from '../../../@core/services/elasticsearch.service';
import { interval, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

declare const L: any;

interface DataCenter {
  name: string;
  country: string;
  city: string;
  coordinates: [number, number];
  status: 'online' | 'coming-soon' | 'offline' | 'maintenance';
  databases: number;
  responseTime: number;
  coverage: string;
  adultPopulationCoverage: string;
  isElasticsearch?: boolean;
}

@Component({
  selector: 'ngx-data-centers-map',
  styleUrls: ['./data-centers-map.component.scss'],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="header-container">
          <h6>Global Identity Verification Coverage</h6>
          <div class="legend">
            <span class="legend-item">
              <span class="dot online"></span>
              Online
            </span>
            <span class="legend-item">
              <span class="dot maintenance"></span>
              Maintenance
            </span>
            <span class="legend-item">
              <span class="dot offline"></span>
              Offline
            </span>
          </div>
        </div>
      </nb-card-header>
      <nb-card-body>
        <div id="map" class="map-container"></div>
        <div class="map-stats">
          <div class="stat">
            <nb-icon icon="globe-2-outline" pack="eva"></nb-icon>
            <span>{{ getCountryCount() }} Countries</span>
          </div>
          <div class="stat">
            <nb-icon icon="hard-drive-outline" pack="eva"></nb-icon>
            <span>{{ getTotalDatabases() }} Databases</span>
          </div>
          <div class="stat">
            <nb-icon icon="activity-outline" pack="eva"></nb-icon>
            <span>{{ getOnlineCount() }} Online</span>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
})
export class DataCentersMapComponent implements AfterViewInit, OnInit, OnDestroy {

  private alive = true;
  private map: any;
  private markers: Map<string, any> = new Map();

  dataCenters: DataCenter[] = [
    // All 21 countries - all set to online
    {
      name: 'Australia DC',
      country: 'Australia',
      city: 'Sydney',
      coordinates: [-33.8688, 151.2093],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '11.5M',
      adultPopulationCoverage: '75%',
      isElasticsearch: true
    },
    {
      name: 'Indonesia DC',
      country: 'Indonesia',
      city: 'Jakarta',
      coordinates: [-6.2088, 106.8456],
      status: 'online',
      databases: 4,
      responseTime: 0,
      coverage: '180M+',
      adultPopulationCoverage: '82%',
      isElasticsearch: true
    },
    {
      name: 'Malaysia DC',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      coordinates: [3.1390, 101.6869],
      status: 'online',
      databases: 2,
      responseTime: 0,
      coverage: '24M',
      adultPopulationCoverage: '85%',
      isElasticsearch: true
    },
    {
      name: 'Japan DC',
      country: 'Japan',
      city: 'Tokyo',
      coordinates: [35.6762, 139.6503],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '58M',
      adultPopulationCoverage: '88%',
      isElasticsearch: true
    },
    {
      name: 'Thailand DC',
      country: 'Thailand',
      city: 'Bangkok',
      coordinates: [13.7563, 100.5018],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '37M',
      adultPopulationCoverage: '78%'
    },
    {
      name: 'France DC',
      country: 'France',
      city: 'Paris',
      coordinates: [48.8566, 2.3522],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '33M',
      adultPopulationCoverage: '84%'
    },
    {
      name: 'South Africa DC',
      country: 'South Africa',
      city: 'Johannesburg',
      coordinates: [-26.2041, 28.0473],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '29M',
      adultPopulationCoverage: '78%'
    },
    {
      name: 'Canada DC',
      country: 'Canada',
      city: 'Toronto',
      coordinates: [43.6532, -79.3832],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '19M',
      adultPopulationCoverage: '87%'
    },
    {
      name: 'Mexico DC',
      country: 'Mexico',
      city: 'Mexico City',
      coordinates: [19.4326, -99.1332],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '64M',
      adultPopulationCoverage: '76%'
    },
    {
      name: 'Singapore DC',
      country: 'Singapore',
      city: 'Singapore',
      coordinates: [1.3521, 103.8198],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '2.8M',
      adultPopulationCoverage: '90%'
    },
    {
      name: 'Philippines DC',
      country: 'Philippines',
      city: 'Manila',
      coordinates: [14.5995, 120.9842],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '55M',
      adultPopulationCoverage: '75%'
    },
    {
      name: 'Vietnam DC',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      coordinates: [10.8231, 106.6297],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '48M',
      adultPopulationCoverage: '79%'
    },
    {
      name: 'Egypt DC',
      country: 'Egypt',
      city: 'Cairo',
      coordinates: [30.0444, 31.2357],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '51M',
      adultPopulationCoverage: '74%'
    },
    {
      name: 'UAE DC',
      country: 'UAE',
      city: 'Dubai',
      coordinates: [25.2048, 55.2708],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '4.8M',
      adultPopulationCoverage: '85%'
    },
    {
      name: 'South Korea DC',
      country: 'South Korea',
      city: 'Seoul',
      coordinates: [37.5665, 126.9780],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '26M',
      adultPopulationCoverage: '86%'
    },
    {
      name: 'Hong Kong DC',
      country: 'Hong Kong',
      city: 'Hong Kong',
      coordinates: [22.3193, 114.1694],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '3.8M',
      adultPopulationCoverage: '92%'
    },
    {
      name: 'Bangladesh DC',
      country: 'Bangladesh',
      city: 'Dhaka',
      coordinates: [23.8103, 90.4125],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '82M',
      adultPopulationCoverage: '72%'
    },
    {
      name: 'Sri Lanka DC',
      country: 'Sri Lanka',
      city: 'Colombo',
      coordinates: [6.9271, 79.8612],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '11M',
      adultPopulationCoverage: '76%'
    },
    {
      name: 'Turkey DC',
      country: 'Turkey',
      city: 'Istanbul',
      coordinates: [41.0082, 28.9784],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '42M',
      adultPopulationCoverage: '82%'
    },
    {
      name: 'Saudi Arabia DC',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      coordinates: [24.7136, 46.6753],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '17M',
      adultPopulationCoverage: '80%'
    },
    {
      name: 'New Zealand DC',
      country: 'New Zealand',
      city: 'Auckland',
      coordinates: [-36.8485, 174.7633],
      status: 'online',
      databases: 3,
      responseTime: 0,
      coverage: '2.4M',
      adultPopulationCoverage: '88%'
    }
  ];

  constructor(
    private theme: NbThemeService,
    private router: Router,
    private elasticsearchService: ElasticsearchService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Check server health immediately
    this.checkServerHealth();
    
    // Check server health every 30 seconds
    interval(30000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => this.checkServerHealth());
  }

  ngAfterViewInit() {
    // Wait for the view to be fully initialized
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  checkServerHealth() {
    const apiConfig = environment.identityPulseApi;
    const isDevelopment = !environment.production;
    const baseUrl = isDevelopment ? '' : apiConfig.baseUrl;
    
    const testData = {
      AU: {
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '19900101',
        Country: 'AU',
        MatchStrictness: 'normal'
      },
      ID: {
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '19900101',
        Country: 'ID',
        MatchStrictness: 'normal'
      },
      MY: {
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '19900101',
        Country: 'MY',
        MatchStrictness: 'normal'
      },
      JP: {
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '19900101',
        Country: 'JP',
        MatchStrictness: 'normal'
      }
    };

    // Test each region
    this.dataCenters.forEach(dc => {
      if (dc.isElasticsearch) {
        const countryCode = this.getCountryCode(dc.country);
        const apiKey = this.getApiKeyForCountry(countryCode);
        
        // Make a lightweight test call to check if the API is responding
        const url = `${baseUrl}${apiConfig.endpoint}?code=${apiConfig.functionCode}`;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        });

        const startTime = Date.now();
        
        this.http.post(url, testData[countryCode], { headers })
          .pipe(
            timeout(5000),
            catchError(() => of({ error: true }))
          )
          .subscribe(response => {
            const responseTime = Date.now() - startTime;
            
            if (!response['error']) {
              dc.status = 'online';
              dc.responseTime = responseTime;
            } else {
              dc.status = 'offline';
              dc.responseTime = 0;
            }
            
            // Update marker if map is initialized
            if (this.map && this.markers.has(dc.name)) {
              const marker = this.markers.get(dc.name);
              const icon = this.createCustomIcon(dc.status);
              marker.setIcon(icon);
              
              // Update popup content
              marker.setPopupContent(this.createPopupContent(dc));
            }
          });
      }
    });
  }

  private getCountryCode(country: string): string {
    const countryMap = {
      'Australia': 'AU',
      'Indonesia': 'ID',
      'Malaysia': 'MY',
      'Japan': 'JP'
    };
    return countryMap[country] || 'AU';
  }

  private getApiKeyForCountry(countryCode: string): string {
    const apiConfig = environment.identityPulseApi;
    const keyMap = {
      'AU': apiConfig.apiKeys.australia,
      'ID': apiConfig.apiKeys.indonesia,
      'MY': apiConfig.apiKeys.malaysia,
      'JP': apiConfig.apiKeys.japan
    };
    return keyMap[countryCode] || apiConfig.apiKeys.multiRegion;
  }

  initMap() {
    // Initialize the map centered on global view
    this.map = L.map('map', {
      center: [20, 50],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: false
    });

    // Add tile layer with a professional style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      noWrap: true
    }).addTo(this.map);

    // Add markers for each data center
    this.dataCenters.forEach(dc => {
      const icon = this.createCustomIcon(dc.status);
      
      const marker = L.marker(dc.coordinates, { icon })
        .addTo(this.map)
        .bindPopup(this.createPopupContent(dc));

      // Store marker reference
      this.markers.set(dc.name, marker);

      // Add click event to navigate to identity lookup
      marker.on('click', () => {
        if (dc.status === 'online' || dc.status === 'maintenance') {
          setTimeout(() => {
            this.router.navigate(['/pages/identity/manual-lookup'], {
              queryParams: { country: dc.country.toLowerCase() }
            });
          }, 1000);
        }
      });
    });

    // Fit map to show all markers
    const group = new L.featureGroup(this.dataCenters.map(dc => L.marker(dc.coordinates)));
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  createCustomIcon(status: string) {
    const colors = {
      online: '#00d68f',
      'coming-soon': '#ffaa00',
      offline: '#ff3d71',
      maintenance: '#ffaa00'
    };

    const html = `
      <div style="
        background-color: ${colors[status] || colors['offline']};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  createPopupContent(dc: DataCenter): string {
    const statusColors = {
      online: '#00d68f',
      'coming-soon': '#ffaa00',
      offline: '#ff3d71',
      maintenance: '#ffaa00'
    };

    const statusText = dc.status === 'coming-soon' ? 'Coming Soon' : 
                      dc.status === 'maintenance' ? 'Maintenance' : dc.status;

    return `
      <div style="padding: 10px; min-width: 200px;">
        <h6 style="margin: 0 0 10px 0; font-weight: 600;">${dc.country}</h6>
        <div style="font-size: 14px; line-height: 1.6;">
          <div><strong>Status:</strong> <span style="color: ${statusColors[dc.status] || statusColors['offline']}; font-weight: 600;">${statusText}</span></div>
          <div><strong>Coverage:</strong> ${dc.coverage}</div>
          ${dc.adultPopulationCoverage !== 'TBD' ? `<div><strong>Adult Population:</strong> ${dc.adultPopulationCoverage}</div>` : ''}
          ${dc.databases > 0 ? `<div><strong>Databases:</strong> ${dc.databases}</div>` : ''}
          ${dc.responseTime > 0 ? `<div><strong>Response Time:</strong> ${dc.responseTime}ms</div>` : ''}
          ${dc.isElasticsearch ? `<div><strong>Server Type:</strong> Elasticsearch</div>` : ''}
        </div>
        ${(dc.status === 'online' || dc.status === 'maintenance') ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e4e9f2; text-align: center;">
            <span style="color: #0095ff; font-size: 12px; cursor: pointer;">
              <strong>Click to query this region →</strong>
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  getTotalDatabases(): number {
    return this.dataCenters.reduce((sum, dc) => sum + dc.databases, 0);
  }

  getOnlineCount(): number {
    return this.dataCenters.filter(dc => dc.status === 'online').length;
  }

  getCountryCount(): number {
    // Get unique countries
    const uniqueCountries = new Set(this.dataCenters.map(dc => dc.country));
    return uniqueCountries.size;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online':
        return '#00d68f';
      case 'coming-soon':
        return '#ffaa00';
      case 'offline':
        return '#ff3d71';
      case 'maintenance':
        return '#ffaa00';
      default:
        return '#8f9bb3';
    }
  }

  ngOnDestroy() {
    this.alive = false;
    if (this.map) {
      this.map.remove();
    }
  }
}