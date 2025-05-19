import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbIconModule, NbListModule } from '@nebular/theme';
import { CountriesComponent } from './countries.component';

@NgModule({
  imports: [
    CommonModule,
    NbCardModule,
    NbIconModule,
    NbListModule,
    RouterModule.forChild([
      {
        path: '',
        component: CountriesComponent,
      },
    ]),
  ],
  declarations: [
    CountriesComponent,
  ],
})
export class CountriesModule { }