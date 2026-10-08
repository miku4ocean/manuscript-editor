// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import AIEditor from './AIEditor';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('AIEditor 金鑰清除', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
  });

  it('「清除所有金鑰」清掉所有提供商的金鑰，不只目前提供商', async () => {
    localStorage.setItem('ai-editor-apikey-openai', 'sk-test-openai');
    localStorage.setItem('ai-editor-apikey-anthropic', 'sk-test-anthropic');
    localStorage.setItem('ai-editor-apikey-gemini', 'sk-test-gemini');
    localStorage.setItem('unrelated', 'keep');

    await act(async () => {
      root.render(<AIEditor />);
    });

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('清除所有金鑰')
    )!;
    expect(btn).toBeTruthy();
    await act(async () => {
      btn.click();
    });

    expect(localStorage.getItem('ai-editor-apikey-openai')).toBeNull();
    expect(localStorage.getItem('ai-editor-apikey-anthropic')).toBeNull();
    expect(localStorage.getItem('ai-editor-apikey-gemini')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(container.textContent).not.toContain('貼上或上傳');
  });
});
