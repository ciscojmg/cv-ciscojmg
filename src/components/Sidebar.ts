import { getFileTree, type FileNode } from '../lib/fileIndex';
import { folderIcon, fileIcon } from '../lib/icons';
import {
  getState,
  subscribe,
  toggleFolder,
  openFile,
} from '../state';

export function createSidebar(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'sidebar';
  el.innerHTML = `
    <div class="sidebar__header">Explorador</div>
    <div class="sidebar__tree" role="tree"></div>
  `;

  const treeEl = el.querySelector('.sidebar__tree')!;

  function renderTreeItem(node: FileNode, depth: number): string {
    const state = getState();
    const indent = depth * 12 + 8;

    if (node.type === 'folder') {
      const expanded = state.expandedFolders.has(node.path);
      const chevron = expanded ? '▼' : '▶';
      const children = expanded && node.children
        ? node.children.map((c) => renderTreeItem(c, depth + 1)).join('')
        : '';

      return `
        <div class="tree-item tree-item--folder" data-path="${node.path}" data-type="folder" style="padding-left:${indent}px">
          <span class="tree-item__chevron">${chevron}</span>
          ${folderIcon()}
          <span class="tree-item__label">${node.name}</span>
        </div>
        ${children}
      `;
    }

    const active = state.activeTabPath === node.path;
    return `
      <div class="tree-item tree-item--file ${active ? 'tree-item--active' : ''}" data-path="${node.path}" data-type="file" style="padding-left:${indent + 16}px">
        ${fileIcon()}
        <span class="tree-item__label">${node.name}</span>
      </div>
    `;
  }

  function render(): void {
    const state = getState();
    el.classList.toggle('sidebar--hidden', !state.sidebarVisible);
    const tree = getFileTree();
    treeEl.innerHTML = tree.map((n) => renderTreeItem(n, 0)).join('');
  }

  treeEl.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.tree-item') as HTMLElement | null;
    if (!item) return;
    const path = item.dataset.path!;
    const type = item.dataset.type;

    if (type === 'folder') {
      toggleFolder(path);
      return;
    }

    const name = path.split('/').pop() ?? path;
    openFile(path, name);
  });

  subscribe(render);
  render();

  return el;
}
