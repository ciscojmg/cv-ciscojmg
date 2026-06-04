import {
  setTheme,
  toggleSidebar,
  toggleTerminal,
  closeActiveTab,
  openFile,
  setCommandPaletteOpen,
  setQuickOpenOpen,
  setEditorViewMode,
  cycleEditorViewMode,
  cycleTheme,
  type ThemeId,
} from '../state';
import { resolveFilePath, getAllFiles } from './fileIndex';
import { THEME_LABELS } from './theme';

export interface Command {
  id: string;
  label: string;
  keywords?: string;
  run: () => void;
}

let commandList: Command[] = [];

export function registerCommands(handlers: {
  showShortcuts: () => void;
}): void {
  const themes: ThemeId[] = ['dark', 'light', 'midnight', 'purple'];

  commandList = [
    {
      id: 'open-readme',
      label: 'Archivo: Abrir README.md',
      keywords: 'readme inicio welcome',
      run: () => {
        const path = resolveFilePath('README.md');
        if (path) openFile(path, 'README.md');
      },
    },
    {
      id: 'toggle-sidebar',
      label: 'Vista: Alternar barra lateral',
      keywords: 'sidebar explorador',
      run: () => toggleSidebar(),
    },
    {
      id: 'toggle-terminal',
      label: 'Vista: Alternar terminal',
      keywords: 'terminal consola',
      run: () => toggleTerminal(),
    },
    {
      id: 'view-preview',
      label: 'Markdown: Vista previa',
      keywords: 'preview render markdown',
      run: () => setEditorViewMode('preview'),
    },
    {
      id: 'view-source',
      label: 'Markdown: Código fuente',
      keywords: 'source raw markdown',
      run: () => setEditorViewMode('source'),
    },
    {
      id: 'view-cycle',
      label: 'Markdown: Alternar vista previa / código',
      keywords: 'preview source toggle',
      run: () => cycleEditorViewMode(),
    },
    {
      id: 'theme-cycle',
      label: 'Preferencias: Cambiar tema',
      keywords: 'theme tema dark light midnight purple morado',
      run: () => cycleTheme(),
    },
    {
      id: 'close-tab',
      label: 'Pestaña: Cerrar activa',
      keywords: 'close tab',
      run: () => closeActiveTab(),
    },
    {
      id: 'quick-open',
      label: 'Archivo: Abrir rápido…',
      keywords: 'quick open goto',
      run: () => setQuickOpenOpen(true),
    },
    {
      id: 'shortcuts',
      label: 'Ayuda: Mostrar atajos de teclado',
      keywords: 'keyboard shortcuts',
      run: () => handlers.showShortcuts(),
    },
    ...themes.map(
      (t): Command => ({
        id: `theme-${t}`,
        label: `Preferencias: Tema — ${THEME_LABELS[t]}`,
        keywords: `theme tema ${t}`,
        run: () => setTheme(t),
      }),
    ),
    ...getAllFiles().map(
      (f): Command => ({
        id: `open-${f.path}`,
        label: `Archivo: Abrir ${f.name}`,
        keywords: f.path,
        run: () => openFile(f.path, f.name),
      }),
    ),
  ];
}

export function getCommands(): Command[] {
  return commandList;
}

export function filterCommands(query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commandList;
  return commandList.filter((c) => {
    const haystack = `${c.label} ${c.keywords ?? ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function runCommand(id: string): void {
  const cmd = commandList.find((c) => c.id === id);
  cmd?.run();
  setCommandPaletteOpen(false);
  setQuickOpenOpen(false);
}
