// 瀏覽器端直接呼叫各 AI 供應商官方 API（BYOK：金鑰由使用者持有，直連不經任何伺服器）。
// 本專案為純靜態匯出（output: 'export'）部署於 GitHub Pages，沒有伺服器可以代理，
// 因此所有請求一律從瀏覽器直連供應商——這也讓 UI 上「所有 API 請求都是從您的
// 瀏覽器直接發送至 AI 提供商」的安全文案成為事實。
//
// CORS 現況（2026-07 實測／參考同工作區 cardforge 的 client-direct 模式）：
// - OpenAI / Google Gemini / xAI：官方 API 允許瀏覽器跨域呼叫
// - Anthropic：必須帶 `anthropic-dangerous-direct-browser-access: true` header，否則被 CORS 擋下
// - DeepSeek：未實測（無金鑰可驗證）；若其 API 不回 CORS header，瀏覽器端會擲出
//   network error，由呼叫端顯示錯誤訊息

export interface AIProcessRequest {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'deepseek';
  apiKey: string;
  model: string;
  text: string;
  features: {
    s2t: boolean;
    englishCheck: boolean;
    typoFix: boolean;
    punctuation: boolean;
    removeTimestamp: boolean;
  };
}

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AIProcessResult {
  processedText: string;
  usage: AIUsage | null;
}

const SYSTEM_PROMPT =
  '你是一個專業的中文文稿編輯助手，擅長修正錯字、標點符號、簡繁轉換和文稿整理。';

// Build prompt based on selected features
export function buildPrompt(text: string, features: AIProcessRequest['features']): string {
  const tasks: string[] = [];

  if (features.s2t) {
    tasks.push('1. 將所有簡體中文字轉換為繁體中文字（台灣用字標準）');
  }

  if (features.englishCheck) {
    tasks.push('2. 檢查並修正英文拼字、時態錯誤');
    tasks.push('3. 在中文與英文/數字之間加上空格，但標點符號前後不加空格');
  }

  if (features.typoFix) {
    tasks.push('4. 根據語意判斷並修正錯字、同音異字、打字錯誤');
    tasks.push('5. 刪除多餘的贅字、重複的字詞、PDF 轉檔產生的多餘字元');
  }

  if (features.punctuation) {
    tasks.push('6. 根據語意修正標點符號的使用');
    tasks.push('7. 適當分段，使文章更易閱讀');
  }

  if (features.removeTimestamp) {
    tasks.push('8. 刪除所有時間戳記（如 [00:00:00] 或類似格式）');
  }

  return `請協助處理以下文稿，執行下列任務：

${tasks.join('\n')}

重要規則：
- 只輸出處理後的文稿內容，不要包含任何說明或註解
- 保持原文的語氣和風格
- 不要增加或刪除原文的實質內容
- 確保語意通順、符合中文語法

原始文稿：
${text}

處理後文稿：`;
}

// 遮蔽錯誤訊息中可能出現的金鑰（避免出現在畫面 alert／截圖／console）
export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9-_]+/g, '[REDACTED]')
    .replace(/Bearer\s+[a-zA-Z0-9-_.]+/g, 'Bearer [REDACTED]')
    .replace(/api[_-]?key[:\s]+[a-zA-Z0-9-_]+/gi, 'api_key: [REDACTED]');
}

interface ProviderCallResult {
  processedText: string;
  usage: AIUsage | null;
}

// OpenAI 相容格式（OpenAI / xAI / DeepSeek 共用）
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  providerLabel: string
): Promise<ProviderCallResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || `${providerLabel} API 請求失敗 (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    processedText: data.choices[0].message.content.trim(),
    usage: data.usage
      ? { inputTokens: data.usage.prompt_tokens ?? 0, outputTokens: data.usage.completion_tokens ?? 0 }
      : null,
  };
}

async function processWithOpenAI(apiKey: string, model: string, prompt: string): Promise<ProviderCallResult> {
  return callOpenAICompatible('https://api.openai.com/v1/chat/completions', apiKey, model, prompt, 'OpenAI');
}

async function processWithXAI(apiKey: string, model: string, prompt: string): Promise<ProviderCallResult> {
  return callOpenAICompatible('https://api.x.ai/v1/chat/completions', apiKey, model, prompt, 'xAI Grok');
}

async function processWithDeepSeek(apiKey: string, model: string, prompt: string): Promise<ProviderCallResult> {
  return callOpenAICompatible('https://api.deepseek.com/v1/chat/completions', apiKey, model, prompt, 'DeepSeek');
}

async function processWithAnthropic(apiKey: string, model: string, prompt: string): Promise<ProviderCallResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // 瀏覽器直連必須帶此 header，否則被 CORS 擋下
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || `Anthropic API 請求失敗 (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    processedText: data.content[0].text.trim(),
    usage: data.usage
      ? { inputTokens: data.usage.input_tokens ?? 0, outputTokens: data.usage.output_tokens ?? 0 }
      : null,
  };
}

async function processWithGoogle(apiKey: string, model: string, prompt: string): Promise<ProviderCallResult> {
  // 金鑰放 header（x-goog-api-key），不放 URL query，避免金鑰出現在網址
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || `Google Gemini API 請求失敗 (HTTP ${response.status})`);
  }

  const data = await response.json();
  const usageMeta = data.usageMetadata;
  return {
    processedText: data.candidates[0].content.parts[0].text.trim(),
    usage: usageMeta
      ? {
          inputTokens: usageMeta.promptTokenCount ?? 0,
          outputTokens: usageMeta.candidatesTokenCount ?? 0,
        }
      : null,
  };
}

/**
 * 依供應商直連官方 API 處理文稿。
 * 驗證失敗或供應商回錯時 throw Error（訊息已遮蔽金鑰）。
 */
export async function processTextWithAI(request: AIProcessRequest): Promise<AIProcessResult> {
  const { provider, apiKey, model, text, features } = request;

  if (!apiKey || !text) {
    throw new Error('API Key 和文稿內容為必填');
  }

  const prompt = buildPrompt(text, features);

  try {
    let result: ProviderCallResult;
    switch (provider) {
      case 'openai':
        result = await processWithOpenAI(apiKey, model, prompt);
        break;
      case 'anthropic':
        result = await processWithAnthropic(apiKey, model, prompt);
        break;
      case 'google':
        result = await processWithGoogle(apiKey, model, prompt);
        break;
      case 'xai':
        result = await processWithXAI(apiKey, model, prompt);
        break;
      case 'deepseek':
        result = await processWithDeepSeek(apiKey, model, prompt);
        break;
      default:
        throw new Error('不支援的 API 提供商');
    }
    return { processedText: result.processedText, usage: result.usage };
  } catch (error) {
    const message = error instanceof Error ? error.message : '處理文稿時發生錯誤';
    throw new Error(sanitizeErrorMessage(message));
  }
}
