/**
 * Get the correct dictionary path based on environment
 * In production (GitHub Pages): /manuscript-editor/dictionaries/
 * In development: /dictionaries/
 */
export function getDictionaryPath(filename: string): string {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // In production (GitHub Pages), we need the /manuscript-editor prefix
    const isProduction = window.location.hostname !== 'localhost' &&
                        window.location.hostname !== '127.0.0.1';
    const basePath = isProduction ? '/manuscript-editor' : '';
    return `${basePath}/dictionaries/${filename}`;
  }
  // Server-side fallback (shouldn't be used for dictionary loading)
  return `/dictionaries/${filename}`;
}
