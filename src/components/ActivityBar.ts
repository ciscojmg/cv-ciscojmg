import { explorerIcon, terminalIcon } from '../lib/icons';
import { toggleTerminal } from '../state';

export function createActivityBar(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'activity-bar';
  el.innerHTML = `
    <button type="button" class="activity-bar__btn activity-bar__btn--active" title="Explorador" aria-label="Explorador">
      ${explorerIcon()}
    </button>
    <button type="button" class="activity-bar__btn" data-action="terminal" title="Terminal (⌘J / Ctrl+J)" aria-label="Terminal">
      ${terminalIcon()}
    </button>
  `;

  el.querySelector('[data-action="terminal"]')?.addEventListener('click', () => {
    toggleTerminal();
  });

  return el;
}
