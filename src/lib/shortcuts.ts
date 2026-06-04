export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function modLabel(): string {
  return isMac ? '⌘' : 'Ctrl';
}

export interface ShortcutEntry {
  id: string;
  label: string;
  keys: string[];
  clickable?: boolean;
}

export function getWelcomeShortcuts(): ShortcutEntry[] {
  const mod = modLabel();
  const shift = isMac ? '⇧' : 'Shift';

  return [
    { id: 'quick-open', label: 'Ir al archivo', keys: [mod, 'P'], clickable: true },
    { id: 'command-palette', label: 'Paleta de comandos', keys: [shift, mod, 'P'], clickable: true },
    { id: 'toggle-terminal', label: 'Alternar terminal', keys: [mod, 'J'], clickable: true },
    { id: 'toggle-sidebar', label: 'Alternar explorador', keys: [mod, 'B'], clickable: true },
    { id: 'open-readme', label: 'Abrir README.md', keys: ['Clic'], clickable: true },
    { id: 'cycle-theme', label: 'Cambiar tema', keys: ['Clic', 'estado'], clickable: true },
    { id: 'cycle-view', label: 'Vista previa / código', keys: [shift, mod, 'V'], clickable: true },
    { id: 'close-tab', label: 'Cerrar pestaña', keys: [mod, 'W'] },
    { id: 'shortcuts-help', label: 'Ver todos los atajos', keys: ['Clic'], clickable: true },
  ];
}

export function renderKeyChips(keys: string[]): string {
  return keys
    .map((k) => `<kbd class="welcome-kbd">${escapeHtml(k)}</kbd>`)
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
