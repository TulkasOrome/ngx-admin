// src/app/pages/dashboard/identity-verification/client-logos/client-logos.component.ts
import { Component, OnInit } from '@angular/core';

interface ClientLogo {
  name: string;
  logo: string;
  url?: string;
}

@Component({
  selector: 'ngx-client-logos',
  template: `
    <nb-card>
      <nb-card-header>
        Trusted By Industry Leaders
      </nb-card-header>
      <nb-card-body>
        <div class="client-logos-container">
          <div class="client-logo" *ngFor="let client of clientLogos" [title]="client.name">
            <a [href]="client.url" target="_blank" *ngIf="client.url; else noLink">
              <img [src]="client.logo" [alt]="client.name">
            </a>
            <ng-template #noLink>
              <img [src]="client.logo" [alt]="client.name">
            </ng-template>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .client-logos-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 0;
    }

    .client-logo {
      width: 120px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  `],
})
export class ClientLogosComponent implements OnInit {
  clientLogos: ClientLogo[] = [
    { 
      name: 'LexisNexis',
      logo: 'assets/images/clients/lexisnexis.png',
      url: 'https://www.lexisnexis.com'
    },
    { 
      name: 'Data Zoo',
      logo: 'assets/images/clients/datazoo.png',
      url: 'https://www.datazoo.com'
    },
    { 
      name: 'Experian',
      logo: 'assets/images/clients/experian.png',
      url: 'https://www.experian.com'
    },
    { 
      name: 'TrustID',
      logo: 'assets/images/clients/trustid.png',
      url: 'https://www.trustid.co.uk'
    },
    { 
      name: 'GBG',
      logo: 'assets/images/clients/gbg.png',
      url: 'https://www.gbgplc.com'
    },
  ];

  constructor() { }

  ngOnInit() {
    // In a real app, this data would likely come from a service connected to Strapi
  }
}