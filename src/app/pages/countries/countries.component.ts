import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit {
  
  countries = [
    { 
      name: 'Australia', 
      code: 'aus', 
      records: '15M+', 
      updateFrequency: 'Weekly',
      availability: true,
      icon: '🇦🇺'
    },
    { 
      name: 'Indonesia', 
      code: 'indo', 
      records: '120M+', 
      updateFrequency: 'Monthly',
      availability: true,
      icon: '🇮🇩'
    },
    { 
      name: 'Japan', 
      code: 'japan', 
      records: '85M+', 
      updateFrequency: 'Bi-weekly',
      availability: true,
      icon: '🇯🇵'
    },
    { 
      name: 'Malaysia', 
      code: 'malay', 
      records: '20M+', 
      updateFrequency: 'Weekly',
      availability: true,
      icon: '🇲🇾'
    },
    { 
      name: 'Singapore', 
      code: 'sg', 
      records: '5M+', 
      updateFrequency: 'Weekly',
      availability: true,
      icon: '🇸🇬'
    },
    { 
      name: 'Thailand', 
      code: 'thai', 
      records: '45M+', 
      updateFrequency: 'Monthly',
      availability: false,
      icon: '🇹🇭'
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }
}