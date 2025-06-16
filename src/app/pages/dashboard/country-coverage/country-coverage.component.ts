import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';

interface CountryData {
  name: string;
  coverage: number;
  records: string;
  updateFrequency: string;
  status: 'active' | 'coming-soon' | 'limited';
  online?: boolean;
}

@Component({
  selector: 'ngx-country-coverage',
  styleUrls: ['./country-coverage.component.scss'],
  templateUrl: './country-coverage.component.html',
})
export class CountryCoverageComponent implements OnDestroy {

  private alive = true;

  countries: CountryData[] = [
    {
      name: 'Australia',
      coverage: 75,
      records: '11.5M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true
    },
    {
      name: 'Indonesia',
      coverage: 82,
      records: '180M+',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true
    },
    {
      name: 'Malaysia',
      coverage: 85,
      records: '24M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true
    },
    {
      name: 'Japan',
      coverage: 88,
      records: '58M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true
    },
    {
      name: 'Saudi Arabia',
      coverage: 0,
      records: '27M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
    {
      name: 'Vietnam',
      coverage: 0,
      records: '79M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
    {
      name: 'Thailand',
      coverage: 0,
      records: '37M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
    {
      name: 'Turkey',
      coverage: 0,
      records: '98M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
    {
      name: 'UAE',
      coverage: 0,
      records: '9M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
    {
      name: 'New Zealand',
      coverage: 0,
      records: '2.4M',
      updateFrequency: 'Coming Soon',
      status: 'coming-soon',
      online: false
    },
  ];

  selectedRegion = 'all';
  regions = ['all', 'apac', 'mena', 'americas', 'north-asia'];

  currentTheme: string;

  constructor(private themeService: NbThemeService) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'checkmark-circle-2-outline';
      case 'coming-soon':
        return 'clock-outline';
      case 'limited':
        return 'alert-triangle-outline';
      default:
        return 'minus-circle-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'coming-soon':
        return 'warning';
      case 'limited':
        return 'danger';
      default:
        return 'basic';
    }
  }

  getCoverageStatus(coverage: number): string {
    if (coverage >= 80) return 'success';
    if (coverage >= 60) return 'warning';
    return 'danger';
  }

  getOnlineStatusIcon(online: boolean): string {
    return online ? 'wifi-outline' : 'wifi-off-outline';
  }

  getOnlineStatusColor(online: boolean): string {
    return online ? 'success' : 'basic';
  }
}