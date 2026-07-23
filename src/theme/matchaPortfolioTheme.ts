import { defineTheme } from '@astryxdesign/core/theme';
import { matchaTheme } from '@astryxdesign/theme-matcha';

/**
 * Matcha, extended with a couple of small portfolio-specific touches:
 * a glow on the primary CTA and monospace/lowercase badges. Everything
 * else (palette, type, radius, motion) is the stock Astryx Matcha theme.
 */
export const matchaPortfolioTheme = defineTheme({
  name: 'matcha-portfolio',
  extends: matchaTheme,
  components: {
    button: {
      'variant:primary': {
        boxShadow: '0 10px 28px -10px var(--color-accent)',
      },
    },
    badge: {
      base: {
        fontFamily: 'var(--font-family-code)',
        textTransform: 'lowercase',
      },
    },
  },
});
