// src/app/pages/pages-menu.ts
import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Identity Verification',
    icon: 'person-outline',
    children: [
      {
        title: 'Manual Lookup',
        link: '/pages/identity/manual-lookup',
      },
      {
        title: 'Results History',
        link: '/pages/identity/results-history',
      },
    ],
  },
  {
    title: 'Users',
    icon: 'people-outline',
    children: [
      {
        title: 'User List',
        link: '/pages/users/list',
      },
      {
        title: 'My Profile',
        link: '/pages/users/profile',
      },
    ],
  },
  {
    title: 'Countries',
    icon: 'globe-outline',
    link: '/pages/countries',
  },
  {
    title: 'Account',
    icon: 'settings-outline',
    children: [
      {
        title: 'Profile',
        link: '/pages/account/profile',
      },
      {
        title: 'Settings',
        link: '/pages/account/settings',
      },
    ],
  },
];