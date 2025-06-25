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
    // All countries are now active except Czech Republic
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
    {
      name: 'Thailand',
      flag: '🇹🇭',
      status: 'active',
      coverage: 78,
      population: '69.8M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['PDPA', 'AML Regulations'],
      features: ['ID Card Verification', 'Address Check', 'Business Registry', 'Phone Validation'],
      recordCount: '37M',
      adultPopulationCoverage: '78%'
    },
    {
      name: 'France',
      flag: '🇫🇷',
      status: 'active',
      coverage: 84,
      population: '67.4M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['GDPR', 'AML Directive'],
      features: ['Identity Verification', 'Address Validation', 'Business Registry', 'PEP Screening'],
      recordCount: '33M',
      adultPopulationCoverage: '84%'
    },
    {
      name: 'South Africa',
      flag: '🇿🇦',
      status: 'active',
      coverage: 78,
      population: '59.3M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['POPIA', 'FICA'],
      features: ['ID Verification', 'Address Check', 'Business Registry', 'Credit Check'],
      recordCount: '29M',
      adultPopulationCoverage: '78%'
    },
    {
      name: 'Canada',
      flag: '🇨🇦',
      status: 'active',
      coverage: 87,
      population: '38.0M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['PIPEDA', 'FINTRAC'],
      features: ['Identity Verification', 'Address Validation', 'Business Registry', 'AML Check'],
      recordCount: '19M',
      adultPopulationCoverage: '87%'
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      status: 'active',
      coverage: 76,
      population: '128.9M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['LFPDPPP', 'AML Law'],
      features: ['CURP Verification', 'Address Check', 'Business Registry', 'RFC Validation'],
      recordCount: '64M',
      adultPopulationCoverage: '76%'
    },
    {
      name: 'Singapore',
      flag: '🇸🇬',
      status: 'active',
      coverage: 90,
      population: '5.7M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['PDPA', 'AML/CFT'],
      features: ['NRIC Verification', 'Address Check', 'Business Registry', 'Work Permit Check'],
      recordCount: '2.8M',
      adultPopulationCoverage: '90%'
    },
    {
      name: 'Philippines',
      flag: '🇵🇭',
      status: 'active',
      coverage: 75,
      population: '109.6M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['DPA', 'AML Act'],
      features: ['PhilID Verification', 'Address Validation', 'Business Registry', 'TIN Verification'],
      recordCount: '55M',
      adultPopulationCoverage: '75%'
    },
    {
      name: 'Vietnam',
      flag: '🇻🇳',
      status: 'active',
      coverage: 79,
      population: '97.3M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['Cybersecurity Law', 'Data Protection'],
      features: ['National ID Verification', 'Address Validation', 'Business Registry', 'Phone Check'],
      recordCount: '48M',
      adultPopulationCoverage: '79%'
    },
    {
      name: 'Egypt',
      flag: '🇪🇬',
      status: 'active',
      coverage: 74,
      population: '102.3M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['Data Protection Law', 'AML Law'],
      features: ['National ID Verification', 'Address Check', 'Business Registry', 'Phone Validation'],
      recordCount: '51M',
      adultPopulationCoverage: '74%'
    },
    {
      name: 'UAE',
      flag: '🇦🇪',
      status: 'active',
      coverage: 85,
      population: '9.9M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['Data Protection Law', 'AML/CFT'],
      features: ['Emirates ID Verification', 'Address Validation', 'Business Registry', 'Visa Status'],
      recordCount: '4.8M',
      adultPopulationCoverage: '85%'
    },
    {
      name: 'South Korea',
      flag: '🇰🇷',
      status: 'active',
      coverage: 86,
      population: '51.3M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['PIPA', 'AML Regulations'],
      features: ['Resident Registration', 'Address Check', 'Business Registry', 'Phone Verification'],
      recordCount: '26M',
      adultPopulationCoverage: '86%'
    },
    {
      name: 'Hong Kong',
      flag: '🇭🇰',
      status: 'active',
      coverage: 92,
      population: '7.5M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['PDPO', 'AMLO'],
      features: ['HKID Verification', 'Address Check', 'Business Registry', 'Bank Account Verification'],
      recordCount: '3.8M',
      adultPopulationCoverage: '92%'
    },
    {
      name: 'Bangladesh',
      flag: '🇧🇩',
      status: 'active',
      coverage: 72,
      population: '164.7M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['Digital Security Act', 'AML Act'],
      features: ['NID Verification', 'Address Check', 'Business Registry', 'Phone Validation'],
      recordCount: '82M',
      adultPopulationCoverage: '72%'
    },
    {
      name: 'Sri Lanka',
      flag: '🇱🇰',
      status: 'active',
      coverage: 76,
      population: '21.4M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['Personal Data Protection Act', 'FIU Act'],
      features: ['NIC Verification', 'Address Check', 'Business Registry', 'Phone Validation'],
      recordCount: '11M',
      adultPopulationCoverage: '76%'
    },
    {
      name: 'Turkey',
      flag: '🇹🇷',
      status: 'active',
      coverage: 82,
      population: '84.3M',
      databases: 3,
      updateFrequency: 'Weekly',
      regulations: ['KVKK', 'AML Regulations'],
      features: ['National ID Verification', 'Address Check', 'Business Registry', 'Tax ID Check'],
      recordCount: '42M',
      adultPopulationCoverage: '82%'
    },
    {
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      status: 'active',
      coverage: 80,
      population: '34.8M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['PDPL', 'SAMA Regulations'],
      features: ['National ID Verification', 'Iqama Validation', 'Business Registry', 'AML Screening'],
      recordCount: '17M',
      adultPopulationCoverage: '80%'
    },
    {
      name: 'New Zealand',
      flag: '🇳🇿',
      status: 'active',
      coverage: 88,
      population: '5.1M',
      databases: 3,
      updateFrequency: 'Daily',
      regulations: ['Privacy Act 2020', 'AML/CFT Act'],
      features: ['Identity Verification', 'Address Validation', 'Business Registry', 'Driver License Check'],
      recordCount: '2.4M',
      adultPopulationCoverage: '88%'
    },
    {
      name: 'Czech Republic',
      flag: '🇨🇿',
      status: 'coming-soon',
      coverage: 0,
      population: '10.7M',
      databases: 0,
      updateFrequency: 'TBD',
      regulations: ['GDPR', 'AML Directive'],
      features: ['Identity Verification', 'Address Validation', 'Business Registry', 'EU Compliance'],
      recordCount: 'Coming Soon',
      adultPopulationCoverage: 'TBD'
    }
  ];

  activeCountries = this.countries.filter(c => c.status === 'active');
  comingSoonCountries = this.countries.filter(c => c.status === 'coming-soon');
}