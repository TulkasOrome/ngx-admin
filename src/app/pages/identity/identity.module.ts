import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbInputModule, 
  NbSelectModule, 
  NbSpinnerModule, 
  NbProgressBarModule,
  NbIconModule,
  NbListModule,
  NbToastrModule,
  NbAlertModule
} from '@nebular/theme';
import { ManualLookupComponent } from './manual-lookup/manual-lookup.component';
import { ResultsHistoryComponent } from './results-history/results-history.component';
import { ApiTestComponent } from './api-test/api-test.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: 'manual-lookup',
        component: ManualLookupComponent,
      },
      {
        path: 'results-history',
        component: ResultsHistoryComponent,
      },
      {
        path: 'api-test',
        component: ApiTestComponent,
      },
    ]),
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbProgressBarModule,
    NbIconModule,
    NbListModule,
    NbAlertModule,
    NbToastrModule.forRoot()
  ],
  declarations: [
    ManualLookupComponent,
    ResultsHistoryComponent,
    ApiTestComponent,
  ],
})
export class IdentityModule { }