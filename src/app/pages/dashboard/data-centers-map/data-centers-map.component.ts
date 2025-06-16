import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';

declare const L: any;

interface DataCenter {
  name: string;
  country: string;
  city: string;
  coordinates: [number, number];
  status: 'online' | 'coming-soon' | 'offline';
  databases: number;
  responseTime: number;
  coverage: string;
  adultPopulationCoverage: string;
}

@Component({
  selector: 'ngx-data-centers-map',
  styleUrls: ['./data-centers-map.component.scss'],
  templateUrl: './data-centers-map.component.html',
})
export class DataCentersMapComponent implements AfterViewInit, OnDestroy {

  private alive = true;
  private map: any;

  dataCenters: DataCenter[] = [
    // Live countries (green)
    {
      name: 'Australia DC',
      country: 'Australia',
      city: 'Sydney',
      coordinates: [-33.8688, 151.2093],
      status: 'online',
      databases: 3,
      responseTime: 45,
      coverage: '11.5M',
      adultPopulationCoverage: '75%'
    },
    {
      name: 'Indonesia DC',
      country: 'Indonesia',
      city: 'Jakarta',
      coordinates: [-6.2088, 106.8456],
      status: 'online',
      databases: 4,
      responseTime: 78,
      coverage: '180M+',
      adultPopulationCoverage: '82%'
    },
    {
      name: 'Malaysia DC',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      coordinates: [3.1390, 101.6869],
      status: 'online',
      databases: 2,
      responseTime: 65,
      coverage: '24M',
      adultPopulationCoverage: '85%'
    },
    {
      name: 'Japan DC',
      country: 'Japan',
      city: 'Tokyo',
      coordinates: [35.6762, 139.6503],
      status: 'online',
      databases: 3,
      responseTime: 89,
      coverage: '58M',
      adultPopulationCoverage: '88%'
    },
    // Coming soon countries (orange)
    {
      name: 'France DC',
      country: 'France',
      city: 'Paris',
      coordinates: [48.8566, 2.3522],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'South Africa DC',
      country: 'South Africa',
      city: 'Johannesburg',
      coordinates: [-26.2041, 28.0473],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Canada DC',
      country: 'Canada',
      city: 'Toronto',
      coordinates: [43.6532, -79.3832],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Mexico DC',
      country: 'Mexico',
      city: 'Mexico City',
      coordinates: [19.4326, -99.1332],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Singapore DC',
      country: 'Singapore',
      city: 'Singapore',
      coordinates: [1.3521, 103.8198],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Philippines DC',
      country: 'Philippines',
      city: 'Manila',
      coordinates: [14.5995, 120.9842],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Vietnam DC',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      coordinates: [10.8231, 106.6297],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '79M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Egypt DC',
      country: 'Egypt',
      city: 'Cairo',
      coordinates: [30.0444, 31.2357],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'UAE DC',
      country: 'UAE',
      city: 'Dubai',
      coordinates: [25.2048, 55.2708],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '9M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'South Korea DC',
      country: 'South Korea',
      city: 'Seoul',
      coordinates: [37.5665, 126.9780],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Hong Kong DC',
      country: 'Hong Kong',
      city: 'Hong Kong',
      coordinates: [22.3193, 114.1694],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Bangladesh DC',
      country: 'Bangladesh',
      city: 'Dhaka',
      coordinates: [23.8103, 90.4125],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Sri Lanka DC',
      country: 'Sri Lanka',
      city: 'Colombo',
      coordinates: [6.9271, 79.8612],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Turkey DC',
      country: 'Turkey',
      city: 'Istanbul',
      coordinates: [41.0082, 28.9784],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '98M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Saudi Arabia DC',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      coordinates: [24.7136, 46.6753],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '27M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Thailand DC',
      country: 'Thailand',
      city: 'Bangkok',
      coordinates: [13.7563, 100.5018],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '37M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'New Zealand DC',
      country: 'New Zealand',
      city: 'Auckland',
      coordinates: [-36.8485, 174.7633],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: '2.4M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Czech Republic DC',
      country: 'Czech Republic',
      city: 'Prague',
      coordinates: [50.0755, 14.4378],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'UK DC',
      country: 'United Kingdom',
      city: 'London',
      coordinates: [51.5074, -0.1278],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Morocco DC',
      country: 'Morocco',
      city: 'Casablanca',
      coordinates: [33.5731, -7.5898],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Qatar DC',
      country: 'Qatar',
      city: 'Doha',
      coordinates: [25.2854, 51.5310],
      status: 'coming-soon',
      databases: 0,
      responseTime: 0,
      coverage: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    }
  ];

  constructor(
    private theme: NbThemeService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // Wait for the view to be fully initialized
    setTimeout(() => {
      this.initMap();
    }, 100);
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

      // Add click event to navigate to identity lookup
      marker.on('click', () => {
        if (dc.status === 'online') {
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
      offline: '#ff3d71'
    };

    const html = `
      <div style="
        background-color: ${colors[status]};
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
      offline: '#ff3d71'
    };

    const statusText = dc.status === 'coming-soon' ? 'Coming Soon' : dc.status;

    return `
      <div style="padding: 10px; min-width: 200px;">
        <h6 style="margin: 0 0 10px 0; font-weight: 600;">${dc.country}</h6>
        <div style="font-size: 14px; line-height: 1.6;">
          <div><strong>Status:</strong> <span style="color: ${statusColors[dc.status]}; font-weight: 600;">${statusText}</span></div>
          <div><strong>Coverage:</strong> ${dc.coverage}</div>
          ${dc.adultPopulationCoverage !== 'TBD' ? `<div><strong>Adult Population:</strong> ${dc.adultPopulationCoverage}</div>` : ''}
          ${dc.databases > 0 ? `<div><strong>Databases:</strong> ${dc.databases}</div>` : ''}
          ${dc.responseTime > 0 ? `<div><strong>Response Time:</strong> ${dc.responseTime}ms</div>` : ''}
        </div>
        ${dc.status === 'online' ? `
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