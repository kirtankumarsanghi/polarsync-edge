import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        polar: {
          bg: '#071018',
          panel: '#0d1a25',
          panel2: '#102230',
          line: '#1e3444',
          cyan: '#52d6e8',
          green: '#63e6a5',
          amber: '#ffc857',
          red: '#ff6b6b',
          blue: '#79a7ff',
          muted: '#8da5b3',
          text: '#edf7fb',
        },
        "on-surface":"#edf7fb","on-tertiary-fixed":"#ffeaaf","inverse-primary":"#000309","outline":"#8da5b3","on-secondary-container":"#6ffbbe","surface-container-highest":"#1e3444","error-container":"#93000a","on-secondary-fixed-variant":"#005236","background":"#071018","on-error-container":"#ffdad6","primary-container":"#004b73","surface-variant":"#102230","on-surface-variant":"#8da5b3","error":"#ff6b6b","on-primary-fixed-variant":"#004b73","surface-dim":"#071018","surface-container-lowest":"#03070a","on-primary-container":"#cce5ff","tertiary-fixed":"#ffc857","secondary-container":"#005236","on-tertiary-fixed-variant":"#564400","on-secondary-fixed":"#003822","surface-tint":"#52d6e8","surface":"#071018","on-tertiary":"#3a2c00","inverse-on-surface":"#071018","surface-bright":"#102230","inverse-surface":"#edf7fb","on-error":"#410002","on-background":"#edf7fb","on-primary-fixed":"#001d31","primary-fixed-dim":"#004b73","surface-container":"#0d1a25","secondary-fixed-dim":"#005236","secondary":"#63e6a5","outline-variant":"#1e3444","tertiary-container":"#564400","tertiary":"#ffc857","secondary-fixed":"#6ffbbe","surface-container-low":"#102230","tertiary-fixed-dim":"#564400","surface-container-high":"#1e3444","primary-fixed":"#52d6e8","on-tertiary-container":"#ffeaaf","primary":"#52d6e8","on-primary":"#071018","on-secondary":"#003822"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        "space-sm":"0.5rem","space-2xl":"2rem","cell-padding-x":"0.5rem","cell-padding-y":"0.375rem","space-xl":"1.5rem","space-2xs":"0.125rem","space-xs":"0.25rem","space-md":"0.75rem","panel-gap":"0.5rem","space-lg":"1rem"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        "label-code":["JetBrains Mono"],"headline-xl-mobile":["Inter"],"body-lg":["Inter"],"terminal-stream":["JetBrains Mono"],"headline-md":["Inter"],"metric-display":["JetBrains Mono"],"headline-lg":["Inter"],"micro-caption":["Inter"],"telemetry-data":["JetBrains Mono"],"body-sm":["Inter"],"body-md":["Inter"],"headline-xl":["Inter"]
      },
      fontSize: {
        "label-code":["11px",{"lineHeight":"14px","letterSpacing":"0.04em","fontWeight":"600"}],"headline-xl-mobile":["24px",{"lineHeight":"30px","letterSpacing":"-0.015em","fontWeight":"700"}],"body-lg":["14px",{"lineHeight":"20px","letterSpacing":"-0.005em","fontWeight":"500"}],"terminal-stream":["11px",{"lineHeight":"15px","fontWeight":"400"}],"headline-md":["16px",{"lineHeight":"22px","letterSpacing":"-0.1em","fontWeight":"600"}],"metric-display":["28px",{"lineHeight":"32px","letterSpacing":"-0.03em","fontWeight":"600"}],"headline-lg":["22px",{"lineHeight":"28px","letterSpacing":"-0.015em","fontWeight":"600"}],"micro-caption":["10px",{"lineHeight":"12px","letterSpacing":"0.05em","fontWeight":"600"}],"telemetry-data":["13px",{"lineHeight":"16px","letterSpacing":"-0.01em","fontWeight":"500"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"body-md":["13px",{"lineHeight":"18px","fontWeight":"400"}],"headline-xl":["32px",{"lineHeight":"38px","letterSpacing":"-0.02em","fontWeight":"700"}]
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
    },
  },
  plugins: [],
};

export default config;
