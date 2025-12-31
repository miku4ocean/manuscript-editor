'use client';

import { useState, useEffect } from 'react';

export default function AIEditor() {
  const [apiProvider, setApiProvider] = useState<'openai' | 'anthropic' | 'google' | 'xai' | 'deepseek'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('txt');

  // 從 localStorage 載入 API Key
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
    { id: 's2t', name: '中文簡轉繁', desc: '' },
    { id: 'englishCheck', name: '英文字偵錯', desc: '' },
    { id: 'typoFix', name: '修錯字贅字', desc: '' },
    { id: 'punctuation', name: '修標點段落', desc: '' },
    { id: 'removeTimestamp', name: '刪時間戳記', desc: '' },
  ];

  const apiProviders = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
    { id: 'google', name: 'Google Gemini', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
    { id: 'xai', name: 'xAI Grok', models: ['grok-beta', 'grok-vision-beta'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
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
      // 安全性：不在 console 記錄可能包含 API Key 的錯誤
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      alert(`處理文稿時發生錯誤: ${errorMessage}`);
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
      // 根據選擇的格式設定 MIME type 和副檔名
      const mimeType = exportFormat === 'md' ? 'text/markdown' : 'text/plain';
      const extension = exportFormat === 'md' ? 'md' : 'txt';

      const blob = new Blob([processedText], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_${Date.now()}.${extension}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* API 設定卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">API 設定</h2>
            <p className="text-sm text-slate-500 mt-0.5">僅儲存在您的瀏覽器本地</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* API 供應商 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2.5">API 供應商</label>
            <select
              value={apiProvider}
              onChange={(e) => {
                setApiProvider(e.target.value as any);
                setModel(apiProviders.find(p => p.id === e.target.value)?.models[0] || '');
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       transition-all duration-200 cursor-pointer hover:bg-slate-100/80"
            >
              {apiProviders.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>

          {/* 模型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2.5">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       transition-all duration-200 cursor-pointer hover:bg-slate-100/80"
            >
              {currentProvider?.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2.5">API Key</label>
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
                placeholder="請輸入 API Key"
                className="w-full px-4 py-3 pr-24 bg-slate-50 border border-slate-200 rounded-xl text-slate-700
                         placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                         focus:border-blue-500 transition-all duration-200"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium
                         text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg
                         hover:bg-slate-50 transition-all duration-200"
              >
                {showApiKey ? '隱藏' : '顯示'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700/90 leading-relaxed">
            <svg className="inline w-4 h-4 mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            API Key 僅儲存在瀏覽器本地，使用時直接從瀏覽器呼叫 AI API，不會上傳到伺服器
          </p>
        </div>
      </div>

      {/* 功能選項卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">處理功能</h2>
            <p className="text-sm text-slate-500 mt-0.5">選擇需要的文稿處理功能</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {features.map((feature) => (
            <label
              key={feature.id}
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200
                       rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm"
            >
              <input
                type="checkbox"
                checked={enabledFeatures[feature.id as keyof typeof enabledFeatures]}
                onChange={() => toggleFeature(feature.id)}
                className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded-lg focus:ring-2
                         focus:ring-blue-500/20 cursor-pointer transition-all duration-200"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900
                             transition-colors duration-200">
                {feature.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !apiKey}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl
                   hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm
                   hover:shadow-md disabled:shadow-none flex items-center gap-2"
        >
          <svg className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {isProcessing ? 'AI 處理中...' : '處理文稿'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-3 bg-white text-slate-700 font-medium border border-slate-300 rounded-xl
                   hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2
                   focus:ring-slate-500/20 transition-all duration-200"
        >
          清除畫面
        </button>
        <button
          onClick={handleCopy}
          disabled={!processedText}
          className="px-5 py-3 bg-white text-slate-700 font-medium border border-slate-300 rounded-xl
                   hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2
                   focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          複製結果
        </button>
        <button
          onClick={() => {
            setExportFormat('txt');
            setTimeout(handleExport, 0);
          }}
          disabled={!processedText}
          className="px-5 py-3 bg-white text-slate-700 font-medium border border-slate-300 rounded-xl
                   hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2
                   focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          匯出 TXT
        </button>
        <button
          onClick={() => {
            setExportFormat('md');
            setTimeout(handleExport, 0);
          }}
          disabled={!processedText}
          className="px-5 py-3 bg-white text-slate-700 font-medium border border-slate-300 rounded-xl
                   hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2
                   focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          匯出 MD
        </button>
      </div>

      {/* 文字編輯區域 - RWD 響應式 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* 原始文稿 */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">原始文稿</h3>
            <span className="text-sm text-slate-500">
              {originalText.length} 字
            </span>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden
                        flex flex-col min-h-[400px] lg:min-h-[500px]">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="在此貼上或輸入需要 AI 處理的文稿..."
              className="flex-1 w-full p-6 border-0 outline-none resize-none text-slate-700
                       placeholder:text-slate-400 leading-relaxed bg-transparent
                       focus:ring-2 focus:ring-blue-500/10 rounded-2xl transition-all duration-200"
            />
          </div>
        </div>

        {/* 處理後文稿 */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">處理後文稿</h3>
            <span className="text-sm text-slate-500">
              {processedText.length} 字
            </span>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden
                        flex flex-col min-h-[400px] lg:min-h-[500px]">
            <div className="flex-1 p-6 overflow-y-auto">
              {processedText ? (
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {processedText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">AI 處理後的文稿將顯示在此處</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
