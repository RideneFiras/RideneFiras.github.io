import { Theme } from '@astryxdesign/core/theme';
import { gothicPortfolioTheme } from './theme/gothicPortfolioTheme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavItem, TopNavHeading } from '@astryxdesign/core/TopNav';
import { ThemeModeProvider, useThemeMode } from './theme-mode';
import { ThemeToggle } from './components/ThemeToggle';
import { Spotlight } from './components/Spotlight';
import { TechMarquee } from './components/TechMarquee';
import { Reveal } from './components/Reveal';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Work } from './components/Work';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { SiteFooter } from './components/SiteFooter';

const NAV_LINKS = [
  { href: '#about', label: 'about' },
  { href: '#work', label: 'work' },
  { href: '#experience', label: 'experience' },
  { href: '#contact', label: 'contact' },
];

// Gothic is a dark-only theme (single-value tokens, no light variant),
// so the mode toggle has nothing to switch — pin to dark and hide it.
const ACTIVE_THEME = gothicPortfolioTheme;
const THEME_IS_DARK_ONLY = true;

function ThemedApp() {
  const { mode } = useThemeMode();

  return (
    <Theme theme={ACTIVE_THEME} mode={THEME_IS_DARK_ONLY ? 'dark' : mode}>
      <Spotlight />
      <AppShell
        variant="elevated"
        height="auto"
        contentPadding={0}
        topNav={
          <TopNav
            heading={<TopNavHeading heading="FR·" headingHref="#top" />}
            endContent={THEME_IS_DARK_ONLY ? undefined : <ThemeToggle />}
          >
            {NAV_LINKS.map((link) => (
              <TopNavItem key={link.href} href={link.href} label={link.label} />
            ))}
          </TopNav>
        }
      >
        <div id="top">
          <div className="page-container">
            <Hero />
          </div>
          <TechMarquee />
          <div className="page-container">
            <Reveal>
              <About />
            </Reveal>
            <Reveal>
              <Work />
            </Reveal>
            <Reveal>
              <Experience />
            </Reveal>
            <Reveal>
              <Contact />
            </Reveal>
            <SiteFooter />
          </div>
        </div>
      </AppShell>
    </Theme>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}
