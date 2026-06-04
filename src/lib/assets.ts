const imageModules = import.meta.glob('../../content/**/*.{png,jpg,jpeg,gif,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const imageUrls = new Map<string, string>();

for (const [key, url] of Object.entries(imageModules)) {
  const m = key.match(/content\/(.+)$/);
  if (m) imageUrls.set(`content/${m[1]}`, url);
}

/** Resuelve rutas de imagen en Markdown (relativas al .md o absolutas desde public/). */
export function resolveImageSrc(src: string, markdownPath: string): string {
  const trimmed = src.trim();
  if (!trimmed) return '';

  if (/^(https?:|data:|mailto:)/i.test(trimmed)) return trimmed;

  const base = import.meta.env.BASE_URL;

  if (trimmed.startsWith('/')) {
    const publicPath = trimmed.slice(1);
    return `${base}${publicPath}`;
  }

  const mdDir = markdownPath.includes('/')
    ? markdownPath.split('/').slice(0, -1).join('/')
    : 'content';

  const relative = trimmed.replace(/^\.\//, '');
  const contentPath = `${mdDir}/${relative}`;

  const fromContent = imageUrls.get(contentPath);
  if (fromContent) return fromContent;

  if (relative.startsWith('assets/') || relative.startsWith('public/')) {
    return `${base}${relative.replace(/^public\//, '')}`;
  }

  return `${base}${contentPath.replace(/^content\//, '')}`;
}

export function getContentImagePaths(): string[] {
  return [...imageUrls.keys()];
}
