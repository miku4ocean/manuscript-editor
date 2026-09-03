// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import Home from './page';
import { calculateDiff, calculateStatistics } from '@/lib/diffUtils';

// 模型/字典管線一律 mock，component 測試不碰 opencc 也不發網路請求
const mockProcessText = vi.fn();
vi.mock('@/lib/textProcessor', () => ({
  processText: (...args: unknown[]) => mockProcessText(...args),
  preloadDictionaries: vi.fn(async () => {}),
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )!.set!;
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Home 字典工具分頁：diff 統計徽章', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockProcessText.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  // 真 bug 迴歸：統計原本自己 inline 計算——
  //   modifications 的 filter 條件（type 不是 equal 也不是 insert 也不是 delete）
  //   在三態型別下恆為 false，「修改」永遠顯示 ~0；
  //   additions/deletions 又是「diff 段數」而非字元數，與 diffUtils 的
  //   calculateStatistics（既有且已測）完全不一致。
  it('統計徽章顯示 diffUtils.calculateStatistics 的字元數，修改數不恆為 0', async () => {
    const original = '刪掉這一段字，後面保留';
    const processed = '插入新的內容，後面保留';
    mockProcessText.mockResolvedValue({ text: processed, processingTime: 0.01 });

    await act(async () => {
      root.render(<Home />);
    });

    // 輸入原始文稿
    const textarea = container.querySelector('textarea')!;
    expect(textarea).toBeTruthy();
    await act(async () => {
      setTextareaValue(textarea, original);
    });

    // 勾選第一個處理功能（簡體轉繁體）
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => {
      checkbox.click();
    });

    // 按下「處理文稿」
    const processButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('處理文稿')
    )!;
    expect(processButton).toBeTruthy();
    await act(async () => {
      processButton.click();
    });

    expect(mockProcessText).toHaveBeenCalledTimes(1);

    // 期望值：與 diff 顯示同一份 segments、用 lib 既有的 calculateStatistics
    const expected = calculateStatistics(calculateDiff(original, processed));
    expect(expected.modifications).toBeGreaterThan(0); // 本情境確實是「修改」

    const badges = Array.from(container.querySelectorAll('.badge')).map(
      (b) => b.textContent
    );
    expect(badges).toContain(`+${expected.insertions}`);
    expect(badges).toContain(`-${expected.deletions}`);
    expect(badges).toContain(`~${expected.modifications}`);
    expect(badges).not.toContain('~0');
  });
});
