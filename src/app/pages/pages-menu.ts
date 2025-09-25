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
    title: 'Data by Country',
    icon: 'globe-outline',
    link: '/pages/countries',
  },
  {
    title: 'ID Verification',
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
    title: 'Past Searches',
    icon: 'clock-outline',
    link: '/pages/searches',
  },
];