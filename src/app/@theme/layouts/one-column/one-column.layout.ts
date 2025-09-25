// src/app/@theme/layouts/one-column/one-column.layout.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive start>
        <!-- Logo Section with White Background -->
        <div class="sidebar-logo-section">
          <img src="assets/images/identitypulse-logo.png" alt="IdentityPulse" class="logo">
        </div>
        
        <!-- Dark Menu Section with Custom Cards -->
        <div class="sidebar-menu-section">
          <!-- Custom Menu Cards Component -->
          <ngx-menu-card></ngx-menu-card>
        </div>
        
        <!-- Hide the original nb-menu but keep it for compatibility -->
        <div style="display: none;">
          <ng-content select="nb-menu"></ng-content>
        </div>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent implements OnInit, AfterViewInit {
  constructor(private sidebarService: NbSidebarService) {}

  ngOnInit() {
    // Start with sidebar collapsed
    setTimeout(() => {
      this.sidebarService.collapse('menu-sidebar');
    }, 0);
  }

  ngAfterViewInit() {
    // Any additional initialization if needed
  }
}