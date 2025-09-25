// src/app/pages/countries/countries.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Country {
  name: string;
  flag: string;
  status: 'online' | 'offline';
  coverage: string;
  recordCount: string;
  responseTime: string;
  options: string[];
  compliance: string[];
  updateFrequency: 'daily' | 'updated';
  region: string;
}

@Component({
  selector: 'ngx-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit {
  selectedRegion = 'all';
  countries: Country[] = [];
  filteredCountries: Country[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCountries();
    this.filteredCountries = [...this.countries];
  }

  loadCountries() {
    this.countries = [
      // Asia-Pacific
      {
        name: 'Australia',
        flag: '🇦🇺',
        status: 'online',
        coverage: '45%',  // 11.57M / 25.7M population
        recordCount: '11.57M',
        responseTime: '220ms',
        options: ['Full KYC', 'Document Verification', 'Sanctions Screening', 'Biometric Screening'],
        compliance: ['Privacy Act 1988', 'AML/CTF Act', 'CDR'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Indonesia',
        flag: '🇮🇩',
        status: 'online',
        coverage: '38%',  // 103.08M / 273M population
        recordCount: '103.08M',
        responseTime: '220ms',
        options: ['Identity Verification', 'Address Validation', 'Phone Verification', 'KTP Validation'],
        compliance: ['UU ITE', 'OJK Regulations'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Malaysia',
        flag: '🇲🇾',
        status: 'online',
        coverage: '74%',  // 24.42M / 33M population
        recordCount: '24.42M',
        responseTime: '220ms',
        options: ['MyKad Verification', 'Address Validation', 'Phone Verification', 'Business Registry'],
        compliance: ['PDPA 2010', 'AMLA'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Japan',
        flag: '🇯🇵',
        status: 'online',
        coverage: '46%',  // 58.26M / 125M population
        recordCount: '58.26M',
        responseTime: '220ms',
        options: ['Full KYC', 'Document Verification', 'Sanctions Screening', 'Business Registry'],
        compliance: ['APPI', 'FIEA'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Thailand',
        flag: '🇹🇭',
        status: 'online',
        coverage: '59%',  // 41.46M / 70M population
        recordCount: '41.46M',
        responseTime: '220ms',
        options: ['Identity Verification', 'Address Validation', 'Phone Verification'],
        compliance: ['PDPA', 'AMLO'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Philippines',
        flag: '🇵🇭',
        status: 'online',
        coverage: '44%',  // 49.06M / 111M population
        recordCount: '49.06M',
        responseTime: '220ms',
        options: ['UMID Verification', 'Phone Verification', 'TIN Validation'],
        compliance: ['DPA 2012', 'AMLA'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'Vietnam',
        flag: '🇻🇳',
        status: 'online',
        coverage: '77%',  // 75.75M / 98M population
        recordCount: '75.75M',
        responseTime: '220ms',
        options: ['Identity Verification', 'Address Validation', 'Phone Verification'],
        compliance: ['Cybersecurity Law', 'AML Decree'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      {
        name: 'New Zealand',
        flag: '🇳🇿',
        status: 'online',
        coverage: '48%',  // 2.42M / 5M population
        recordCount: '2.42M',
        responseTime: '220ms',
        options: ['Full KYC', 'Document Verification', 'Business Registry'],
        compliance: ['Privacy Act 2020', 'AML/CFT Act'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      },
      // Middle East & Africa
      {
        name: 'Saudi Arabia',
        flag: '🇸🇦',
        status: 'online',
        coverage: '76%',  // 26.83M / 35M population
        recordCount: '26.83M',
        responseTime: '220ms',
        options: ['Absher Verification', 'Iqama Validation', 'Business Registry'],
        compliance: ['PDPL', 'SAMA Regulations'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      {
        name: 'UAE',
        flag: '🇦🇪',
        status: 'online',
        coverage: '83%',  // 8.30M / 10M population
        recordCount: '8.30M',
        responseTime: '220ms',
        options: ['Emirates ID', 'Business License', 'Address Validation'],
        compliance: ['PDPL 2021', 'AML/CFT'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
       {
        name: 'Turkey',
        flag: '🇹🇷',
        status: 'online',
        coverage: '100%',  // Complete coverage
        recordCount: '88.40M',
        responseTime: '220ms',
        options: ['T.C. Kimlik Verification', 'Address Validation', 'Phone Verification'],
        compliance: ['KVKK', 'MASAK'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      {
        name: 'Egypt',
        flag: '🇪🇬',
        status: 'online',
        coverage: '75%',  // 77.74M / 104M population
        recordCount: '77.74M',
        responseTime: '220ms',
        options: ['National ID Verification', 'Phone Verification'],
        compliance: ['Data Protection Law', 'AML Law'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      {
        name: 'Qatar',
        flag: '🇶🇦',
        status: 'online',
        coverage: '82%',  // 2.36M / 2.9M population
        recordCount: '2.36M',
        responseTime: '220ms',
        options: ['Qatar ID Verification', 'Business Registry'],
        compliance: ['Data Protection Law', 'AML/CFT'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      {
        name: 'South Africa',
        flag: '🇿🇦',
        status: 'online',
        coverage: '74%',  // 44.47M / 60M population
        recordCount: '44.47M',
        responseTime: '220ms',
        options: ['SA ID Verification', 'Address Validation', 'Business Registry'],
        compliance: ['POPIA', 'FICA'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      {
        name: 'Morocco',
        flag: '🇲🇦',
        status: 'online',
        coverage: '68%',  // 25.18M / 37M population
        recordCount: '25.18M',
        responseTime: '220ms',
        options: ['CIN Verification', 'Address Validation'],
        compliance: ['Law 09-08', 'AML/CFT'],
        updateFrequency: 'daily',
        region: 'middle-east-africa'
      },
      // Europe
      {
        name: 'Czech Republic',
        flag: '🇨🇿',
        status: 'online',
        coverage: '85%',  // 9.05M / 10.7M population
        recordCount: '9.05M',
        responseTime: '220ms',
        options: ['Birth Number Verification', 'Address Validation'],
        compliance: ['GDPR', 'AML Directive'],
        updateFrequency: 'updated',
        region: 'europe'
      },
      {
        name: 'France',
        flag: '🇫🇷',
        status: 'online',
        coverage: '43%',  // 29.31M / 68M population
        recordCount: '29.31M',
        responseTime: '220ms',
        options: ['INSEE Verification', 'Address Validation', 'Business Registry'],
        compliance: ['GDPR', 'AML Directive'],
        updateFrequency: 'daily',
        region: 'europe'
      },
      // Americas
      {
        name: 'Canada',
        flag: '🇨🇦',
        status: 'online',
        coverage: '24%',  // 9.32M / 38M population
        recordCount: '9.32M',
        responseTime: '220ms',
        options: ['SIN Verification', 'Address Validation', 'Business Registry'],
        compliance: ['PIPEDA', 'PCMLTFA'],
        updateFrequency: 'daily',
        region: 'americas'
      },
      {
        name: 'Mexico',
        flag: '🇲🇽',
        status: 'online',
        coverage: '74%',  // 94.94M / 128M population
        recordCount: '94.94M',
        responseTime: '220ms',
        options: ['CURP Verification', 'RFC Validation', 'Address Validation'],
        compliance: ['LFPDPPP', 'AML Law'],
        updateFrequency: 'daily',
        region: 'americas'
      },
      {
        name: 'Pakistan',
        flag: '🇵🇰',
        status: 'offline',
        coverage: '0%',  // Coming soon
        recordCount: 'Coming Soon',
        responseTime: 'N/A',
        options: ['CNIC Verification', 'Phone Verification'],
        compliance: ['PECA', 'AML Act'],
        updateFrequency: 'daily',
        region: 'asia-pacific'
      }
    ];
  }

  filterByRegion() {
    if (this.selectedRegion === 'all') {
      this.filteredCountries = [...this.countries];
    } else {
      this.filteredCountries = this.countries.filter(
        country => country.region === this.selectedRegion
      );
    }
  }

  verifyData(country: Country) {
    // Navigate to manual lookup with country preselected
    this.router.navigate(['/pages/identity/manual-lookup'], {
      queryParams: { country: country.name }
    });
  }
}