import {
  getFileContent,
  listDirectory,
  resolveFilePath,
  getAllFiles,
} from './fileIndex';
import type { ThemeId } from '../state';

export interface ShellContext {
  writeln: (text: string) => void;
  write: (text: string) => void;
  clear: () => void;
  openFile: (path: string) => void;
  setTheme: (theme: ThemeId) => void;
}

export function executeCommand(line: string, ctx: ShellContext): void {
  const trimmed = line.trim();
  if (!trimmed) return;

  const [cmd, ...args] = trimmed.split(/\s+/);
  const argStr = args.join(' ');

  switch (cmd.toLowerCase()) {
    case 'help':
      ctx.writeln('Comandos disponibles:');
      ctx.writeln('  help              — muestra esta ayuda');
      ctx.writeln('  ls [path]         — lista archivos');
      ctx.writeln('  cat <file>        — muestra contenido');
      ctx.writeln('  open <file>       — abre en el editor');
      ctx.writeln('  theme <tema>      — dark | light | midnight | purple');
      ctx.writeln('  clear             — limpia la terminal');
      ctx.writeln('  whoami            — ¿quién eres?');
      ctx.writeln('  pwd               — directorio actual');
      ctx.writeln('  files             — lista todos los .md');
      break;

    case 'pwd':
      ctx.writeln('/workspace');
      break;

    case 'whoami':
      ctx.writeln('guest@cv-ciscojmg — visitante del workspace (solo lectura)');
      break;

    case 'clear':
      ctx.clear();
      break;

    case 'ls': {
      const dir = argStr || 'content';
      const resolved = dir === '/' || dir === '~' ? 'content' : dir.replace(/^\//, '');
      const entries = listDirectory(resolved);
      if (entries.length === 0) {
        ctx.writeln(`ls: no se encontró '${dir}' o está vacío`);
      } else {
        ctx.writeln(entries.join('  '));
      }
      break;
    }

    case 'cat': {
      if (!argStr) {
        ctx.writeln('cat: falta archivo');
        break;
      }
      const path = resolveFilePath(argStr);
      if (!path) {
        ctx.writeln(`cat: ${argStr}: No existe`);
        break;
      }
      const content = getFileContent(path);
      ctx.writeln(content ?? '');
      break;
    }

    case 'open': {
      if (!argStr) {
        ctx.writeln('open: falta archivo');
        break;
      }
      const path = resolveFilePath(argStr);
      if (!path) {
        ctx.writeln(`open: ${argStr}: No existe`);
        break;
      }
      ctx.openFile(path);
      ctx.writeln(`Abierto: ${path}`);
      break;
    }

    case 'theme': {
      const t = argStr.toLowerCase();
      if (t === 'dark' || t === 'light' || t === 'midnight' || t === 'purple') {
        ctx.setTheme(t);
        ctx.writeln(`Tema: ${t}`);
      } else {
        ctx.writeln('theme: usa dark, light, midnight o purple');
      }
      break;
    }

    case 'files':
      getAllFiles().forEach((f) => ctx.writeln(f.path));
      break;

    default:
      ctx.writeln(`${cmd}: comando no encontrado. Escribe 'help'.`);
  }
}
