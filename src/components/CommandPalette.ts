import {
  filterCommands,
  runCommand,
  getCommands,
  type Command,
} from '../lib/commands';
import { getAllFiles } from '../lib/fileIndex';
import {
  getState,
  subscribe,
  setCommandPaletteOpen,
  setQuickOpenOpen,
  openFile,
} from '../state';

export function createCommandPalette(handlers: {
  showShortcuts: () => void;
}): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'overlay overlay--hidden command-palette';
  overlay.innerHTML = `
    <div class="palette" role="dialog" aria-label="Paleta de comandos">
      <input class="palette__input" type="text" placeholder="Escribe un comando o busca archivos…" autocomplete="off" spellcheck="false" />
      <div class="palette__list"></div>
    </div>
  `;

  const input = overlay.querySelector('.palette__input') as HTMLInputElement;
  const list = overlay.querySelector('.palette__list') as HTMLElement;
  let selectedIndex = 0;
  let currentItems: Command[] = [];

  function renderList(items: Command[]): void {
    currentItems = items;
    selectedIndex = 0;
    list.innerHTML = items
      .slice(0, 20)
      .map(
        (c, i) => `
      <div class="palette__item ${i === 0 ? 'palette__item--selected' : ''}" data-id="${c.id}">
        <div class="palette__item-label">${c.label}</div>
      </div>
    `,
      )
      .join('');
  }

  function openPalette(quickOpen: boolean): void {
    overlay.classList.remove('overlay--hidden');
    input.value = '';
    input.placeholder = quickOpen
      ? 'Abrir archivo por nombre…'
      : 'Escribe un comando…';
    if (quickOpen) {
      const files = getAllFiles().map(
        (f): Command => ({
          id: `qo-${f.path}`,
          label: f.path,
          keywords: f.name,
          run: () => openFile(f.path, f.name),
        }),
      );
      renderList(files);
    } else {
      renderList(getCommands());
    }
    requestAnimationFrame(() => input.focus());
  }

  function close(): void {
    overlay.classList.add('overlay--hidden');
    setCommandPaletteOpen(false);
    setQuickOpenOpen(false);
  }

  function updateSelection(): void {
    list.querySelectorAll('.palette__item').forEach((el, i) => {
      el.classList.toggle('palette__item--selected', i === selectedIndex);
    });
    const selected = list.querySelector('.palette__item--selected');
    selected?.scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', () => {
    const state = getState();
    const q = input.value;
    if (state.quickOpenOpen) {
      const files = getAllFiles();
      const filtered = files
        .filter(
          (f) =>
            f.path.toLowerCase().includes(q.toLowerCase()) ||
            f.name.toLowerCase().includes(q.toLowerCase()),
        )
        .map(
          (f): Command => ({
            id: `qo-${f.path}`,
            label: f.path,
            run: () => openFile(f.path, f.name),
          }),
        );
      renderList(filtered);
    } else {
      renderList(filterCommands(q));
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
      updateSelection();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = currentItems[selectedIndex];
      if (item) {
        if (getState().quickOpenOpen) {
          item.run();
          close();
        } else {
          runCommand(item.id);
        }
      }
    }
  });

  list.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.palette__item');
    const id = item?.getAttribute('data-id');
    if (!id) return;
    if (getState().quickOpenOpen) {
      const cmd = currentItems.find((c) => c.id === id);
      cmd?.run();
      close();
    } else {
      runCommand(id);
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  subscribe(() => {
    const state = getState();
    if (state.commandPaletteOpen || state.quickOpenOpen) {
      openPalette(state.quickOpenOpen);
    } else {
      overlay.classList.add('overlay--hidden');
    }
  });

  const shortcutsOverlay = document.createElement('div');
  shortcutsOverlay.className = 'overlay overlay--hidden shortcuts-modal';
  shortcutsOverlay.innerHTML = `
    <div class="palette" role="dialog">
      <input class="palette__input" type="text" value="Atajos de teclado" readonly />
      <div class="palette__list">
        <div class="palette__item"><span>Paleta de comandos</span><kbd>Ctrl+Shift+P</kbd></div>
        <div class="palette__item"><span>Abrir rápido</span><kbd>Ctrl+P</kbd></div>
        <div class="palette__item"><span>Alternar barra lateral</span><kbd>Ctrl+B</kbd></div>
        <div class="palette__item"><span>Alternar terminal</span><kbd>⌘J / Ctrl+J</kbd></div>
        <div class="palette__item"><span>Cambiar tema</span><kbd>Clic en barra de estado</kbd></div>
        <div class="palette__item"><span>Cerrar pestaña</span><kbd>Ctrl+W</kbd></div>
        <div class="palette__item"><span>Cambiar vista Markdown</span><kbd>Ctrl+Shift+V</kbd></div>
      </div>
    </div>
  `;

  shortcutsOverlay.addEventListener('click', (e) => {
    if (e.target === shortcutsOverlay) shortcutsOverlay.classList.add('overlay--hidden');
  });

  shortcutsOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') shortcutsOverlay.classList.add('overlay--hidden');
  });

  handlers.showShortcuts = () => {
    shortcutsOverlay.classList.remove('overlay--hidden');
  };

  document.body.appendChild(shortcutsOverlay);

  return overlay;
}
