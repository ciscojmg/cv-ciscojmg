import * as monaco from 'monaco-editor';
import { getFileContent } from '../lib/fileIndex';
import { renderMarkdown } from '../lib/markdown';
import { getMonacoTheme, THEME_LABELS } from '../lib/theme';
import { createWelcomeScreen, type WelcomeHandlers } from './WelcomeScreen';
import {
  getState,
  subscribe,
  setEditorViewMode,
  cycleTheme,
  type EditorViewMode,
} from '../state';

const VIEW_LABELS: Record<EditorViewMode, string> = {
  preview: 'Vista previa',
  source: 'Código fuente',
};

export function createEditor(
  container: HTMLElement,
  welcomeHandlers: WelcomeHandlers,
): { dispose: () => void } {
  const pane = document.createElement('div');
  pane.className = 'editor-pane';

  const toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.innerHTML = `
    <div class="editor-toolbar__modes" role="tablist" aria-label="Modo de vista">
      <button type="button" class="editor-toolbar__btn" data-mode="preview">Vista previa</button>
      <button type="button" class="editor-toolbar__btn" data-mode="source">Código fuente</button>
    </div>
    <div class="editor-toolbar__actions">
      <button type="button" class="editor-toolbar__btn editor-toolbar__btn--theme" data-action="theme" title="Cambiar tema"></button>
      <span class="editor-toolbar__hint">Solo lectura · Markdown</span>
    </div>
  `;

  const themeBtn = toolbar.querySelector('[data-action="theme"]') as HTMLButtonElement;

  const content = document.createElement('div');
  content.className = 'editor-pane__content';

  const previewWrap = document.createElement('div');
  previewWrap.className = 'markdown-preview-wrap';
  const previewEl = document.createElement('article');
  previewEl.className = 'markdown-preview';
  previewWrap.appendChild(previewEl);

  const editorEl = document.createElement('div');
  editorEl.className = 'editor-area monaco-host';

  const welcomeEl = createWelcomeScreen(welcomeHandlers);

  content.appendChild(previewWrap);
  content.appendChild(editorEl);
  pane.appendChild(toolbar);
  pane.appendChild(content);
  pane.appendChild(welcomeEl);
  container.appendChild(pane);

  const editor = monaco.editor.create(editorEl, {
    value: '',
    language: 'markdown',
    readOnly: true,
    domReadOnly: true,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    renderWhitespace: 'none',
    cursorStyle: 'line',
    contextmenu: false,
  });

  editor.updateOptions({ readOnly: true });

  toolbar.addEventListener('click', (e) => {
    const modeBtn = (e.target as HTMLElement).closest('[data-mode]');
    const mode = modeBtn?.getAttribute('data-mode') as EditorViewMode | null;
    if (mode) setEditorViewMode(mode);

    if ((e.target as HTMLElement).closest('[data-action="theme"]')) {
      cycleTheme();
    }
  });

  function applyViewMode(mode: EditorViewMode): void {
    pane.dataset.viewMode = mode;
    toolbar.querySelectorAll('[data-mode]').forEach((el) => {
      el.classList.toggle(
        'editor-toolbar__btn--active',
        el.getAttribute('data-mode') === mode,
      );
    });
    requestAnimationFrame(() => editor.layout());
  }

  function sync(): void {
    const { activeTabPath, theme, editorViewMode } = getState();
    monaco.editor.setTheme(getMonacoTheme(theme));
    applyViewMode(editorViewMode);
    themeBtn.textContent = `Tema: ${THEME_LABELS[theme]}`;

    if (!activeTabPath) {
      welcomeEl.style.display = 'flex';
      previewWrap.style.display = 'none';
      editorEl.style.display = 'none';
      toolbar.style.display = 'none';
      editor.setValue('');
      previewEl.innerHTML = '';
      return;
    }

    welcomeEl.style.display = 'none';
    toolbar.style.display = 'flex';
    const md = getFileContent(activeTabPath);

    if (md === undefined) {
      const base = import.meta.env.BASE_URL;
      previewEl.innerHTML = `
        <div class="editor-not-found">
          <img src="${base}assets/mascot/mascot-404.png" alt="Archivo no encontrado — OctoCV" class="editor-not-found__img" />
          <p class="editor-not-found__title">Archivo no encontrado</p>
          <p class="editor-not-found__path">${activeTabPath}</p>
        </div>`;
      previewWrap.style.display = 'block';
      editorEl.style.display = 'none';
      return;
    }

    previewEl.innerHTML = renderMarkdown(md, activeTabPath);

    previewWrap.style.display = editorViewMode === 'preview' ? 'block' : 'none';
    editorEl.style.display = editorViewMode === 'source' ? 'block' : 'none';

    const uri = monaco.Uri.parse(`inmemory://${activeTabPath}`);
    let existing = monaco.editor.getModel(uri);
    if (!existing) {
      existing = monaco.editor.createModel(md, 'markdown', uri);
    } else if (existing.getValue() !== md) {
      existing.setValue(md);
    }
    editor.setModel(existing);
  }

  subscribe(sync);
  sync();

  return {
    dispose: () => editor.dispose(),
  };
}

export { VIEW_LABELS };
