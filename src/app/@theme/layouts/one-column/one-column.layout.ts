// src/app/@theme/layouts/one-column/one-column.layout.ts
import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class OneColumnLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clickListener: any;

  constructor(
    private sidebarService: NbSidebarService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Start with sidebar collapsed
    setTimeout(() => {
      this.sidebarService.collapse('menu-sidebar');
    }, 0);
  }

  ngAfterViewInit() {
    // Set up global click listener for closing sidebar
    this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      this.handleDocumentClick(event);
    });
    
    // Subscribe to sidebar state changes
    this.sidebarService.onToggle()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Sidebar state changed
      });
  }

  private handleDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    
    // Check if sidebar exists and is expanded
    this.sidebarService.getSidebarState('menu-sidebar')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state === 'expanded') {
          // Check if click is outside sidebar
          const sidebar = this.elementRef.nativeElement.querySelector('.menu-sidebar');
          const header = this.elementRef.nativeElement.querySelector('nb-layout-header');
          const toggleButton = header?.querySelector('.sidebar-toggle');
          
          // Don't close if clicking on toggle button (let the toggle handle it)
          if (toggleButton && toggleButton.contains(clickedElement)) {
            return;
          }
          
          // Close sidebar if click is outside
          if (sidebar && !sidebar.contains(clickedElement)) {
            this.sidebarService.collapse('menu-sidebar');
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove click listener
    if (this.clickListener) {
      this.clickListener();
    }
  }
}