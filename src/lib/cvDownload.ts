/** CV en PDF (formato americano, una página) — servido desde public/. */
export const CV_AMERICANO_FILENAME = 'cv-francisco-mujica-americano.pdf';

export function getCvAmericanoUrl(): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${CV_AMERICANO_FILENAME}`;
}
