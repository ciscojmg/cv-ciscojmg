export type ThemeId = 'dark' | 'light' | 'midnight' | 'purple';
export type EditorViewMode = 'preview' | 'source';

export interface Tab {
  path: string;
  name: string;
}

export interface AppState {
  tabs: Tab[];
  activeTabPath: string | null;
  sidebarVisible: boolean;
  terminalVisible: boolean;
  terminalHeight: number;
  theme: ThemeId;
  expandedFolders: Set<string>;
  commandPaletteOpen: boolean;
  quickOpenOpen: boolean;
  editorViewMode: EditorViewMode;
}

type Listener = () => void;

const MAX_TABS = 10;
const THEME_KEY = 'cv-ide-theme';
const TERMINAL_HEIGHT_KEY = 'cv-ide-terminal-height';
const VIEW_MODE_KEY = 'cv-ide-view-mode';

function loadViewMode(): EditorViewMode {
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  if (stored === 'preview' || stored === 'source') return stored;
  if (stored === 'split') return 'preview';
  return 'preview';
}

function loadTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_KEY);
  if (
    stored === 'dark' ||
    stored === 'light' ||
    stored === 'midnight' ||
    stored === 'purple'
  ) {
    return stored;
  }
  return 'purple';
}

function loadTerminalHeight(): number {
  const stored = parseInt(localStorage.getItem(TERMINAL_HEIGHT_KEY) ?? '220', 10);
  return Number.isFinite(stored) && stored >= 120 && stored <= 500 ? stored : 220;
}

let state: AppState = {
  tabs: [],
  activeTabPath: null,
  sidebarVisible: true,
  terminalVisible: false,
  terminalHeight: loadTerminalHeight(),
  theme: loadTheme(),
  expandedFolders: new Set([
    'content',
    'content/about',
    'content/skills',
    'content/experience',
  ]),
  commandPaletteOpen: false,
  quickOpenOpen: false,
  editorViewMode: loadViewMode(),
};

const listeners = new Set<Listener>();

export function getState(): Readonly<AppState> {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((l) => l());
}

export function setTheme(theme: ThemeId): void {
  state = { ...state, theme };
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  notify();
}

export function toggleSidebar(): void {
  state = { ...state, sidebarVisible: !state.sidebarVisible };
  notify();
}

export function toggleTerminal(): void {
  state = { ...state, terminalVisible: !state.terminalVisible };
  notify();
}

export function setTerminalHeight(height: number): void {
  const clamped = Math.max(120, Math.min(500, height));
  state = { ...state, terminalHeight: clamped };
  localStorage.setItem(TERMINAL_HEIGHT_KEY, String(clamped));
  notify();
}

export function toggleFolder(path: string): void {
  const next = new Set(state.expandedFolders);
  if (next.has(path)) next.delete(path);
  else next.add(path);
  state = { ...state, expandedFolders: next };
  notify();
}

export function openFile(path: string, name: string): void {
  const exists = state.tabs.find((t) => t.path === path);
  if (exists) {
    state = { ...state, activeTabPath: path };
    notify();
    return;
  }
  let tabs = [...state.tabs, { path, name }];
  if (tabs.length > MAX_TABS) tabs = tabs.slice(1);
  state = { ...state, tabs, activeTabPath: path };
  notify();
}

export function closeTab(path: string): void {
  const idx = state.tabs.findIndex((t) => t.path === path);
  if (idx === -1) return;
  const tabs = state.tabs.filter((t) => t.path !== path);
  let activeTabPath = state.activeTabPath;
  if (activeTabPath === path) {
    const next = tabs[idx] ?? tabs[idx - 1] ?? null;
    activeTabPath = next?.path ?? null;
  }
  state = { ...state, tabs, activeTabPath };
  notify();
}

export function closeActiveTab(): void {
  if (state.activeTabPath) closeTab(state.activeTabPath);
}

export function setActiveTab(path: string): void {
  if (state.tabs.some((t) => t.path === path)) {
    state = { ...state, activeTabPath: path };
    notify();
  }
}

export function setCommandPaletteOpen(open: boolean): void {
  state = { ...state, commandPaletteOpen: open, quickOpenOpen: false };
  notify();
}

export function setQuickOpenOpen(open: boolean): void {
  state = { ...state, quickOpenOpen: open, commandPaletteOpen: false };
  notify();
}

export function setEditorViewMode(mode: EditorViewMode): void {
  state = { ...state, editorViewMode: mode };
  localStorage.setItem(VIEW_MODE_KEY, mode);
  notify();
}

export function cycleEditorViewMode(): void {
  setEditorViewMode(state.editorViewMode === 'preview' ? 'source' : 'preview');
}

export function cycleTheme(): void {
  const order: ThemeId[] = ['dark', 'light', 'midnight', 'purple'];
  const idx = order.indexOf(state.theme);
  setTheme(order[(idx + 1) % order.length]!);
}

export function initState(): void {
  document.documentElement.dataset.theme = state.theme;
}
