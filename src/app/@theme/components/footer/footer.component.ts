import { Component } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Powered by <b><a href="https://identitypulse.com" target="_blank">IdentityPulse</a></b> © 2025
    </span>
  `,
})
export class FooterComponent {
  constructor(private themeService: NbThemeService) {}
}