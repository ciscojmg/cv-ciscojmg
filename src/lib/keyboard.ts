import {
  setCommandPaletteOpen,
  setQuickOpenOpen,
  toggleSidebar,
  toggleTerminal,
  closeActiveTab,
  cycleEditorViewMode,
  getState,
} from '../state';

function isMod(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

export function initKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const inInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (isMod(e) && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      const state = getState();
      setCommandPaletteOpen(!state.commandPaletteOpen);
      return;
    }

    if (isMod(e) && e.key.toLowerCase() === 'p' && !e.shiftKey) {
      if (!inInput || target.closest('.quick-open, .command-palette')) {
        e.preventDefault();
        setQuickOpenOpen(true);
      }
      return;
    }

    if (getState().commandPaletteOpen || getState().quickOpenOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
        setQuickOpenOpen(false);
      }
      return;
    }

    if (inInput && !target.closest('.xterm')) return;

    if (isMod(e) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebar();
      return;
    }

    if (isMod(e) && e.key.toLowerCase() === 'j' && !e.shiftKey) {
      e.preventDefault();
      toggleTerminal();
      return;
    }

    if (isMod(e) && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      closeActiveTab();
      return;
    }

    if (isMod(e) && e.shiftKey && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      cycleEditorViewMode();
    }
  });
}
