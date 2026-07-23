import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useThemeMode } from '../theme-mode';
import { SunIcon, MoonIcon } from './icons';

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  return (
    <IconButton
      label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      tooltip={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      variant="ghost"
      icon={<Icon icon={mode === 'dark' ? SunIcon : MoonIcon} />}
      onClick={toggle}
    />
  );
}
