import { Component } from '@angular/core';

interface ComplianceItem {
  region: string;
  regulations: string[];
  status: 'compliant' | 'in-progress' | 'planned' | 'coming-soon';
  hostingModel: string;
}

@Component({
  selector: 'ngx-compliance-summary',
  styleUrls: ['./compliance-summary.component.scss'],
  templateUrl: './compliance-summary.component.html',
})
export class ComplianceSummaryComponent {

  complianceItems: ComplianceItem[] = [
    {
      region: 'Australia',
      regulations: ['Privacy Act 1988', 'AML/CTF Act', 'CDR'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Bangladesh',
      regulations: ['Digital Security Act', 'AML Act'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'Canada',
      regulations: ['PIPEDA', 'FINTRAC'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Czech Republic',
      regulations: ['GDPR', 'AML Directive'],
      status: 'coming-soon',
      hostingModel: 'EU data center'
    },
    {
      region: 'Egypt',
      regulations: ['Data Protection Law', 'AML Law'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'France',
      regulations: ['GDPR', 'AML Directive'],
      status: 'compliant',
      hostingModel: 'EU data center'
    },
    {
      region: 'Hong Kong',
      regulations: ['PDPO', 'AMLO'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Indonesia',
      regulations: ['UU PDP', 'OJK Regulations'],
      status: 'compliant',
      hostingModel: 'Local data center'
    },
    {
      region: 'Japan',
      regulations: ['APPI', 'FIEA'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Malaysia',
      regulations: ['PDPA 2010', 'AMLA'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'Mexico',
      regulations: ['LFPDPPP', 'AML Law'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'New Zealand',
      regulations: ['Privacy Act 2020', 'AML/CFT Act'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Philippines',
      regulations: ['DPA', 'AML Act'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'Saudi Arabia',
      regulations: ['PDPL', 'SAMA Regulations'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Singapore',
      regulations: ['PDPA', 'AML/CFT'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'South Africa',
      regulations: ['POPIA', 'FICA'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'South Korea',
      regulations: ['PIPA', 'AML Regulations'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Sri Lanka',
      regulations: ['Personal Data Protection Act', 'FIU Act'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'Thailand',
      regulations: ['PDPA', 'AML Regulations'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'Turkey',
      regulations: ['KVKK', 'AML Regulations'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    },
    {
      region: 'UAE',
      regulations: ['Data Protection Law', 'AML/CFT'],
      status: 'compliant',
      hostingModel: 'Local data residency'
    },
    {
      region: 'Vietnam',
      regulations: ['Cybersecurity Law', 'Data Protection'],
      status: 'compliant',
      hostingModel: 'Regional hosting'
    }
  ];

  certifications = [
    { name: 'ISO 27001', icon: 'shield-outline' },
    { name: 'SOC 2 Type II', icon: 'lock-outline' },
    { name: 'GDPR Ready', icon: 'checkmark-square-outline' }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'planned':
        return 'info';
      case 'coming-soon':
        return 'warning';
      default:
        return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'compliant':
        return 'checkmark-circle-2-outline';
      case 'in-progress':
        return 'sync-outline';
      case 'planned':
        return 'calendar-outline';
      case 'coming-soon':
        return 'clock-outline';
      default:
        return 'minus-circle-outline';
    }
  }
}