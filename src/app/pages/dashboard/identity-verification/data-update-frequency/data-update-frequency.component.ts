// src/app/pages/dashboard/identity-verification/data-update-frequency/data-update-frequency.component.ts
import { Component, Input, OnChanges, OnInit } from '@angular/core';

interface UpdateFrequency {
  country: string;
  countryCode: string;
  lastUpdated: string;
  frequency: string;
  freshness: number; // Percentage of freshness
}

@Component({
  selector: 'ngx-data-update-frequency',
  templateUrl: './data-update-frequency.component.html',
  styleUrls: ['./data-update-frequency.component.scss'],
})
export class DataUpdateFrequencyComponent implements OnInit, OnChanges {
  @Input() selectedCountry: string = 'aus';
  
  updateData: UpdateFrequency[] = [
    { country: 'Australia', countryCode: 'aus', lastUpdated: '2023-05-12', frequency: 'Daily', freshness: 98 },
    { country: 'Indonesia', countryCode: 'indo', lastUpdated: '2023-05-10', frequency: 'Daily', freshness: 96 },
    { country: 'Malaysia', countryCode: 'malay', lastUpdated: '2023-05-11', frequency: 'Daily', freshness: 97 },
    { country: 'Singapore', countryCode: 'singapore', lastUpdated: '2023-05-08', frequency: 'Weekly', freshness: 92 },
    { country: 'Japan', countryCode: 'japan', lastUpdated: '2023-05-05', frequency: 'Weekly', freshness: 90 },
  ];

  // Data structured for Electricity component
  listData = [
    {
      title: 'Data Freshness',
      months: [] as any[],
    },
  ];

  chartData = [] as any[];

  constructor() { }

  ngOnInit() {
    this.prepareData();
  }

  ngOnChanges() {
    this.prepareData();
  }

  prepareData() {
    // Prepare data for the Electricity component
    this.listData[0].months = this.updateData.map(item => ({
      month: item.country,
      delta: item.freshness > 95 ? '1.2' : '0.5',
      down: item.freshness < 95,
      kWatts: `${item.freshness}%`,
      cost: item.lastUpdated,
    }));

    // Prepare chart data
    this.chartData = this.updateData.map(item => ({
      label: item.countryCode.toUpperCase(),
      value: item.freshness,
    }));

    // Add empty values for proper spacing
    this.chartData = this.chartData.reduce((acc, item, index) => {
      acc.push(item);
      if (index < this.chartData.length - 1) {
        acc.push({ label: '', value: item.value - 2 }); // slight drop for visual effect
      }
      return acc;
    }, [] as any[]);
  }
}