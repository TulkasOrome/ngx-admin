// src/app/@theme/components/footer/footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  template: `
    <span class="created-by">
      Powered by <b><a href="https://identitypulse.com" target="_blank">IdentityPulse</a></b> © 2025
    </span>
  `,
  styles: [`
    :host {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #010A26 !important;
      padding: 1rem 2rem;
    }
    
    .created-by {
      color: rgba(255, 255, 255, 0.7);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      
      a {
        color: #0066FF;
        text-decoration: none;
        transition: color 0.3s ease;
        
        &:hover {
          color: #0052CC;
          text-decoration: underline;
        }
      }
      
      b {
        font-weight: 600;
      }
    }
  `]
})
export class FooterComponent {}