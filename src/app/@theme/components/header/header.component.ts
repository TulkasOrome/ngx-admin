// src/app/@theme/components/header/header.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { AzureAuthService } from '../../../auth/azure-auth.service';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  public readonly materialTheme$: Observable<boolean>;
  userPictureOnly: boolean = false;
  user: any;

  userMenu = [ 
    { title: 'Profile' }, 
    { title: 'Log out' } 
  ];

  public constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: AzureAuthService,
  ) {
    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(map(theme => {
        const themeName: string = theme?.name || '';
        return themeName.startsWith('material');
      }));
  }

  ngOnInit() {
    // Set default theme to marketsoft
    this.themeService.changeTheme('marketsoft');

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    // Get user from Azure AD
    const azureUser = this.authService.getUser();
    if (azureUser) {
      this.user = {
        name: azureUser.displayName || azureUser.email,
        picture: null
      };
    }

    // Also try to get user profile from Graph API
    this.authService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        profile => {
          this.user = {
            name: profile.displayName || profile.mail || profile.userPrincipalName,
            picture: null
          };
        },
        error => {
          console.log('Could not fetch user profile from Graph API:', error);
        }
      );

    // Handle menu clicks
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
        takeUntil(this.destroy$)
      )
      .subscribe(({ item }: { item: any }) => {
        if (item.title === 'Log out') {
          this.authService.logout();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}