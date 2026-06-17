import { THEME_LABELS } from '../lib/theme';
import { VIEW_LABELS } from './Editor';
import { CV_AMERICANO_FILENAME, getCvAmericanoUrl } from '../lib/cvDownload';
import {
  getState,
  subscribe,
  toggleTerminal,
  cycleEditorViewMode,
  cycleTheme,
} from '../state';

export function createStatusBar(): HTMLElement {
  const el = document.createElement('footer');
  el.className = 'status-bar';
  el.innerHTML = `
    <div class="status-bar__left">
      <span class="status-bar__item" data-action="branch">main*</span>
      <span class="status-bar__item" data-action="readonly">Solo lectura</span>
      <a
        class="status-bar__item status-bar__item--action status-bar__link"
        href="${getCvAmericanoUrl()}"
        download="${CV_AMERICANO_FILENAME}"
        title="Descargar CV en PDF (formato americano)"
      >CV PDF</a>
    </div>
    <div class="status-bar__right">
      <span class="status-bar__item" data-action="file"></span>
      <span class="status-bar__item" data-action="view" title="Clic para alternar vista previa / código"></span>
      <span class="status-bar__item status-bar__item--action" data-action="terminal" title="Alternar terminal (⌘J / Ctrl+J)">Terminal</span>
      <span class="status-bar__item status-bar__item--action" data-action="theme" title="Clic para cambiar tema"></span>
    </div>
  `;

  function render(): void {
    const state = getState();
    const fileEl = el.querySelector('[data-action="file"]')!;
    const themeEl = el.querySelector('[data-action="theme"]')!;
    const viewEl = el.querySelector('[data-action="view"]')!;
    const terminalEl = el.querySelector('[data-action="terminal"]')!;

    viewEl.textContent = VIEW_LABELS[state.editorViewMode];
    themeEl.textContent = THEME_LABELS[state.theme];
    terminalEl.classList.toggle(
      'status-bar__item--active',
      state.terminalVisible,
    );

    if (state.activeTabPath) {
      fileEl.textContent = state.activeTabPath;
    } else {
      fileEl.textContent = 'Sin archivo abierto';
    }
  }

  el.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('[data-action]');
    const action = item?.getAttribute('data-action');
    if (action === 'terminal') toggleTerminal();
    if (action === 'theme') cycleTheme();
    if (action === 'view') cycleEditorViewMode();
  });

  subscribe(render);
  render();

  return el;
}
