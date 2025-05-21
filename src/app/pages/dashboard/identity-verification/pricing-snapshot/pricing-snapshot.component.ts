// src/app/pages/dashboard/identity-verification/pricing-snapshot/pricing-snapshot.component.ts
import { Component, OnInit } from '@angular/core';

interface PricingRegion {
  name: string;
  priceRange: string;
  currency: string;
  countries: {
    name: string;
    code: string;
    available: boolean;
  }[];
}

@Component({
  selector: 'ngx-pricing-snapshot',
  templateUrl: './pricing-snapshot.component.html',
  styleUrls: ['./pricing-snapshot.component.scss'],
})
export class PricingSnapshotComponent implements OnInit {
  regions: PricingRegion[] = [
    {
      name: 'APAC',
      priceRange: '0.05 - 0.15',
      currency: 'USD',
      countries: [
        { name: 'Australia', code: 'AU', available: true },
        { name: 'New Zealand', code: 'NZ', available: true },
        { name: 'Indonesia', code: 'ID', available: true },
        { name: 'Malaysia', code: 'MY', available: true },
        { name: 'Singapore', code: 'SG', available: true },
        { name: 'Japan', code: 'JP', available: true },
      ]
    },
    {
      name: 'MENA',
      priceRange: '0.10 - 0.25',
      currency: 'USD',
      countries: [
        { name: 'UAE', code: 'AE', available: true },
        { name: 'Saudi Arabia', code: 'SA', available: true },
        { name: 'Qatar', code: 'QA', available: true },
        { name: 'Egypt', code: 'EG', available: true },
        { name: 'Israel', code: 'IL', available: false },
      ]
    },
    {
      name: 'Europe',
      priceRange: '0.08 - 0.20',
      currency: 'EUR',
      countries: [
        { name: 'UK', code: 'GB', available: true },
        { name: 'France', code: 'FR', available: true },
        { name: 'Germany', code: 'DE', available: true },
        { name: 'Italy', code: 'IT', available: false },
        { name: 'Spain', code: 'ES', available: false },
      ]
    }
  ];

  constructor() { }

  ngOnInit() { }
}