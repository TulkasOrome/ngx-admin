// src/app/pages/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
  NbInputModule,
  NbBadgeModule,
} from '@nebular/theme';
import { NgxEchartsModule } from 'ngx-echarts';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { StatusCardComponent } from './status-card/status-card.component';
import { ContactsComponent } from './contacts/contacts.component';
import { RoomsComponent } from './rooms/rooms.component';
import { RoomSelectorComponent } from './rooms/room-selector/room-selector.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { TemperatureDraggerComponent } from './temperature/temperature-dragger/temperature-dragger.component';
import { KittenComponent } from './kitten/kitten.component';
import { SecurityCamerasComponent } from './security-cameras/security-cameras.component';
import { ElectricityComponent } from './electricity/electricity.component';
import { ElectricityChartComponent } from './electricity/electricity-chart/electricity-chart.component';
import { WeatherComponent } from './weather/weather.component';
import { SolarComponent } from './solar/solar.component';
import { PlayerComponent } from './rooms/player/player.component';
import { TrafficComponent } from './traffic/traffic.component';
import { TrafficChartComponent } from './traffic/traffic-chart.component';
import { FormsModule } from '@angular/forms';
import { IdentityVerificationComponent } from './identity-verification/identity-verification.component';
import { MatchConfidenceComponent } from './identity-verification/match-confidence/match-confidence.component';
import { CountrySelectorComponent } from './identity-verification/country-selector/country-selector.component';
import { ComplianceStatusComponent } from './identity-verification/compliance-status/compliance-status.component';
import { ClientLogosComponent } from './identity-verification/client-logos/client-logos.component';
import { DataUpdateFrequencyComponent } from './identity-verification/data-update-frequency/data-update-frequency.component';
import { PricingSnapshotComponent } from './identity-verification/pricing-snapshot/pricing-snapshot.component';
import { DifferentiatorsComponent } from './identity-verification/differentiators/differentiators.component';

@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbBadgeModule,
    NgxEchartsModule,
  ],
  declarations: [
    DashboardComponent,
    StatusCardComponent,
    TemperatureDraggerComponent,
    ContactsComponent,
    RoomSelectorComponent,
    TemperatureComponent,
    RoomsComponent,
    KittenComponent,
    SecurityCamerasComponent,
    ElectricityComponent,
    ElectricityChartComponent,
    WeatherComponent,
    PlayerComponent,
    SolarComponent,
    TrafficComponent,
    TrafficChartComponent,
    IdentityVerificationComponent,
    MatchConfidenceComponent,
    CountrySelectorComponent,
    ComplianceStatusComponent,
    ClientLogosComponent,
    DataUpdateFrequencyComponent,
    PricingSnapshotComponent,
    DifferentiatorsComponent,
  ],
})
export class DashboardModule { }