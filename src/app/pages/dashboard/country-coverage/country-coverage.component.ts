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
  region: string;
}

@Component({
  selector: 'ngx-country-coverage',
  styleUrls: ['./country-coverage.component.scss'],
  templateUrl: './country-coverage.component.html',
})
export class CountryCoverageComponent implements OnDestroy {

  private alive = true;

  allCountries: CountryData[] = [
    // APAC Region
    {
      name: 'Australia',
      coverage: 75,
      records: '11.5M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Indonesia',
      coverage: 82,
      records: '180M+',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Malaysia',
      coverage: 85,
      records: '24M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Japan',
      coverage: 88,
      records: '58M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Thailand',
      coverage: 78,
      records: '37M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Singapore',
      coverage: 90,
      records: '2.8M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Philippines',
      coverage: 75,
      records: '55M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Vietnam',
      coverage: 79,
      records: '48M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'South Korea',
      coverage: 86,
      records: '26M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Hong Kong',
      coverage: 92,
      records: '3.8M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Bangladesh',
      coverage: 72,
      records: '82M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'Sri Lanka',
      coverage: 76,
      records: '11M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'apac'
    },
    {
      name: 'New Zealand',
      coverage: 88,
      records: '2.4M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'apac'
    },
    // MENA Region
    {
      name: 'Saudi Arabia',
      coverage: 80,
      records: '17M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'mena'
    },
    {
      name: 'Turkey',
      coverage: 82,
      records: '42M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'mena'
    },
    {
      name: 'UAE',
      coverage: 85,
      records: '4.8M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'mena'
    },
    {
      name: 'Egypt',
      coverage: 74,
      records: '51M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'mena'
    },
    // Americas Region
    {
      name: 'Canada',
      coverage: 87,
      records: '19M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'americas'
    },
    {
      name: 'Mexico',
      coverage: 76,
      records: '64M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'americas'
    },
    // Europe Region
    {
      name: 'France',
      coverage: 84,
      records: '33M',
      updateFrequency: 'Daily',
      status: 'active',
      online: true,
      region: 'europe'
    },
    // Africa Region
    {
      name: 'South Africa',
      coverage: 78,
      records: '29M',
      updateFrequency: 'Weekly',
      status: 'active',
      online: true,
      region: 'africa'
    }
  ];

  countries: CountryData[] = this.allCountries;
  selectedRegion = 'all';

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

  onRegionChange() {
    if (this.selectedRegion === 'all') {
      this.countries = this.allCountries;
    } else {
      this.countries = this.allCountries.filter(c => c.region === this.selectedRegion);
    }
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