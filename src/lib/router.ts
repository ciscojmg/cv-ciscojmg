import { getFileContent, resolveFilePath } from './fileIndex';
import { getState, openFile, subscribe } from '../state';

const basePath = normalizeBase(import.meta.env.BASE_URL);

let syncingRoute = false;

function normalizeBase(base: string): string {
  if (!base || base === '/') return '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function stripBase(pathname: string): string {
  if (basePath === '/') return pathname;
  const prefix = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  if (pathname.startsWith(prefix)) {
    const rest = pathname.slice(prefix.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

function fileNameFromPath(path: string): string {
  return path.split('/').pop() ?? path;
}

export function pathnameToFile(pathname: string): { path: string; name: string } | null {
  const route = stripBase(pathname).replace(/\/$/, '') || '/';

  if (route === '/' || route === '/README.md') {
    return resolveReadme();
  }

  const segment = route.replace(/^\//, '');
  const resolved = resolveFilePath(segment);
  if (resolved) {
    return { path: resolved, name: fileNameFromPath(resolved) };
  }

  return null;
}

function resolveReadme(): { path: string; name: string } | null {
  const readme = resolveFilePath('README.md');
  if (!readme) return null;
  return { path: readme, name: 'README.md' };
}

function missingPathFromUrl(pathname: string): { path: string; name: string } {
  const route = stripBase(pathname).replace(/\/$/, '') || '/';
  const segment = route.replace(/^\//, '') || 'desconocido';
  const path = segment.startsWith('content/')
    ? segment
    : `content/${segment.replace(/\.md$/, '')}.md`;
  return { path, name: fileNameFromPath(path) };
}

export function filePathToUrl(contentPath: string): string {
  if (contentPath === 'content/README.md') {
    return basePath === '/' ? '/' : basePath.replace(/\/$/, '');
  }

  const relative = contentPath.replace(/^content\//, '').replace(/\.md$/, '');
  if (basePath === '/') return `/${relative}`;
  return `${basePath}${relative}`.replace(/\/{2,}/g, '/');
}

export function applyRoute(pathname = window.location.pathname): void {
  syncingRoute = true;
  try {
    const file = pathnameToFile(pathname);
    if (file) {
      openFile(file.path, file.name);
      return;
    }

    const missing = missingPathFromUrl(pathname);
    openFile(missing.path, missing.name);
  } finally {
    syncingRoute = false;
  }
}

function syncUrlFromState(): void {
  if (syncingRoute) return;

  const { activeTabPath } = getState();
  if (!activeTabPath) return;

  const url = filePathToUrl(activeTabPath);
  const current = stripBase(window.location.pathname).replace(/\/$/, '') || '/';
  const target = stripBase(url).replace(/\/$/, '') || '/';

  if (current === target) return;

  syncingRoute = true;
  history.replaceState(null, '', url);
  syncingRoute = false;
}

export function initRouter(): void {
  window.addEventListener('popstate', () => applyRoute());

  subscribe(() => {
    syncUrlFromState();
  });
}

export function isMissingFile(path: string): boolean {
  return getFileContent(path) === undefined;
}
