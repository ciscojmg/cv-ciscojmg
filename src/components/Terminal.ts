import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { executeCommand } from '../lib/shell';
import { getXtermColors } from '../lib/theme';
import {
  getState,
  subscribe,
  setTheme,
  openFile,
  setTerminalHeight,
  toggleTerminal,
  type ThemeId,
} from '../state';

const PROMPT = '\r\n\x1b[32mguest\x1b[0m@\x1b[36mcv-ciscojmg\x1b[0m:\x1b[33m~\x1b[0m$ ';

export function createTerminalPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'terminal-panel terminal-panel--hidden';
  panel.innerHTML = `
    <div class="terminal-panel__resize" title="Redimensionar"></div>
    <div class="terminal-panel__header">
      <span>TERMINAL</span>
      <button type="button" class="terminal-panel__close" aria-label="Cerrar">×</button>
    </div>
    <div class="terminal-panel__body"></div>
  `;

  const body = panel.querySelector('.terminal-panel__body') as HTMLElement;
  const resizeHandle = panel.querySelector('.terminal-panel__resize') as HTMLElement;

  const term = new Terminal({
    cursorBlink: true,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    scrollback: 500,
    convertEol: true,
  });

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(body);

  let history: string[] = [];
  let historyIndex = -1;
  let currentLine = '';

  function applyTheme(): void {
    const colors = getXtermColors(getState().theme);
    term.options.theme = colors;
  }

  function writeln(text: string): void {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (i === 0) term.writeln(line);
      else term.write(`\r\n${line}`);
    });
  }

  function writePrompt(): void {
    term.write(PROMPT);
  }

  const ctx = {
    writeln: (t: string) => writeln(t),
    write: (t: string) => term.write(t),
    clear: () => term.clear(),
    openFile: (path: string) => {
      const name = path.split('/').pop() ?? path;
      openFile(path, name);
    },
    setTheme: (t: ThemeId) => setTheme(t),
  };

  function processLine(line: string): void {
    executeCommand(line, ctx);
    writePrompt();
  }

  term.writeln('Bienvenido al workspace de cv-ciscojmg (solo lectura).');
  term.writeln("Escribe 'help' para ver comandos.");
  writePrompt();

  term.onData((data) => {
    const code = data.charCodeAt(0);

    if (code === 13) {
      term.write('\r\n');
      const line = currentLine.trim();
      if (line) {
        history.push(line);
        historyIndex = history.length;
        processLine(line);
      } else {
        writePrompt();
      }
      currentLine = '';
      return;
    }

    if (code === 127) {
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        term.write('\b \b');
      }
      return;
    }

    if (data === '\x1b[A') {
      if (historyIndex > 0) {
        historyIndex--;
        while (currentLine.length > 0) {
          term.write('\b \b');
          currentLine = currentLine.slice(0, -1);
        }
        currentLine = history[historyIndex] ?? '';
        term.write(currentLine);
      }
      return;
    }

    if (data === '\x1b[B') {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        while (currentLine.length > 0) {
          term.write('\b \b');
          currentLine = currentLine.slice(0, -1);
        }
        currentLine = history[historyIndex] ?? '';
        term.write(currentLine);
      }
      return;
    }

    if (code >= 32) {
      currentLine += data;
      term.write(data);
    }
  });

  function fit(): void {
    try {
      fitAddon.fit();
    } catch {
      /* panel hidden */
    }
  }

  function render(): void {
    const state = getState();
    panel.classList.toggle('terminal-panel--hidden', !state.terminalVisible);
    panel.style.height = `${state.terminalHeight}px`;
    applyTheme();
    if (state.terminalVisible) {
      requestAnimationFrame(fit);
    }
  }

  subscribe(render);
  render();

  panel.querySelector('.terminal-panel__close')?.addEventListener('click', () => {
    toggleTerminal();
  });

  let resizing = false;
  let startY = 0;
  let startH = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    resizing = true;
    startY = e.clientY;
    startH = getState().terminalHeight;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    const delta = startY - e.clientY;
    setTerminalHeight(startH + delta);
    fit();
  });

  document.addEventListener('mouseup', () => {
    resizing = false;
  });

  window.addEventListener('resize', fit);

  return panel;
}
