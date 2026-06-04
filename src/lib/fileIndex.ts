export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const modules = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const fileContents = new Map<string, string>();

for (const [key, content] of Object.entries(modules)) {
  const m = key.match(/content\/(.+\.md)$/);
  if (m) fileContents.set(`content/${m[1]}`, content);
}

interface Builder {
  folders: Map<string, Builder>;
  files: FileNode[];
}

function buildTree(): FileNode[] {
  const builder: Builder = { folders: new Map(), files: [] };

  for (const filePath of [...fileContents.keys()].sort()) {
    const parts = filePath.replace(/^content\//, '').split('/');
    const fileName = parts.pop()!;
    let node = builder;

    for (const part of parts) {
      if (!node.folders.has(part)) {
        node.folders.set(part, { folders: new Map(), files: [] });
      }
      node = node.folders.get(part)!;
    }

    node.files.push({ name: fileName, path: filePath, type: 'file' });
  }

  const toNodes = (b: Builder, basePath: string): FileNode[] => {
    const folders: FileNode[] = [...b.folders.entries()]
      .sort(([a], [c]) => a.localeCompare(c))
      .map(([name, child]) => ({
        name,
        path: `${basePath}/${name}`,
        type: 'folder' as const,
        children: toNodes(child, `${basePath}/${name}`),
      }));

    const files = [...b.files].sort((a, c) => a.name.localeCompare(c.name));
    return [...folders, ...files];
  };

  return toNodes(builder, 'content');
}

let cachedTree: FileNode[] | null = null;

export function getFileTree(): FileNode[] {
  if (!cachedTree) cachedTree = buildTree();
  return cachedTree;
}

export function getFileContent(path: string): string | undefined {
  return fileContents.get(path);
}

export function getAllFiles(): { path: string; name: string }[] {
  return [...fileContents.keys()].map((path) => ({
    path,
    name: path.split('/').pop() ?? path,
  }));
}

export function listDirectory(dirPath: string): string[] {
  const normalized = dirPath.replace(/\/$/, '') || 'content';

  const findInTree = (nodes: FileNode[], target: string): FileNode | undefined => {
    for (const n of nodes) {
      if (n.path === target) return n;
      if (n.type === 'folder' && n.children) {
        const found = findInTree(n.children, target);
        if (found) return found;
      }
    }
    return undefined;
  };

  const tree = getFileTree();

  if (normalized === 'content') {
    return tree.map((c) => c.name + (c.type === 'folder' ? '/' : ''));
  }

  const folder = findInTree(tree, normalized);
  if (folder?.type === 'folder' && folder.children) {
    return folder.children.map((c) => c.name + (c.type === 'folder' ? '/' : ''));
  }

  return [];
}

export function resolveFilePath(input: string): string | null {
  const trimmed = input.trim().replace(/^\//, '');
  const candidates = [
    trimmed,
    `content/${trimmed}`,
    trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`,
    `content/${trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`}`,
  ];

  for (const c of candidates) {
    if (fileContents.has(c)) return c;
  }

  const lower = trimmed.toLowerCase();
  for (const path of fileContents.keys()) {
    if (
      path.toLowerCase() === lower ||
      path.toLowerCase().endsWith(`/${lower}`) ||
      path.toLowerCase().endsWith(`/${lower}.md`)
    ) {
      return path;
    }
  }
  return null;
}
