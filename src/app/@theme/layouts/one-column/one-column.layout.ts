// src/app/@theme/layouts/one-column/one-column.layout.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NbSidebarService, NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive start>
        <!-- Logo Section -->
        <div class="sidebar-header">
          <img src="assets/images/identitypulse-logo.png" alt="IdentityPulse" class="logo">
        </div>
        
        <!-- Menu -->
        <div class="sidebar-body">
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
    // Default to collapsed state
    setTimeout(() => {
      this.sidebarService.collapse('menu-sidebar');
    }, 0);
  }

  ngAfterViewInit() {
    // Add subtitle text to menu items after view initializes
    setTimeout(() => {
      this.addMenuSubtitles();
    }, 100);
  }

  private addMenuSubtitles() {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-sidebar .menu-item > a');
    
    const subtitles = [
      'ONE PLACE FOR EVERYTHING YOU NEED',
      'EXPLORE OUR COVERAGE AND COMPLIANCE', 
      'TEST THE INTEGRITY OF OUR DATA FIRST HAND',
      'REVIEW YOUR PREVIOUS QUERIES AND RESULTS'
    ];

    menuItems.forEach((item: HTMLElement, index: number) => {
      if (index < subtitles.length && !item.querySelector('.menu-subtitle')) {
        const subtitle = document.createElement('div');
        subtitle.className = 'menu-subtitle';
        subtitle.textContent = subtitles[index];
        item.appendChild(subtitle);
      }
    });
  }
}