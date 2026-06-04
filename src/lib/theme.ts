import type { ThemeId } from '../state';

export const THEME_LABELS: Record<ThemeId, string> = {
  dark: 'Cursor Dark',
  light: 'Cursor Light',
  midnight: 'Midnight',
  purple: 'Dark Purple',
};

export function getMonacoTheme(themeId: ThemeId): string {
  if (themeId === 'light') return 'vs';
  return 'vs-dark';
}

export function getXtermColors(_theme: ThemeId): {
  background: string;
  foreground: string;
  cursor: string;
  selectionBackground: string;
} {
  const styles = getComputedStyle(document.documentElement);
  return {
    background: styles.getPropertyValue('--terminal-bg').trim() || '#1e1e1e',
    foreground: styles.getPropertyValue('--terminal-fg').trim() || '#cccccc',
    cursor: styles.getPropertyValue('--terminal-cursor').trim() || '#aeafad',
    selectionBackground: styles.getPropertyValue('--terminal-selection').trim() || '#3a3d41',
  };
}
