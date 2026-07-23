import { defineTheme } from '@astryxdesign/core/theme';
import { gothicTheme } from '@astryxdesign/theme-gothic';

/**
 * Gothic, extended with the same small portfolio touches as the other
 * themes: a glow on the primary CTA and monospace/lowercase badges.
 * Palette, type (Fustat body/headings, Manufacturing Consent on display
 * sizes only), radius, and motion stay stock. Dark-only by design.
 */
const DISPLAY_FONT =
  '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif';

export const gothicPortfolioTheme = defineTheme({
  name: 'gothic-portfolio',
  extends: gothicTheme,
  components: {
    button: {
      'variant:primary': {
        boxShadow: '0 10px 32px -10px var(--color-accent-muted)',
      },
    },
    badge: {
      base: {
        fontFamily: 'var(--font-family-code)',
        textTransform: 'lowercase',
      },
    },
    // Stock gothic only overrides the `text` component's display types;
    // Heading is a separate component with its own override key, and our
    // hero/contact headlines render through Heading, so mirror it here.
    heading: {
      'type:display-1': { fontFamily: DISPLAY_FONT },
      'type:display-2': { fontFamily: DISPLAY_FONT },
      'type:display-3': { fontFamily: DISPLAY_FONT },
    },
  },
});
