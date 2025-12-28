import { NextRequest, NextResponse } from 'next/server';

interface AIProcessRequest {
  provider: 'openai' | 'anthropic' | 'google' | 'xai';
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

// Build prompt based on selected features
function buildPrompt(text: string, features: AIProcessRequest['features']): string {
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

// Call OpenAI API
async function processWithOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一個專業的中文文稿編輯助手，擅長修正錯字、標點符號、簡繁轉換和文稿整理。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 請求失敗');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Call Anthropic Claude API
async function processWithAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: '你是一個專業的中文文稿編輯助手，擅長修正錯字、標點符號、簡繁轉換和文稿整理。',
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API 請求失敗');
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

// Call Google Gemini API
async function processWithGoogle(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `你是一個專業的中文文稿編輯助手，擅長修正錯字、標點符號、簡繁轉換和文稿整理。\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Google Gemini API 請求失敗');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// Call xAI Grok API
async function processWithXAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一個專業的中文文稿編輯助手，擅長修正錯字、標點符號、簡繁轉換和文稿整理。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'xAI Grok API 請求失敗');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: AIProcessRequest = await request.json();
    const { provider, apiKey, model, text, features } = body;

    // Validate input
    if (!apiKey || !text) {
      return NextResponse.json(
        { error: 'API Key 和文稿內容為必填' },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildPrompt(text, features);

    // Call appropriate AI service
    let processedText: string;

    switch (provider) {
      case 'openai':
        processedText = await processWithOpenAI(apiKey, model, prompt);
        break;
      case 'anthropic':
        processedText = await processWithAnthropic(apiKey, model, prompt);
        break;
      case 'google':
        processedText = await processWithGoogle(apiKey, model, prompt);
        break;
      case 'xai':
        processedText = await processWithXAI(apiKey, model, prompt);
        break;
      default:
        return NextResponse.json(
          { error: '不支援的 API 提供商' },
          { status: 400 }
        );
    }

    return NextResponse.json({ processedText });
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '處理文稿時發生錯誤',
      },
      { status: 500 }
    );
  }
}
