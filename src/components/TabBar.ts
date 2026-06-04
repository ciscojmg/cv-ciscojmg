import { getState, subscribe, setActiveTab, closeTab } from '../state';

export function createTabBar(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'tab-bar';

  function render(): void {
    const { tabs, activeTabPath } = getState();
    el.innerHTML = tabs
      .map(
        (tab) => `
      <div class="tab ${tab.path === activeTabPath ? 'tab--active' : ''}" data-path="${tab.path}">
        <span class="tab__name">${tab.name}</span>
        <button type="button" class="tab__close" aria-label="Cerrar" data-close="${tab.path}">×</button>
      </div>
    `,
      )
      .join('');
  }

  el.addEventListener('click', (e) => {
    const closeBtn = (e.target as HTMLElement).closest('[data-close]');
    if (closeBtn) {
      e.stopPropagation();
      closeTab(closeBtn.getAttribute('data-close')!);
      return;
    }
    const tab = (e.target as HTMLElement).closest('.tab') as HTMLElement | null;
    if (tab?.dataset.path) setActiveTab(tab.dataset.path);
  });

  subscribe(render);
  render();

  return el;
}
