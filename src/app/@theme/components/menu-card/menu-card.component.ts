// src/app/@theme/components/menu-card/menu-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbSidebarService } from '@nebular/theme';

export interface MenuCardItem {
  title: string;
  subtitle: string;
  icon: string;
  link?: string;
  children?: MenuCardItem[];
  expanded?: boolean;
}

@Component({
  selector: 'ngx-menu-card',
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss']
})
export class MenuCardComponent implements OnInit {
  @Input() items: MenuCardItem[] = [];
  
  menuItems: MenuCardItem[] = [
    {
      title: 'Dashboard',
      subtitle: 'ONE PLACE FOR EVERYTHING YOU NEED',
      icon: 'home-outline',
      link: '/pages/dashboard',
    },
    {
      title: 'Data by Country',
      subtitle: 'EXPLORE OUR COVERAGE AND COMPLIANCE',
      icon: 'globe-outline',
      link: '/pages/countries',
    },
    {
      title: 'ID Verification',
      subtitle: 'TEST THE INTEGRITY OF OUR DATA FIRST HAND',
      icon: 'person-outline',
      expanded: false,
      children: [
        {
          title: 'Manual Lookup',
          subtitle: '',
          icon: '',
          link: '/pages/identity/manual-lookup',
        },
        {
          title: 'Results History',
          subtitle: '',
          icon: '',
          link: '/pages/identity/results-history',
        },
      ],
    },
  ];
  
  activeLink: string = '';

  constructor(
    private router: Router,
    private sidebarService: NbSidebarService
  ) {}

  ngOnInit() {
    // Set the active link based on current route
    this.activeLink = this.router.url;
    
    // Listen to route changes
    this.router.events.subscribe(() => {
      this.activeLink = this.router.url;
    });
  }

  navigateTo(item: MenuCardItem) {
    if (item.children) {
      // Toggle expansion for items with children
      item.expanded = !item.expanded;
    } else if (item.link) {
      // Navigate to the link
      this.router.navigate([item.link]);
      // Collapse sidebar on mobile after navigation
      if (window.innerWidth < 768) {
        this.sidebarService.collapse('menu-sidebar');
      }
    }
  }

  isActive(item: MenuCardItem): boolean {
    if (item.link) {
      return this.activeLink === item.link || this.activeLink.startsWith(item.link + '/');
    }
    if (item.children) {
      return item.children.some(child => this.isActive(child));
    }
    return false;
  }
}