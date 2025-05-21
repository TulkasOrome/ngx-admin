// src/app/pages/dashboard/identity-verification/country-selector/country-selector.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

interface Country {
  id: string;
  name: string;
  code: string;
  available: boolean;
}

@Component({
  selector: 'ngx-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent implements OnInit {
  @Input() countries: Country[] = [];
  @Input() selectedCountry: string = '';
  @Output() countrySelected = new EventEmitter<string>();

  availableCountries: Country[] = [];
  unavailableCountries: Country[] = [];
  currentTheme: string = '';

  constructor(private themeService: NbThemeService) { }

  ngOnInit() {
    this.themeService.getJsTheme().subscribe(theme => {
      this.currentTheme = theme.name;
    });

    this.sortCountries();
  }

  ngOnChanges() {
    this.sortCountries();
  }

  sortCountries() {
    this.availableCountries = this.countries.filter(country => country.available);
    this.unavailableCountries = this.countries.filter(country => !country.available);
  }

  onCountrySelect(countryId: string) {
    this.selectedCountry = countryId;
    this.countrySelected.emit(countryId);
  }
}