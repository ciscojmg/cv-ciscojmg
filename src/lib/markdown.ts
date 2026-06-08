import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { resolveImageSrc } from './assets';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(html: string, markdownPath: string): string {
  const renderer = new marked.Renderer();

  renderer.image = ({ href, title, text }) => {
    const src = href ? resolveImageSrc(href, markdownPath) : '';
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy" />`;
  };

  renderer.link = ({ href, title, text }) => {
    const h = href ?? '#';
    const external = /^https?:/i.test(h);
    const rel = external ? ' rel="noopener noreferrer" target="_blank"' : '';
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    return `<a href="${escapeAttr(h)}"${titleAttr}${rel}>${text}</a>`;
  };

  const raw = marked.parse(html, { renderer, async: false }) as string;

  const sanitized = DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel', 'class', 'loading', 'viewBox', 'fill', 'stroke', 'stroke-width', 'opacity', 'xmlns', 'width', 'height', 'd'],
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'del', 'code', 'pre', 'blockquote', 'kbd',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'section', 'header', 'aside', 'article',
      'figure', 'figcaption',
      'svg', 'path',
    ],
  });

  return fixPublicAssetUrls(sanitized);
}

function fixPublicAssetUrls(html: string): string {
  const base = import.meta.env.BASE_URL;
  return html
    .replace(/src="\/([^"]+)"/g, `src="${base}$1"`)
    .replace(/href="\/([^"]+)"/g, `href="${base}$1"`);
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
