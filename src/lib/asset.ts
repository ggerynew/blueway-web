const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Public mappabeli statikus fájlok (képek, modellek) útvonala,
 * GitHub Pages basePath-szal is működik.
 */
export function asset(path: string): string {
  return `${base}${path}`;
}
