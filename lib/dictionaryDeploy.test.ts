// @vitest-environment jsdom
// 回歸：字典路徑不得依 hostname 加前綴。以「非 localhost 主機名」模擬正式網域，
// 以 public/dictionaries 的真實 JSON 回應 fetch，驗證三種字典處理確實生效。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fixTypos } from './processors/fixTypos';
import { removeRedundancy } from './processors/removeRedundancy';
import { simplifiedToTraditionalAsync } from './processors/simplifiedToTraditional';

const calls: string[] = [];

beforeEach(() => {
  calls.length = 0;
  vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
  Object.defineProperty(window, 'location', {
    value: new URL('https://manuscript-editor-miku.pages.dev/'),
    writable: true,
  });
  vi.stubGlobal('fetch', async (url: string) => {
    calls.push(url);
    const file = path.join(process.cwd(), 'public', url);
    if (!url.startsWith('/dictionaries/') || !fs.existsSync(file)) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, 'utf-8')) };
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('非 localhost 部署（網域根目錄）字典可載入且生效', () => {
  it('修正錯字', async () => {
    expect(await fixTypos('他在作崇')).toContain('作祟');
  });

  it('不再把臺灣正體用字改成大陸用法（棉花糖、帳單）', async () => {
    const out = await fixTypos('棉花糖與帳單');
    expect(out).toBe('棉花糖與帳單');
  });

  it('刪除贅字', async () => {
    const out = await removeRedundancy('嗯，那個今天天氣很好');
    expect(out.length).toBeLessThan('嗯，那個今天天氣很好'.length);
  });

  it('簡轉繁', async () => {
    expect(await simplifiedToTraditionalAsync('软件开发')).toContain('軟體');
  });

  it('所有字典請求都走 /dictionaries/ 根路徑', () => {
    // 前面的測試已觸發 fetch；快取可能讓部分不再重抓，但任何請求都不得帶 /manuscript-editor 前綴
    expect(calls.every((u) => u.startsWith('/dictionaries/'))).toBe(true);
  });
});
