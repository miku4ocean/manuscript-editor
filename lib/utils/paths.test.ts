import { describe, it, expect, afterEach, vi } from 'vitest';
import { getDictionaryPath } from './paths';

describe('getDictionaryPath', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('未設定 basePath（Cloudflare／本機）：不加前綴，且與 hostname 無關', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    vi.stubGlobal('window', { location: { hostname: 'manuscript-editor-miku.pages.dev' } });
    expect(getDictionaryPath('typo-dictionary.json')).toBe('/dictionaries/typo-dictionary.json');
  });

  it('GitHub Pages 建置（basePath=/manuscript-editor）：加前綴', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/manuscript-editor');
    expect(getDictionaryPath('s2t-overlay.json')).toBe('/manuscript-editor/dictionaries/s2t-overlay.json');
  });
});
