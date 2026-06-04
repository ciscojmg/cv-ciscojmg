export function folderIcon(): string {
  return `<svg class="tree-item__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 1.5H12.5A1.5 1.5 0 0114 6v6.5A1.5 1.5 0 0112.5 14h-9A1.5 1.5 0 012 12.5v-8z" fill="var(--icon-folder)"/>
  </svg>`;
}

export function fileIcon(): string {
  return `<svg class="tree-item__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2h5.5L13 5.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="var(--icon-file)" stroke-width="1.2" fill="none"/>
    <path d="M9 2v4h4" stroke="var(--icon-file)" stroke-width="1.2" fill="none"/>
    <path d="M5 8h6M5 10.5h4" stroke="var(--icon-file)" stroke-width="1" opacity="0.7"/>
  </svg>`;
}

export function explorerIcon(): string {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M4 6h16M4 12h10M4 18h14"/>
  </svg>`;
}

export function terminalIcon(): string {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M7 10l3 2-3 2M11 14h4"/>
  </svg>`;
}
