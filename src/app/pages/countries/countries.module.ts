// src/app/pages/countries/countries.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CountriesComponent } from './countries.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CountriesComponent,
      }
    ])
  ],
  declarations: [CountriesComponent],
})
export class CountriesModule { }