import { NbJSThemeOptions, DEFAULT_THEME as baseTheme } from '@nebular/theme';

const baseThemeVariables = baseTheme.variables;

export const IDENTITYPULSE_THEME = {
  name: 'identitypulse',
  base: 'default',
  variables: {
    // Primary colors from logo (adjust these to match your brand)
    temperature: {
      arcFill: ['#0066FF', '#0052CC', '#0047B3', '#003D99', '#003380'],
      arcEmpty: baseThemeVariables.bg2,
      thumbBg: '#FFFFFF',
      thumbBorder: '#0066FF',
    },

    // Override primary colors (adjust to match your logo)
    primary: '#0066FF',  // Main brand blue
    success: '#00D4AA',  // Teal accent
    info: '#00A8E6',     // Light blue
    warning: '#FFB800',  // Yellow accent
    danger: '#FF3D71',   // Red for errors

    // Background colors
    bg1: '#FFFFFF',
    bg2: '#F7F9FC',
    bg3: '#EDF1F7',
    bg4: '#E4E9F2',

    solar: {
      gradientLeft: '#0066FF',
      gradientRight: '#00D4AA',
      shadowColor: 'rgba(0, 102, 255, 0.2)',
      secondSeriesFill: baseThemeVariables.bg2,
      radius: ['70%', '90%'],
    },

    traffic: {
      tooltipBg: baseThemeVariables.bg,
      tooltipBorderColor: baseThemeVariables.border2,
      tooltipExtraCss: 'border-radius: 10px; padding: 4px 16px;',
      tooltipTextColor: baseThemeVariables.fgText,
      tooltipFontWeight: 'normal',

      yAxisSplitLine: baseThemeVariables.separator,

      lineBg: '#0066FF',
      lineShadowBlur: '0',
      itemColor: '#0066FF',
      itemBorderColor: '#0066FF',
      itemEmphasisBorderColor: '#0052CC',
      shadowLineDarkBg: 'rgba(0, 0, 0, 0)',
      shadowLineShadow: 'rgba(0, 0, 0, 0)',
      gradFrom: baseThemeVariables.bg,
      gradTo: baseThemeVariables.bg,
    },

    electricity: {
      tooltipBg: baseThemeVariables.bg,
      tooltipLineColor: baseThemeVariables.fgText,
      tooltipLineWidth: '0',
      tooltipBorderColor: baseThemeVariables.border2,
      tooltipExtraCss: 'border-radius: 10px; padding: 8px 24px;',
      tooltipTextColor: baseThemeVariables.fgText,
      tooltipFontWeight: 'normal',

      axisLineColor: baseThemeVariables.border3,
      xAxisTextColor: baseThemeVariables.fg,
      yAxisSplitLine: baseThemeVariables.separator,

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

    // Add other component theme variables as needed...
  },
} as NbJSThemeOptions;