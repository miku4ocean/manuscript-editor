'use client';

import { useState, useEffect } from 'react';

const apiProviders = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'] },
  { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'] },
  { id: 'google', name: 'Google Gemini', models: ['gemini-2.0-flash-exp', 'gemini-exp-1206'] },
  { id: 'xai', name: 'xAI Grok', models: ['grok-2-1212', 'grok-2-vision-1212', 'grok-beta'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
];

const features = [
  { id: 's2t', name: '簡體轉繁體' },
  { id: 'englishCheck', name: '英文檢查' },
  { id: 'typoFix', name: '修正錯字' },
  { id: 'punctuation', name: '修正標點' },
  { id: 'removeTimestamp', name: '刪除時間戳' },
];

export default function AIEditor() {
  const [apiProvider, setApiProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('txt');
  const [enabledFeatures, setEnabledFeatures] = useState({
    s2t: true,
    englishCheck: true,
    typoFix: true,
    punctuation: true,
    removeTimestamp: false,
  });

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
    try {
      const response = await fetch('/api/ai-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: apiProvider,
          apiKey,
          model,
          text: originalText,
          features: enabledFeatures,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API 請求失敗');
      }

      const data = await response.json();
      setProcessedText(data.processedText);
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
  };

  const currentProvider = apiProviders.find(p => p.id === apiProvider);

  return (
    <div className="max-w-[1400px] mx-auto px-12">
      {/* API Configuration */}
      <div className="py-20 border-b" style={{ borderColor: '#f0f0f0' }}>
        <div className="flex items-center justify-center gap-4">
          <select
            value={apiProvider}
            onChange={(e) => {
              setApiProvider(e.target.value);
              setModel(apiProviders.find(p => p.id === e.target.value)?.models[0] || '');
            }}
            className="px-4 py-2.5 text-[13px] rounded-md cursor-pointer"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#2d3748'
            }}
          >
            {apiProviders.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-4 py-2.5 text-[13px] rounded-md cursor-pointer"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#2d3748'
            }}
          >
            {currentProvider?.models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="relative" style={{ width: '280px' }}>
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
              placeholder="API Key"
              className="w-full px-4 py-2.5 pr-14 text-[13px] rounded-md"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                color: '#2d3748'
              }}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] rounded"
              style={{
                background: '#f7fafc',
                color: '#718096',
                border: '1px solid #e2e8f0'
              }}
            >
              {showApiKey ? '隱藏' : '顯示'}
            </button>
          </div>
        </div>
      </div>

      {/* Processing Options - Grid layout */}
      <div className="py-20 border-b" style={{ borderColor: '#f0f0f0' }}>
        <div className="grid grid-cols-5 gap-x-8 gap-y-12 max-w-[900px] mx-auto">
          {features.map((feature) => (
            <label key={feature.id} className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enabledFeatures[feature.id as keyof typeof enabledFeatures]}
                onChange={() => toggleFeature(feature.id)}
                className="w-3.5 h-3.5 cursor-pointer flex-shrink-0"
                style={{ accentColor: '#4a5568' }}
              />
              <span className="text-[13px] whitespace-nowrap" style={{ color: '#4a5568' }}>
                {feature.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 py-20">
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-10 py-2.5 text-white text-[13px] font-medium rounded-md transition-all disabled:opacity-50"
          style={{ background: '#2d3748' }}
          onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = '#1a202c')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2d3748')}
        >
          {isProcessing ? '處理中...' : '處理文稿'}
        </button>
        <div className="w-px h-6" style={{ background: '#e2e8f0' }} />
        <button
          onClick={handleCopy}
          disabled={!processedText}
          className="px-6 py-2.5 text-[13px] font-medium rounded-md transition-all disabled:opacity-30"
          style={{
            background: 'transparent',
            color: '#718096'
          }}
          onMouseEnter={(e) => !processedText || (e.currentTarget.style.color = '#2d3748')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#718096')}
        >
          {copySuccess ? '✓ 已複製' : '複製'}
        </button>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as 'txt' | 'md')}
          disabled={!processedText}
          className="px-4 py-2.5 text-[13px] rounded-md cursor-pointer disabled:opacity-30"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#718096'
          }}
        >
          <option value="txt">TXT</option>
          <option value="md">Markdown</option>
        </select>
        <button
          onClick={handleExport}
          disabled={!processedText}
          className="px-6 py-2.5 text-[13px] font-medium rounded-md transition-all disabled:opacity-30"
          style={{
            background: 'transparent',
            color: '#718096'
          }}
          onMouseEnter={(e) => !processedText || (e.currentTarget.style.color = '#2d3748')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#718096')}
        >
          匯出
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 text-[13px] font-medium rounded-md transition-all"
          style={{
            background: 'transparent',
            color: '#cbd5e0'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#718096')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e0')}
        >
          清除
        </button>
      </div>

      <div className="py-12"></div>

      {/* Text Areas - Clean, minimal design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pb-32">
        {/* Original Text */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-sm font-medium" style={{ color: '#2d3748' }}>
              原始文稿
            </h2>
            <span className="text-xs" style={{ color: '#a0aec0' }}>
              {originalText.length} 字
            </span>
          </div>
          <div className="bg-white rounded-lg overflow-hidden" style={{
            border: '1px solid #e2e8f0',
            height: '600px'
          }}>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="貼上文稿..."
              className="w-full h-full p-10 border-0 outline-none resize-none text-sm leading-relaxed"
              style={{
                color: 'var(--nordic-text-primary)',
                background: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Processed Text */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-sm font-medium" style={{ color: '#2d3748' }}>
              處理後文稿
            </h2>
            <span className="text-xs" style={{ color: '#a0aec0' }}>
              {processedText ? processedText.length : 0} 字
            </span>
          </div>
          <div className="bg-white rounded-lg overflow-hidden" style={{
            border: '1px solid #e2e8f0',
            height: '600px'
          }}>
            <div className="h-full overflow-y-auto p-10">
              {processedText ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--nordic-text-primary)' }}>
                  {processedText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                  AI 處理結果將顯示在此...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
