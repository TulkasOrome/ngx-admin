// src/app/pages/dashboard/identity-verification/compliance-status/compliance-status.component.ts
import { Component, Input, OnChanges, OnInit } from '@angular/core';

interface ComplianceInfo {
  country: string;
  countryCode: string;
  jurisdictions: {
    name: string;
    status: 'compliant' | 'partial' | 'non-compliant';
    details: string;
  }[];
}

@Component({
  selector: 'ngx-compliance-status',
  templateUrl: './compliance-status.component.html',
  styleUrls: ['./compliance-status.component.scss'],
})
export class ComplianceStatusComponent implements OnInit, OnChanges {
  @Input() selectedCountry: string = 'aus';
  
  isSingleView: boolean = true;
  selectedCompliance: ComplianceInfo;
  
  complianceData: ComplianceInfo[] = [
    {
      country: 'Australia',
      countryCode: 'aus',
      jurisdictions: [
        { 
          name: 'Privacy Act 1988', 
          status: 'compliant',
          details: 'All data handling complies with the Australian Privacy Act 1988 and its amendments.'
        },
        { 
          name: 'Anti-Money Laundering and Counter-Terrorism Financing Act', 
          status: 'compliant',
          details: 'Fully compliant with AML/CTF regulations for identity verification.'
        },
        { 
          name: 'Financial Transaction Reports Act', 
          status: 'compliant',
          details: 'All financial identity verification meets FTRA requirements.'
        },
      ]
    },
    {
      country: 'Indonesia',
      countryCode: 'indo',
      jurisdictions: [
        { 
          name: 'Government Regulation 71 of 2019', 
          status: 'compliant',
          details: 'Compliant with Indonesia\'s Electronic Systems and Transactions regulations.'
        },
        { 
          name: 'Ministry of Communication and Information Technology Regulation 20 of 2016', 
          status: 'compliant',
          details: 'Meets all requirements for Personal Data Protection in Electronic Systems.'
        },
      ]
    },
    {
      country: 'Malaysia',
      countryCode: 'malay',
      jurisdictions: [
        { 
          name: 'Personal Data Protection Act 2010', 
          status: 'compliant',
          details: 'Full compliance with Malaysian data protection regulations.'
        },
        { 
          name: 'Anti-Money Laundering, Anti-Terrorism Financing Act', 
          status: 'compliant',
          details: 'All identity verification processes meet AML/CTF requirements.'
        },
      ]
    },
    {
      country: 'Singapore',
      countryCode: 'singapore',
      jurisdictions: [
        { 
          name: 'Personal Data Protection Act 2012', 
          status: 'compliant',
          details: 'All operations comply with Singapore\'s PDPA regulations.'
        },
        { 
          name: 'Monetary Authority of Singapore Guidelines', 
          status: 'partial',
          details: 'Some aspects of MAS guidelines are in the process of being implemented.'
        },
      ]
    },
    {
      country: 'Japan',
      countryCode: 'japan',
      jurisdictions: [
        { 
          name: 'Act on the Protection of Personal Information', 
          status: 'compliant',
          details: 'Compliant with Japan\'s main data protection regulation.'
        },
        { 
          name: 'Act on Prevention of Transfer of Criminal Proceeds', 
          status: 'partial',
          details: 'Partial compliance with some requirements still being implemented.'
        },
      ]
    },
  ];

  constructor() {
    this.selectedCompliance = this.complianceData.find(item => item.countryCode === this.selectedCountry) 
      || this.complianceData[0];
  }

  ngOnInit() {
    this.updateSelectedCompliance();
  }

  ngOnChanges() {
    this.updateSelectedCompliance();
  }

  updateSelectedCompliance() {
    const found = this.complianceData.find(item => item.countryCode === this.selectedCountry);
    if (found) {
      this.selectedCompliance = found;
      this.isSingleView = true;
    }
  }

  selectCompliance(compliance: ComplianceInfo) {
    this.selectedCompliance = compliance;
    this.isSingleView = true;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'compliant': return 'status-success';
      case 'partial': return 'status-warning';
      case 'non-compliant': return 'status-danger';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'partial': return 'Partially Compliant';
      case 'non-compliant': return 'Non-Compliant';
      default: return '';
    }
  }
}