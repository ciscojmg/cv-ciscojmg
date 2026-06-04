import { getWelcomeShortcuts, renderKeyChips } from '../lib/shortcuts';
import { resolveFilePath } from '../lib/fileIndex';
import {
  setQuickOpenOpen,
  setCommandPaletteOpen,
  toggleTerminal,
  toggleSidebar,
  openFile,
  cycleTheme,
  cycleEditorViewMode,
} from '../state';

export type WelcomeHandlers = {
  showShortcuts: () => void;
};

export function createWelcomeScreen(handlers: WelcomeHandlers): HTMLElement {
  const el = document.createElement('div');
  el.className = 'editor-welcome';

  const shortcuts = getWelcomeShortcuts();
  const rows = shortcuts
    .map(
      (s) => `
    <button type="button" class="welcome-row ${s.clickable ? 'welcome-row--clickable' : 'welcome-row--static'}" data-action="${s.id}" ${s.clickable ? '' : 'tabindex="-1"'}>
      <span class="welcome-row__label">${s.label}</span>
      <span class="welcome-row__keys">${renderKeyChips(s.keys)}</span>
    </button>
  `,
    )
    .join('');

  el.innerHTML = `
    <div class="welcome-inner">
      <div class="welcome-logo" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" stroke="currentColor" stroke-width="2" opacity="0.35"/>
          <path d="M32 16l14 8v16L32 48 18 40V24l14-8-14-8z" fill="currentColor" opacity="0.2"/>
          <path d="M28 26h12v4H28v-4zm0 8h8v4h-8v-4z" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>
      <p class="welcome-title">cv-ciscojmg</p>
      <p class="welcome-subtitle">Workspace de solo lectura · selecciona un archivo o usa un atajo</p>
      <div class="welcome-shortcuts" role="list">${rows}</div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!row?.classList.contains('welcome-row--clickable')) return;

    const action = row.getAttribute('data-action');
    switch (action) {
      case 'quick-open':
        setQuickOpenOpen(true);
        break;
      case 'command-palette':
        setCommandPaletteOpen(true);
        break;
      case 'toggle-terminal':
        toggleTerminal();
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'open-readme': {
        const path = resolveFilePath('README.md');
        if (path) openFile(path, 'README.md');
        break;
      }
      case 'cycle-theme':
        cycleTheme();
        break;
      case 'cycle-view':
        cycleEditorViewMode();
        break;
      case 'shortcuts-help':
        handlers.showShortcuts();
        break;
    }
  });

  return el;
}
