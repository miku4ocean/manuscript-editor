import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processTextWithAI, buildPrompt, sanitizeErrorMessage } from './aiProviders';

const baseFeatures = {
  s2t: true,
  englishCheck: false,
  typoFix: false,
  punctuation: false,
  removeTimestamp: false,
};

describe('processTextWithAI（瀏覽器直連各供應商）', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('缺少 API Key 或文稿時直接拒絕（不發出任何網路請求）', async () => {
    await expect(
      processTextWithAI({
        provider: 'anthropic',
        apiKey: '',
        model: 'claude-haiku-4-5',
        text: '',
        features: baseFeatures,
      })
    ).rejects.toThrow('API Key 和文稿內容為必填');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('拒絕不支援的供應商', async () => {
    await expect(
      processTextWithAI({
        // @ts-expect-error 測試不合法的 provider
        provider: 'unsupported-llm',
        apiKey: 'sk-test',
        model: 'x',
        text: '文稿內容',
        features: baseFeatures,
      })
    ).rejects.toThrow('不支援');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('Anthropic：直連官方端點並帶瀏覽器 CORS header，回傳處理後文字與 usage', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '處理後的文字' }],
        usage: { input_tokens: 120, output_tokens: 80 },
      }),
    });

    const result = await processTextWithAI({
      provider: 'anthropic',
      apiKey: 'sk-ant-fake-key',
      model: 'claude-haiku-4-5',
      text: '需要潤飾的原始文稿',
      features: baseFeatures,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe('https://api.anthropic.com/v1/messages');
    expect(calledInit.headers['x-api-key']).toBe('sk-ant-fake-key');
    // 靜態站瀏覽器直連的關鍵 header，少了會被 CORS 擋下
    expect(calledInit.headers['anthropic-dangerous-direct-browser-access']).toBe('true');

    expect(result.processedText).toBe('處理後的文字');
    expect(result.usage).toEqual({ inputTokens: 120, outputTokens: 80 });
  });

  it('OpenAI：路由到官方端點並正規化 usage 欄位', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'OpenAI 結果' } }],
        usage: { prompt_tokens: 50, completion_tokens: 30 },
      }),
    });

    const result = await processTextWithAI({
      provider: 'openai',
      apiKey: 'sk-fake',
      model: 'gpt-4.1',
      text: '文稿',
      features: baseFeatures,
    });

    const [calledUrl, calledInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe('https://api.openai.com/v1/chat/completions');
    expect(calledInit.headers['Authorization']).toBe('Bearer sk-fake');
    expect(result.processedText).toBe('OpenAI 結果');
    expect(result.usage).toEqual({ inputTokens: 50, outputTokens: 30 });
  });

  it('Google Gemini：金鑰放 header 不放 URL，並讀取 usageMetadata', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Gemini 結果' }] } }],
        usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 25 },
      }),
    });

    const result = await processTextWithAI({
      provider: 'google',
      apiKey: 'AIza-fake',
      model: 'gemini-2.5-flash',
      text: '文稿',
      features: baseFeatures,
    });

    const [calledUrl, calledInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    );
    expect(String(calledUrl)).not.toContain('AIza-fake');
    expect(calledInit.headers['x-goog-api-key']).toBe('AIza-fake');
    expect(result.processedText).toBe('Gemini 結果');
    expect(result.usage).toEqual({ inputTokens: 40, outputTokens: 25 });
  });

  it.each([
    ['xai', 'https://api.x.ai/v1/chat/completions'],
    ['deepseek', 'https://api.deepseek.com/v1/chat/completions'],
  ] as const)('%s：路由到對應的 OpenAI 相容端點', async (provider, endpoint) => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '結果' } }] }),
    });

    const result = await processTextWithAI({
      provider,
      apiKey: 'sk-fake',
      model: 'some-model',
      text: '文稿',
      features: baseFeatures,
    });

    const [calledUrl] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe(endpoint);
    expect(result.processedText).toBe('結果');
    expect(result.usage).toBeNull();
  });

  it('失敗時回傳遮蔽過金鑰的錯誤訊息，絕不外洩金鑰', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid Bearer sk-ant-secret123 supplied' } }),
    });

    const err = await processTextWithAI({
      provider: 'anthropic',
      apiKey: 'sk-ant-secret123',
      model: 'claude-haiku-4-5',
      text: '文稿',
      features: baseFeatures,
    }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).not.toContain('sk-ant-secret123');
    expect((err as Error).message).toContain('[REDACTED]');
  });

  it('供應商回非 JSON 錯誤（如 CORS/網路層）時給出可讀的 HTTP 錯誤訊息', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(
      processTextWithAI({
        provider: 'deepseek',
        apiKey: 'sk-fake',
        model: 'deepseek-v4-flash',
        text: '文稿',
        features: baseFeatures,
      })
    ).rejects.toThrow('DeepSeek API 請求失敗 (HTTP 502)');
  });
});

describe('buildPrompt', () => {
  it('依勾選的功能組出任務清單', () => {
    const prompt = buildPrompt('原文', {
      s2t: true,
      englishCheck: false,
      typoFix: true,
      punctuation: false,
      removeTimestamp: true,
    });
    expect(prompt).toContain('簡體中文字轉換為繁體中文字');
    expect(prompt).toContain('修正錯字');
    expect(prompt).toContain('刪除所有時間戳記');
    expect(prompt).not.toContain('英文拼字');
    expect(prompt).toContain('原文');
  });
});

describe('sanitizeErrorMessage', () => {
  it('遮蔽 sk- 金鑰、Bearer token 與 api_key 樣式', () => {
    const masked = sanitizeErrorMessage(
      'error sk-abc123 with Bearer eyJtoken.abc and api_key: XYZ999'
    );
    expect(masked).not.toContain('sk-abc123');
    expect(masked).not.toContain('eyJtoken.abc');
    expect(masked).not.toContain('XYZ999');
    expect(masked).toContain('[REDACTED]');
  });
});
