'use client';

import { useState, useEffect, useMemo } from 'react';
import { processTextWithAI, type AIProcessRequest } from '@/lib/aiProviders';

// 最新 API 提供商和模型資訊 (2025年1月更新)
const apiProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🟢',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', inputPrice: 5.00, outputPrice: 20.00 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', inputPrice: 0.60, outputPrice: 2.40 },
      { id: 'o3', name: 'o3 (Reasoning)', inputPrice: 2.00, outputPrice: 8.00 },
      { id: 'o3-mini', name: 'o3-mini', inputPrice: 1.10, outputPrice: 4.40 },
      { id: 'o1', name: 'o1 (Reasoning)', inputPrice: 15.00, outputPrice: 60.00 },
    ],
    docsUrl: 'https://platform.openai.com/docs/overview',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '🟠',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', inputPrice: 3.00, outputPrice: 15.00 },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', inputPrice: 5.00, outputPrice: 25.00 },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', inputPrice: 1.00, outputPrice: 5.00 },
    ],
    docsUrl: 'https://docs.anthropic.com/claude/docs',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: '🔵',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', inputPrice: 0.10, outputPrice: 0.40 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', inputPrice: 1.25, outputPrice: 10.00 },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Free)', inputPrice: 0, outputPrice: 0 },
    ],
    docsUrl: 'https://ai.google.dev/docs',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    icon: '⚫',
    models: [
      { id: 'grok-4-fast', name: 'Grok 4 Fast', inputPrice: 0.20, outputPrice: 0.50 },
      { id: 'grok-4', name: 'Grok 4', inputPrice: 3.00, outputPrice: 15.00 },
      { id: 'grok-3', name: 'Grok 3', inputPrice: 3.00, outputPrice: 15.00 },
    ],
    docsUrl: 'https://docs.x.ai/',
    apiKeyUrl: 'https://console.x.ai/',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🟣',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', inputPrice: 0.56, outputPrice: 1.68 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', inputPrice: 0.56, outputPrice: 1.68 },
    ],
    docsUrl: 'https://platform.deepseek.com/docs',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
  },
];

const features = [
  { id: 's2t', name: '簡體轉繁體', icon: '🔄' },
  { id: 'englishCheck', name: '英文檢查', icon: '🔤' },
  { id: 'typoFix', name: '修正錯字', icon: '✏️' },
  { id: 'punctuation', name: '修正標點', icon: '。' },
  { id: 'removeTimestamp', name: '刪除時間戳', icon: '⏱️' },
];

// 估算 token 數量 (中文約 1.5-2 tokens/字, 英文約 0.25 tokens/字)
function estimateTokens(text: string): number {
  if (!text) return 0;
  let tokens = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fff]/.test(char)) {
      tokens += 1.5; // 中文字元
    } else if (/[a-zA-Z]/.test(char)) {
      tokens += 0.25; // 英文字母
    } else {
      tokens += 0.5; // 其他字元
    }
  }
  return Math.ceil(tokens);
}

// 計算預估成本
function calculateCost(inputTokens: number, outputTokens: number, inputPrice: number, outputPrice: number): number {
  const inputCost = (inputTokens / 1_000_000) * inputPrice;
  const outputCost = (outputTokens / 1_000_000) * outputPrice;
  return inputCost + outputCost;
}

export default function AIEditor() {
  const [apiProvider, setApiProvider] = useState('openai');
  const [modelId, setModelId] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('txt');
  const [actualCost, setActualCost] = useState<number | null>(null);
  const [enabledFeatures, setEnabledFeatures] = useState({
    s2t: true,
    englishCheck: true,
    typoFix: true,
    punctuation: true,
    removeTimestamp: false,
  });

  // 取得當前選擇的提供商和模型
  const currentProvider = useMemo(() =>
    apiProviders.find(p => p.id === apiProvider),
    [apiProvider]
  );

  const currentModel = useMemo(() =>
    currentProvider?.models.find(m => m.id === modelId),
    [currentProvider, modelId]
  );

  // 預估成本計算
  const estimatedCost = useMemo(() => {
    if (!originalText || !currentModel) return null;

    const inputTokens = estimateTokens(originalText);
    // 假設輸出與輸入差不多長度
    const outputTokens = inputTokens;

    const cost = calculateCost(
      inputTokens,
      outputTokens,
      currentModel.inputPrice,
      currentModel.outputPrice
    );

    return {
      inputTokens,
      outputTokens,
      cost
    };
  }, [originalText, currentModel]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem(`ai-editor-apikey-${apiProvider}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setApiKey('');
      }
    }
  }, [apiProvider]);

  const toggleFeature = (featureId: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId as keyof typeof prev]
    }));
  };

  const handleProcess = async () => {
    if (!apiKey) {
      alert('請輸入 API Key');
      return;
    }
    if (!originalText.trim()) {
      alert('請輸入原始文稿');
      return;
    }

    setIsProcessing(true);
    setActualCost(null);

    try {
      // 靜態部署（GitHub Pages）沒有伺服器可代理：
      // 一律從瀏覽器直連各供應商官方 API（BYOK，金鑰不經任何第三方伺服器）
      const data = await processTextWithAI({
        provider: apiProvider as AIProcessRequest['provider'],
        apiKey,
        model: modelId,
        text: originalText,
        features: enabledFeatures,
      });
      setProcessedText(data.processedText);

      // 計算實際成本
      if (currentModel && data.usage) {
        const cost = calculateCost(
          data.usage.inputTokens || estimatedCost?.inputTokens || 0,
          data.usage.outputTokens || estimatedCost?.outputTokens || 0,
          currentModel.inputPrice,
          currentModel.outputPrice
        );
        setActualCost(cost);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      alert(`處理文稿時發生錯誤: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (processedText) {
      await navigator.clipboard.writeText(processedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExport = () => {
    if (processedText) {
      const mimeType = exportFormat === 'md' ? 'text/markdown' : 'text/plain';
      const extension = exportFormat === 'md' ? 'md' : 'txt';
      const blob = new Blob([processedText], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_processed_${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setOriginalText('');
    setProcessedText('');
    setActualCost(null);
  };

  // 格式化金額顯示 (USD 美元)
  const formatCost = (cost: number): string => {
    if (cost < 0.0001) return '< USD $0.0001';
    if (cost < 0.01) return `USD $${cost.toFixed(4)}`;
    return `USD $${cost.toFixed(4)}`;
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* API Configuration Card */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>API 設定</h2>
          </div>
          {currentProvider && (
            <a
              href={currentProvider.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
              style={{ color: 'var(--brand-500)' }}
            >
              申請 API Key →
            </a>
          )}
        </div>
        <div className="card-body">
          <div className="flex flex-wrap items-end gap-4">
            {/* Provider Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                AI 提供商
              </label>
              <select
                value={apiProvider}
                onChange={(e) => {
                  setApiProvider(e.target.value);
                  const newProvider = apiProviders.find(p => p.id === e.target.value);
                  setModelId(newProvider?.models[0]?.id || '');
                }}
                className="input select"
                style={{ width: '180px' }}
              >
                {apiProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                模型
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="input select"
                style={{ width: '200px' }}
              >
                {currentProvider?.models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Model Pricing Info */}
            {currentModel && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  定價 USD (每百萬 tokens)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <span style={{ color: 'var(--success)' }}>輸入: ${currentModel.inputPrice}</span>
                  <span style={{ color: 'var(--text-muted)' }}>|</span>
                  <span style={{ color: 'var(--error)' }}>輸出: ${currentModel.outputPrice}</span>
                </div>
              </div>
            )}

            {/* API Key Input */}
            <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: '280px' }}>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setApiKey(newKey);
                    if (typeof window !== 'undefined') {
                      if (newKey) {
                        localStorage.setItem(`ai-editor-apikey-${apiProvider}`, newKey);
                      } else {
                        localStorage.removeItem(`ai-editor-apikey-${apiProvider}`);
                      }
                    }
                  }}
                  placeholder="輸入您的 API Key..."
                  className="input pr-16"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost text-xs py-1 px-2"
                >
                  {showApiKey ? '🙈 隱藏' : '👁️ 顯示'}
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2"
            style={{ background: 'var(--success-bg)', border: '1px solid #a7f3d0' }}>
            <span>🔒</span>
            <div className="text-xs" style={{ color: '#047857' }}>
              <strong>安全保障：</strong>
              API Key 僅儲存在您的瀏覽器 localStorage 中，不會上傳至任何伺服器。
              所有 API 請求都是從您的瀏覽器直接發送至 AI 提供商。
            </div>
          </div>
        </div>
      </div>

      {/* Feature Selection Card */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>處理功能</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="feature-grid">
            {features.map((feature) => {
              const isChecked = enabledFeatures[feature.id as keyof typeof enabledFeatures];
              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`checkbox-wrapper ${isChecked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFeature(feature.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-base">{feature.icon}</span>
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost Estimation Card */}
      {estimatedCost && estimatedCost.cost > 0 && (
        <div className="card mb-6 animate-slide-up">
          <div className="card-header" style={{ background: 'var(--warning-bg)', borderColor: '#fde68a' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <h2 className="font-semibold" style={{ color: '#b45309' }}>成本預估</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>輸入 Tokens:</span>
                <span className="font-medium">{estimatedCost.inputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>預估輸出:</span>
                <span className="font-medium">{estimatedCost.outputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>預估成本:</span>
                <span className="badge badge-warning font-bold">
                  {formatCost(estimatedCost.cost)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>折合台幣:</span>
                <span className="badge font-bold" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  NT$ {(estimatedCost.cost * 32.5).toFixed(2)}
                </span>
              </div>
              {actualCost !== null && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>實際成本:</span>
                    <span className="badge badge-success font-bold">
                      {formatCost(actualCost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>實際台幣:</span>
                    <span className="badge font-bold" style={{ background: '#d1fae5', color: '#047857' }}>
                      NT$ {(actualCost * 32.5).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              * 成本預估僅供參考，實際費用以 API 提供商帳單為準。中文約 1.5 tokens/字，英文約 0.25 tokens/字。
              <br />* 台幣換算使用參考匯率 1 USD ≈ 32.5 TWD
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !apiKey}
          className="btn btn-primary px-8"
        >
          {isProcessing ? (
            <>
              <span className="animate-pulse">🤖</span>
              AI 處理中...
            </>
          ) : (
            <>
              <span>✨</span>
              AI 處理文稿
            </>
          )}
        </button>
        <div className="divider" />
        <button
          onClick={handleCopy}
          disabled={!processedText}
          className="btn btn-secondary"
        >
          {copySuccess ? '✅ 已複製' : '📋 複製'}
        </button>
        <div className="flex items-center gap-1">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'txt' | 'md')}
            disabled={!processedText}
            className="input select text-sm py-2"
            style={{ width: '100px' }}
          >
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!processedText}
            className="btn btn-secondary"
          >
            📥 匯出
          </button>
        </div>
        <button
          onClick={handleReset}
          className="btn btn-ghost"
        >
          🗑️ 清除
        </button>
      </div>

      {/* Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span>📝</span>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>原始文稿</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {originalText.length.toLocaleString()} 字
            </span>
          </div>
          <div className="card-body p-0">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="在此貼上或輸入您要處理的文稿..."
              className="w-full border-0 outline-none resize-none text-sm leading-relaxed p-4"
              style={{
                height: '500px',
                color: 'var(--text-primary)',
                background: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Processed Text */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>AI 處理結果</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {processedText.length.toLocaleString()} 字
            </span>
          </div>
          <div className="card-body p-0">
            <div className="overflow-y-auto p-4" style={{ height: '500px' }}>
              {processedText ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed animate-fade-in"
                  style={{ color: 'var(--text-primary)' }}>
                  {processedText}
                </div>
              ) : (
                <div className="empty-state h-full">
                  <div className="empty-state-icon">🤖</div>
                  <p className="text-sm">AI 處理結果將顯示在此</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
                    輸入 API Key 並點擊「AI 處理文稿」開始
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Provider Links */}
      <div className="mt-8 card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>API 提供商資訊</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {apiProviders.map(provider => (
              <div key={provider.id} className="p-3 rounded-lg text-center"
                style={{ background: 'var(--bg-tertiary)' }}>
                <div className="text-2xl mb-2">{provider.icon}</div>
                <div className="text-sm font-medium mb-2">{provider.name}</div>
                <div className="flex flex-col gap-1">
                  <a href={provider.apiKeyUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs underline" style={{ color: 'var(--brand-500)' }}>
                    申請 Key
                  </a>
                  <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs underline" style={{ color: 'var(--text-muted)' }}>
                    文件
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
