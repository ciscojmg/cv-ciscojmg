import './styles/themes.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/markdown.css';
import './styles/welcome.css';

import { createActivityBar } from './components/ActivityBar';
import { createSidebar } from './components/Sidebar';
import { createTabBar } from './components/TabBar';
import { createEditor } from './components/Editor';
import { createTerminalPanel } from './components/Terminal';
import { createStatusBar } from './components/StatusBar';
import { createCommandPalette } from './components/CommandPalette';
import { registerCommands } from './lib/commands';
import { initKeyboard } from './lib/keyboard';
import { resolveFilePath, getFileTree } from './lib/fileIndex';
import { initState, openFile } from './state';

export function mountApp(root: HTMLElement): void {
  initState();

  const paletteHandlers = {
    showShortcuts: () => {},
  };

  registerCommands(paletteHandlers);

  root.innerHTML = `
    <div class="ide">
      <div class="ide-body">
        <div class="ide-body__left"></div>
        <main class="main">
          <div class="main__tabs"></div>
          <div class="main__editor"></div>
          <div class="main__terminal"></div>
        </main>
      </div>
    </div>
  `;

  const leftSlot = root.querySelector('.ide-body__left') as HTMLElement;
  const tabsSlot = root.querySelector('.main__tabs') as HTMLElement;
  const editorSlot = root.querySelector('.main__editor') as HTMLElement;
  const terminalSlot = root.querySelector('.main__terminal') as HTMLElement;

  leftSlot.appendChild(createActivityBar());
  leftSlot.appendChild(createSidebar());
  tabsSlot.appendChild(createTabBar());

  const editorWrap = document.createElement('div');
  editorWrap.style.flex = '1';
  editorWrap.style.minHeight = '0';
  editorWrap.style.display = 'flex';
  editorWrap.style.flexDirection = 'column';
  editorSlot.appendChild(editorWrap);
  createEditor(editorWrap, paletteHandlers);

  terminalSlot.appendChild(createTerminalPanel());

  const statusBar = createStatusBar();
  root.querySelector('.ide')!.appendChild(statusBar);

  const palette = createCommandPalette(paletteHandlers);
  paletteHandlers.showShortcuts = () => {
    document.querySelector('.shortcuts-modal')?.classList.remove('overlay--hidden');
  };
  document.body.appendChild(palette);

  initKeyboard();

  const readme = resolveFilePath('README.md');
  if (readme) {
    openFile(readme, 'README.md');
  } else {
    const tree = getFileTree();
    const first = findFirstFile(tree);
    if (first) openFile(first.path, first.name);
  }
}

function findFirstFile(
  nodes: ReturnType<typeof getFileTree>,
): { path: string; name: string } | null {
  for (const n of nodes) {
    if (n.type === 'file') return { path: n.path, name: n.name };
    if (n.children) {
      const found = findFirstFile(n.children);
      if (found) return found;
    }
  }
  return null;
}
