import { Component } from '@angular/core';

interface Country {
  name: string;
  flag: string;
  status: 'active' | 'coming-soon';
  coverage: number;
  population: string;
  databases: number;
  updateFrequency: string;
  regulations: string[];
  features: string[];
  recordCount?: string;
  adultPopulationCoverage?: string;
}

@Component({
  selector: 'ngx-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent {

  countries: Country[] = [
    // Active countries
    {
      name: 'Australia',
      flag: '🇦🇺',
      status: 'active',
      coverage: 75,
      population: '25.7M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['Privacy Act 1988', 'AML/CTF Act', 'CDR'],
      features: ['Full KYC', 'Document Verification', 'Biometric Matching', 'Watchlist Screening'],
      recordCount: '11.5M',
      adultPopulationCoverage: '75%'
    },
    {
      name: 'Indonesia',
      flag: '🇮🇩',
      status: 'active',
      coverage: 82,
      population: '273.5M',
      databases: 4,
      updateFrequency: 'Weekly',
      regulations: ['UU PDP', 'OJK Regulations'],
      features: ['Identity Verification', 'Address Validation', 'Phone Verification', 'KTP Validation'],
      recordCount: '180M+',
      adultPopulationCoverage: '82%'
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      status: 'active',
      coverage: 85,
      population: '32.4M',
      databases: 2,
      updateFrequency: 'Weekly',
      regulations: ['PDPA 2010', 'AMLA'],
      features: ['MyKad Verification', 'Address Check', 'Phone Validation', 'Business Registry'],
      recordCount: '24M',
      adultPopulationCoverage: '85%'
    },
    {
      name: 'Japan',
      flag: '🇯🇵',
      status: 'active',
      coverage: 88,
      population: '125.8M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['APPI', 'FIEA'],
      features: ['My Number Verification', 'Address Validation', 'Corporate Registry', 'AML Check'],
      recordCount: '58M',
      adultPopulationCoverage: '88%'
    },
    // Coming soon countries
    {
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      status: 'coming-soon',
      coverage: 0,
      population: '34.8M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['PDPL', 'SAMA Regulations'],
      features: ['National ID Verification', 'Iqama Validation', 'Business Registry', 'AML Screening'],
      recordCount: '27M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Vietnam',
      flag: '🇻🇳',
      status: 'coming-soon',
      coverage: 0,
      population: '97.3M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['Cybersecurity Law', 'Data Protection'],
      features: ['National ID Verification', 'Address Validation', 'Business Registry'],
      recordCount: '79M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      status: 'coming-soon',
      coverage: 0,
      population: '69.8M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['PDPA', 'AML Regulations'],
      features: ['ID Card Verification', 'Address Check', 'Business Registry'],
      recordCount: '37M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'New Zealand',
      flag: '🇳🇿',
      status: 'coming-soon',
      coverage: 0,
      population: '5.1M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['Privacy Act 2020', 'AML/CFT Act'],
      features: ['Identity Verification', 'Address Validation', 'Business Registry'],
      recordCount: '2.4M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Turkey',
      flag: '🇹🇷',
      status: 'coming-soon',
      coverage: 0,
      population: '84.3M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['KVKK', 'AML Regulations'],
      features: ['National ID Verification', 'Address Check', 'Business Registry'],
      recordCount: '98M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'UAE',
      flag: '🇦🇪',
      status: 'coming-soon',
      coverage: 0,
      population: '9.9M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['Data Protection Law', 'AML/CFT'],
      features: ['Emirates ID Verification', 'Address Validation', 'Business Registry'],
      recordCount: '9M',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Singapore',
      flag: '🇸🇬',
      status: 'coming-soon',
      coverage: 0,
      population: '5.7M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['PDPA', 'AML/CFT'],
      features: ['NRIC Verification', 'Address Check', 'Business Registry'],
      recordCount: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    },
    {
      name: 'Philippines',
      flag: '🇵🇭',
      status: 'coming-soon',
      coverage: 0,
      population: '109.6M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['DPA', 'AML Act'],
      features: ['PhilID Verification', 'Address Validation', 'Business Registry'],
      recordCount: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    }
  ];

  activeCountries = this.countries.filter(c => c.status === 'active');
  comingSoonCountries = this.countries.filter(c => c.status === 'coming-soon');
}