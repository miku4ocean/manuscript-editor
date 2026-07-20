// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/ai-process', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const baseFeatures = {
  s2t: true,
  englishCheck: false,
  typoFix: false,
  punctuation: false,
  removeTimestamp: false,
};

describe('POST /api/ai-process', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('rejects requests missing an API key or text (no network call made)', async () => {
    const response = await POST(
      makeRequest({ provider: 'anthropic', apiKey: '', model: 'claude-3', text: '', features: baseFeatures })
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects an unsupported provider', async () => {
    const response = await POST(
      makeRequest({
        provider: 'unsupported-llm',
        apiKey: 'sk-test',
        model: 'x',
        text: '文稿內容',
        features: baseFeatures,
      })
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('不支援');
  });

  it('calls the Anthropic endpoint (mocked) and returns the processed text', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: '處理後的文字' }] }),
    });

    const response = await POST(
      makeRequest({
        provider: 'anthropic',
        apiKey: 'sk-ant-fake-key',
        model: 'claude-3-haiku',
        text: '需要潤飾的原始文稿',
        features: baseFeatures,
      })
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe('https://api.anthropic.com/v1/messages');
    expect(calledInit.headers['x-api-key']).toBe('sk-ant-fake-key');

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.processedText).toBe('處理後的文字');
  });

  it('routes to the OpenAI endpoint for provider "openai"', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OpenAI 結果' } }] }),
    });

    const response = await POST(
      makeRequest({
        provider: 'openai',
        apiKey: 'sk-fake',
        model: 'gpt-4o-mini',
        text: '文稿',
        features: baseFeatures,
      })
    );

    const [calledUrl] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe('https://api.openai.com/v1/chat/completions');
    const json = await response.json();
    expect(json.processedText).toBe('OpenAI 結果');
  });

  it('returns a sanitized error message and never echoes the API key on failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Invalid Bearer sk-ant-secret123 supplied' } }),
    });

    const response = await POST(
      makeRequest({
        provider: 'anthropic',
        apiKey: 'sk-ant-secret123',
        model: 'claude-3',
        text: '文稿',
        features: baseFeatures,
      })
    );

    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).not.toContain('sk-ant-secret123');
  });
});
