// src/app/pages/dashboard/identity-verification/differentiators/differentiators.component.ts
import { Component, OnInit } from '@angular/core';

interface Differentiator {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'ngx-differentiators',
  templateUrl: './differentiators.component.html',
  styleUrls: ['./differentiators.component.scss'],
})
export class DifferentiatorsComponent implements OnInit {
  differentiators: Differentiator[] = [
    {
      title: 'Trusted Data Partners',
      description: 'Our data comes directly from trusted government and financial institution sources, ensuring the highest quality and reliability.',
      icon: 'shield-outline',
    },
    {
      title: 'Update Velocity',
      description: 'Our data is updated up to 3x more frequently than competitors, giving you the most current information available.',
      icon: 'flash-outline',
    },
    {
      title: 'Modern Tech Stack',
      description: 'Built on Elasticsearch with a modern architecture, our platform delivers faster results with greater accuracy.',
      icon: 'layers-outline',
    },
    {
      title: 'Compliance First',
      description: 'Built from the ground up to meet regional compliance requirements, keeping your business safe and compliant.',
      icon: 'lock-outline',
    },
  ];

  constructor() { }

  ngOnInit() { }
}