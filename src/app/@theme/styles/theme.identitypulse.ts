// src/app/@theme/styles/theme.identitypulse.ts
import { NbJSThemeOptions, DEFAULT_THEME as baseTheme } from '@nebular/theme';

const baseThemeVariables = baseTheme.variables;

export const IDENTITYPULSE_THEME = {
  name: 'identitypulse',
  base: 'default',
  variables: {
    // Dark theme colors based on Figma design
    temperature: {
      arcFill: ['#0066FF', '#0052CC', '#0047B3', '#003D99', '#003380'],
      arcEmpty: 'rgba(255, 255, 255, 0.1)',
      thumbBg: '#FFFFFF',
      thumbBorder: '#0066FF',
    },

    // Override primary colors with dark theme
    primary: '#0066FF',  // Main brand blue
    success: '#00D4AA',  // Teal accent
    info: '#00A8E6',     // Light blue
    warning: '#FFB800',  // Yellow accent
    danger: '#FF3D71',   // Red for errors

    // Dark background colors from Figma
    bg1: '#010A26',      // Main background
    bg2: '#0A1433',      // Slightly lighter
    bg3: '#1A2445',      // Card backgrounds
    bg4: '#2A3456',      // Elevated surfaces

    // Text colors for dark theme
    'text-basic-color': '#FFFFFF',
    'text-disabled-color': 'rgba(255, 255, 255, 0.4)',
    'text-hint-color': 'rgba(255, 255, 255, 0.6)',
    'text-primary-color': '#0066FF',
    'text-primary-focus-color': '#0052CC',
    'text-success-color': '#00D4AA',
    'text-info-color': '#00A8E6',
    'text-warning-color': '#FFB800',
    'text-danger-color': '#FF3D71',
    'text-control-color': '#FFFFFF',

    // Layout specific colors
    'layout-background-color': '#010A26',
    
    // Card colors
    'card-background-color': 'rgba(255, 255, 255, 0.05)',
    'card-border-color': 'rgba(255, 255, 255, 0.1)',
    'card-text-color': '#FFFFFF',
    'card-header-text-color': '#FFFFFF',
    'card-header-primary-background-color': 'transparent',
    'card-header-info-background-color': 'transparent',
    'card-header-success-background-color': 'transparent',
    'card-header-warning-background-color': 'transparent',
    'card-header-danger-background-color': 'transparent',

    // Menu colors
    'menu-background-color': '#010A26',
    'menu-text-color': 'rgba(255, 255, 255, 0.8)',
    'menu-item-hover-background-color': 'rgba(0, 102, 255, 0.1)',
    'menu-item-hover-text-color': '#FFFFFF',
    'menu-item-active-background-color': 'rgba(0, 102, 255, 0.2)',
    'menu-item-active-text-color': '#0066FF',
    'menu-item-icon-color': 'rgba(255, 255, 255, 0.6)',
    'menu-item-icon-active-color': '#0066FF',
    'menu-item-divider-color': 'rgba(255, 255, 255, 0.1)',

    // Sidebar colors
    'sidebar-background-color': '#010A26',
    'sidebar-text-color': 'rgba(255, 255, 255, 0.8)',
    'sidebar-padding': '2.25rem',

    // Header colors
    'header-background-color': 'transparent',
    'header-text-color': '#FFFFFF',
    'header-text-subtitle-color': 'rgba(255, 255, 255, 0.7)',

    // Button colors
    'button-filled-primary-background-color': '#0066FF',
    'button-filled-primary-border-color': '#0066FF',
    'button-filled-primary-hover-background-color': '#0052CC',
    'button-filled-primary-hover-border-color': '#0052CC',
    'button-outline-primary-background-color': 'transparent',
    'button-outline-primary-border-color': '#FFFFFF',
    'button-outline-primary-text-color': '#FFFFFF',
    'button-outline-primary-hover-background-color': 'rgba(255, 255, 255, 0.1)',
    'button-outline-primary-hover-border-color': '#FFFFFF',

    // Input colors
    'input-basic-background-color': 'rgba(255, 255, 255, 0.05)',
    'input-basic-border-color': 'rgba(255, 255, 255, 0.2)',
    'input-basic-text-color': '#FFFFFF',
    'input-basic-placeholder-text-color': 'rgba(255, 255, 255, 0.5)',
    'input-basic-focus-background-color': 'rgba(255, 255, 255, 0.08)',
    'input-basic-focus-border-color': '#0066FF',

    // Select colors
    'select-basic-background-color': 'rgba(255, 255, 255, 0.05)',
    'select-basic-border-color': 'rgba(255, 255, 255, 0.2)',
    'select-basic-text-color': '#FFFFFF',
    'select-basic-placeholder-text-color': 'rgba(255, 255, 255, 0.5)',
    'select-basic-focus-background-color': 'rgba(255, 255, 255, 0.08)',
    'select-basic-focus-border-color': '#0066FF',

    solar: {
      gradientLeft: '#0066FF',
      gradientRight: '#00D4AA',
      shadowColor: 'rgba(0, 102, 255, 0.2)',
      secondSeriesFill: 'rgba(255, 255, 255, 0.1)',
      radius: ['70%', '90%'],
    },

    traffic: {
      tooltipBg: '#1A2445',
      tooltipBorderColor: 'rgba(255, 255, 255, 0.1)',
      tooltipExtraCss: 'border-radius: 10px; padding: 4px 16px;',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: 'normal',

      yAxisSplitLine: 'rgba(255, 255, 255, 0.1)',

      lineBg: '#0066FF',
      lineShadowBlur: '0',
      itemColor: '#0066FF',
      itemBorderColor: '#0066FF',
      itemEmphasisBorderColor: '#0052CC',
      shadowLineDarkBg: 'rgba(0, 0, 0, 0)',
      shadowLineShadow: 'rgba(0, 0, 0, 0)',
      gradFrom: '#010A26',
      gradTo: '#0A1433',
    },

    electricity: {
      tooltipBg: '#1A2445',
      tooltipLineColor: '#FFFFFF',
      tooltipLineWidth: '0',
      tooltipBorderColor: 'rgba(255, 255, 255, 0.1)',
      tooltipExtraCss: 'border-radius: 10px; padding: 8px 24px;',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: 'normal',

      axisLineColor: 'rgba(255, 255, 255, 0.2)',
      xAxisTextColor: 'rgba(255, 255, 255, 0.8)',
      yAxisSplitLine: 'rgba(255, 255, 255, 0.1)',

      itemBorderColor: '#0066FF',
      lineStyle: 'solid',
      lineWidth: '4',
      lineGradFrom: '#0066FF',
      lineGradTo: '#00D4AA',
      lineShadow: 'rgba(0, 102, 255, 0.2)',

      areaGradFrom: 'rgba(0, 102, 255, 0.2)',
      areaGradTo: 'rgba(0, 102, 255, 0)',
      shadowLineDarkBg: 'rgba(0, 0, 0, 0)',
    },

    bubbleMap: {
      titleColor: '#FFFFFF',
      areaColor: 'rgba(255, 255, 255, 0.05)',
      areaHoverColor: 'rgba(0, 102, 255, 0.2)',
      areaBorderColor: 'rgba(255, 255, 255, 0.1)',
    },

    echarts: {
      bg: '#010A26',
      textColor: 'rgba(255, 255, 255, 0.8)',
      axisLineColor: 'rgba(255, 255, 255, 0.2)',
      splitLineColor: 'rgba(255, 255, 255, 0.1)',
      itemHoverShadowColor: 'rgba(0, 102, 255, 0.5)',
      tooltipBackgroundColor: '#0066FF',
      areaOpacity: '0.7',
    },

    chartjs: {
      axisLineColor: 'rgba(255, 255, 255, 0.1)',
      textColor: 'rgba(255, 255, 255, 0.8)',
    },

    // Additional component theme variables as needed
    orders: {
      tooltipBg: '#1A2445',
      tooltipLineColor: 'rgba(0, 0, 0, 0)',
      tooltipLineWidth: '0',
      tooltipBorderColor: 'rgba(255, 255, 255, 0.1)',
      tooltipExtraCss: 'border-radius: 10px; padding: 8px 24px;',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: 'normal',
      tooltipFontSize: '20',

      axisLineColor: 'rgba(255, 255, 255, 0.2)',
      axisFontSize: '16',
      axisTextColor: 'rgba(255, 255, 255, 0.8)',
      yAxisSplitLine: 'rgba(255, 255, 255, 0.1)',

      itemBorderColor: '#0066FF',
      lineStyle: 'solid',
      lineWidth: '4',

      // first line
      firstAreaGradFrom: 'rgba(255, 255, 255, 0.1)',
      firstAreaGradTo: 'rgba(255, 255, 255, 0)',
      firstShadowLineDarkBg: 'rgba(0, 0, 0, 0)',

      // second line
      secondLineGradFrom: '#0066FF',
      secondLineGradTo: '#0066FF',

      secondAreaGradFrom: 'rgba(0, 102, 255, 0.2)',
      secondAreaGradTo: 'rgba(0, 102, 255, 0)',
      secondShadowLineDarkBg: 'rgba(0, 0, 0, 0)',

      // third line
      thirdLineGradFrom: '#00D4AA',
      thirdLineGradTo: '#00D4AA',

      thirdAreaGradFrom: 'rgba(0, 212, 170, 0.2)',
      thirdAreaGradTo: 'rgba(0, 212, 170, 0)',
      thirdShadowLineDarkBg: 'rgba(0, 0, 0, 0)',
    },

    profit: {
      bg: '#010A26',
      textColor: 'rgba(255, 255, 255, 0.8)',
      axisLineColor: 'rgba(255, 255, 255, 0.2)',
      splitLineColor: 'rgba(255, 255, 255, 0.1)',
      areaOpacity: '1',

      axisFontSize: '16',
      axisTextColor: 'rgba(255, 255, 255, 0.8)',

      // first bar
      firstLineGradFrom: 'rgba(255, 255, 255, 0.1)',
      firstLineGradTo: 'rgba(255, 255, 255, 0.1)',
      firstLineShadow: 'rgba(0, 0, 0, 0)',

      // second bar
      secondLineGradFrom: '#0066FF',
      secondLineGradTo: '#0066FF',
      secondLineShadow: 'rgba(0, 0, 0, 0)',

      // third bar
      thirdLineGradFrom: '#00D4AA',
      thirdLineGradTo: '#00D4AA',
      thirdLineShadow: 'rgba(0, 0, 0, 0)',
    },

    orderProfitLegend: {
      firstItem: '#00D4AA',
      secondItem: '#0066FF',
      thirdItem: 'rgba(255, 255, 255, 0.3)',
    },

    visitors: {
      tooltipBg: '#1A2445',
      tooltipLineColor: 'rgba(0, 0, 0, 0)',
      tooltipLineWidth: '1',
      tooltipBorderColor: 'rgba(255, 255, 255, 0.1)',
      tooltipExtraCss: 'border-radius: 10px; padding: 8px 24px;',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: 'normal',
      tooltipFontSize: '20',

      axisLineColor: 'rgba(255, 255, 255, 0.2)',
      axisFontSize: '16',
      axisTextColor: 'rgba(255, 255, 255, 0.8)',
      yAxisSplitLine: 'rgba(255, 255, 255, 0.1)',

      itemBorderColor: '#0066FF',
      lineStyle: 'dotted',
      lineWidth: '6',
      lineGradFrom: '#ffffff',
      lineGradTo: '#ffffff',
      lineShadow: 'rgba(0, 0, 0, 0)',

      areaGradFrom: '#0066FF',
      areaGradTo: 'rgba(0, 102, 255, 0.3)',

      innerLineStyle: 'solid',
      innerLineWidth: '1',

      innerAreaGradFrom: '#00D4AA',
      innerAreaGradTo: 'rgba(0, 212, 170, 0.3)',
    },

    visitorsLegend: {
      firstIcon: '#00D4AA',
      secondIcon: '#0066FF',
    },

    visitorsPie: {
      firstPieGradientLeft: '#00D4AA',
      firstPieGradientRight: '#00D4AA',
      firstPieShadowColor: 'rgba(0, 0, 0, 0)',
      firstPieRadius: ['70%', '90%'],

      secondPieGradientLeft: '#FFB800',
      secondPieGradientRight: '#FFB800',
      secondPieShadowColor: 'rgba(0, 0, 0, 0)',
      secondPieRadius: ['60%', '95%'],
      shadowOffsetX: '0',
      shadowOffsetY: '0',
    },

    visitorsPieLegend: {
      firstSection: '#FFB800',
      secondSection: '#00D4AA',
    },

    earningPie: {
      radius: ['65%', '100%'],
      center: ['50%', '50%'],

      fontSize: '22',

      firstPieGradientLeft: '#00D4AA',
      firstPieGradientRight: '#00D4AA',
      firstPieShadowColor: 'rgba(0, 0, 0, 0)',

      secondPieGradientLeft: '#0066FF',
      secondPieGradientRight: '#0066FF',
      secondPieShadowColor: 'rgba(0, 0, 0, 0)',

      thirdPieGradientLeft: '#FFB800',
      thirdPieGradientRight: '#FFB800',
      thirdPieShadowColor: 'rgba(0, 0, 0, 0)',
    },

    earningLine: {
      gradFrom: '#0066FF',
      gradTo: '#0066FF',

      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: 'normal',
      tooltipFontSize: '16',
      tooltipBg: '#1A2445',
      tooltipBorderColor: 'rgba(255, 255, 255, 0.1)',
      tooltipBorderWidth: '1',
      tooltipExtraCss: 'border-radius: 10px; padding: 4px 16px;',
    },
  },
} as NbJSThemeOptions;