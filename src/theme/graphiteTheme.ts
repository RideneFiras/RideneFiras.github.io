import { defineTheme } from '@astryxdesign/core/theme';

const SYSTEM_FALLBACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Graphite — a custom Astryx theme for firasridene.tech.
 * Vivid violet accent on a near-black graphite base, self-hosted display
 * type (Archivo), and a larger geometric scale so headlines carry weight.
 */
export const graphiteTheme = defineTheme({
  name: 'graphite',

  color: {
    accent: '#6C4CFF',
    neutralStyle: 'cool',
    contrast: 'high',
  },

  typography: {
    scale: { base: 16, ratio: 1.26 },
    heading: { family: 'Archivo', fallbacks: SYSTEM_FALLBACK, weight: '800' },
    body: { family: 'Instrument Sans', fallbacks: SYSTEM_FALLBACK },
    code: { family: 'IBM Plex Mono', fallbacks: '"SF Mono", Monaco, Consolas, monospace' },
  },

  radius: { base: 8, multiplier: 1.5 },

  motion: { fast: 140, medium: 320, ratio: 0.72 },

  tokens: {
    '--color-background-body': ['#F6F5F2', '#08090B'],
    '--color-background-surface': ['#FFFFFF', '#0F1013'],
    '--color-background-card': ['#FFFFFF', '#131418'],
    '--color-background-muted': ['#EFEDE8', '#16171C'],
    '--color-border': ['#E4E1D9', '#232429'],
    '--color-border-emphasized': ['#CFCBC0', '#33353C'],
    '--color-accent-muted': ['#6C4CFF26', '#9B82FF2E'],
  },

  components: {
    button: {
      base: {
        fontWeight: 'var(--font-weight-bold)',
      },
      'variant:primary': {
        boxShadow: '0 8px 24px -8px var(--color-accent)',
      },
    },
    card: {
      base: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      },
    },
    badge: {
      base: {
        fontFamily: 'var(--font-family-code)',
        textTransform: 'lowercase',
      },
    },
    'top-nav': {
      base: {
        backdropFilter: 'blur(16px)',
      },
    },
  },
});
