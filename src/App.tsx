import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavItem, TopNavHeading } from '@astryxdesign/core/TopNav';
import { ThemeModeProvider, useThemeMode } from './theme-mode';
import { ThemeToggle } from './components/ThemeToggle';
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

function ThemedApp() {
  const { mode } = useThemeMode();

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <AppShell
        variant="wash"
        height="auto"
        contentPadding={0}
        topNav={
          <TopNav
            heading={<TopNavHeading heading="FR·" headingHref="#top" />}
            endContent={<ThemeToggle />}
          >
            {NAV_LINKS.map((link) => (
              <TopNavItem key={link.href} href={link.href} label={link.label} />
            ))}
          </TopNav>
        }
      >
        <div id="top" className="page-container">
          <Hero />
          <About />
          <Work />
          <Experience />
          <Contact />
          <SiteFooter />
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
