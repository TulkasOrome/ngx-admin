import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { PagesRoutingModule } from './pages-routing.module';
import { AuthDebugComponent } from './auth-debug/auth-debug.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    MiscellaneousModule,
    CommonModule,      // Add this
    NbCardModule,      // Add this
    NbButtonModule,
  ],
  declarations: [
    PagesComponent,
    AuthDebugComponent,
  ],
})
export class PagesModule {
}