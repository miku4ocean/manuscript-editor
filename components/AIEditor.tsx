'use client';

import { useState, useEffect } from 'react';

export default function AIEditor() {
  const [apiProvider, setApiProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem(`ai-editor-apikey-${apiProvider}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    }
  }, [apiProvider]);

  const [enabledFeatures, setEnabledFeatures] = useState({
    s2t: false,
    englishCheck: false,
    typoFix: false,
    punctuation: false,
    removeTimestamp: false,
  });

  const features = [
    { id: 's2t', name: '中文簡轉繁', desc: '簡體中文字轉繁體中文字' },
    { id: 'englishCheck', name: '英文字偵錯', desc: '拼法、時態、空白處理' },
    { id: 'typoFix', name: '修錯字贅字', desc: 'AI 判斷語意修正錯字和贅字' },
    { id: 'punctuation', name: '修標點段落', desc: '依語意修正標點符號和分段' },
    { id: 'removeTimestamp', name: '刪時間戳記', desc: '刪除逐字稿時間戳記' },
  ];

  const apiProviders = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
    { id: 'google', name: 'Google Gemini', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  ];

  const toggleFeature = (featureId: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId as keyof typeof prev]
    }));
  };

  const handleProcess = async () => {
    if (!apiKey.trim()) {
      alert('請先輸入 API Key');
      return;
    }
    if (!originalText.trim()) {
      alert('請輸入原始文稿');
      return;
    }
    if (!Object.values(enabledFeatures).some(v => v)) {
      alert('請至少選擇一個處理功能');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedFeatures = Object.entries(enabledFeatures)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => features.find(f => f.id === key)?.name)
        .join('、');

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
        throw new Error(`API 錯誤: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessedText(data.processedText);
    } catch (error) {
      console.error('處理錯誤:', error);
      alert(`處理文稿時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (processedText) {
      await navigator.clipboard.writeText(processedText);
      alert('已複製到剪貼簿');
    }
  };

  const handleExport = () => {
    if (processedText) {
      const blob = new Blob([processedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_${Date.now()}.txt`;
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
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* API Key 設定區 */}
      <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🔑</span>API 設定（僅儲存在本機）
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* API 供應商選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 供應商
            </label>
            <select
              value={apiProvider}
              onChange={(e) => {
                setApiProvider(e.target.value as any);
                setModel(apiProviders.find(p => p.id === e.target.value)?.models[0] || '');
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            >
              {apiProviders.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* 模型選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模型
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            >
              {currentProvider?.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* API Key 輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setApiKey(newKey);
                  // Save to localStorage
                  if (typeof window !== 'undefined') {
                    if (newKey) {
                      localStorage.setItem(`ai-editor-apikey-${apiProvider}`, newKey);
                    } else {
                      localStorage.removeItem(`ai-editor-apikey-${apiProvider}`);
                    }
                  }
                }}
                placeholder="請輸入 API Key"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none pr-20"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
              >
                {showApiKey ? '隱藏' : '顯示'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          ⚠️ API Key 僅儲存在您的瀏覽器本地，不會上傳到伺服器。使用時會直接從瀏覽器呼叫 API。
        </p>
      </div>

      {/* 功能選項 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⚙️</span>功能選項
        </h2>
        <div className="flex justify-between items-center">
          {features.map((feature) => (
            <label
              key={feature.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={enabledFeatures[feature.id as keyof typeof enabledFeatures]}
                onChange={() => toggleFeature(feature.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-center">
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors whitespace-nowrap block">
                  {feature.name}
                </span>
                <span className="text-xs text-gray-500">{feature.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 按鈕列 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !apiKey}
          className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          🤖 {isProcessing ? 'AI 處理中...' : '處理文稿'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          🗑️ 清除畫面
        </button>
        <button
          onClick={handleCopy}
          disabled={!processedText}
          className="px-5 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          📋 複製結果
        </button>
        <button
          onClick={handleExport}
          disabled={!processedText}
          className="px-5 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          ↓ 匯出 TXT
        </button>
      </div>

      {/* 文字區域 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 原始文稿 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">原始文稿</h3>
          <div className="border-4 border-red-500 rounded-lg bg-white" style={{ height: '530px' }}>
            <div className="h-full flex flex-col">
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="貼上或輸入需要 AI 處理的文稿..."
                className="flex-1 w-full p-4 border-0 outline-none resize-none font-sans text-gray-900 bg-transparent leading-relaxed overflow-y-auto"
              />
              <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                字數: {originalText.length}
              </div>
            </div>
          </div>
        </div>

        {/* 處理後文稿 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">處理後文稿</h3>
          <div className="border-4 border-green-500 rounded-lg bg-white" style={{ height: '530px' }}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {processedText ? (
                  <div className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                    {processedText}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    AI 處理後的文稿將顯示在此處...
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                {processedText ? `字數: ${processedText.length}` : '字數: 0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
