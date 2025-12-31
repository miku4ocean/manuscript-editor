'use client';

import { useState, useEffect } from 'react';
import {
  processText,
  preloadDictionaries,
  type FeatureType,
} from '@/lib/textProcessor';
import { calculateDiff, type DiffSegment } from '@/lib/diffUtils';
import TabNavigation from '@/components/TabNavigation';
import AIEditor from '@/components/AIEditor';

const features = [
  { id: 'simplified-to-traditional' as FeatureType, name: '簡體轉繁體', desc: '將簡體中文轉為繁體' },
  { id: 'add-spaces' as FeatureType, name: '英文加空白', desc: '中英文間自動加空格' },
  { id: 'fix-typos' as FeatureType, name: '修正錯字', desc: '使用教育部字典修正' },
  { id: 'remove-redundancy' as FeatureType, name: '刪除贅字', desc: '移除冗詞和發語詞' },
  { id: 'fix-punctuation' as FeatureType, name: '修正標點', desc: '修正標點符號使用' },
  { id: 'segment-paragraphs' as FeatureType, name: '語義分段', desc: '根據語義自動分段' },
  { id: 'remove-timestamps' as FeatureType, name: '刪除時間戳', desc: '移除影片字幕時間戳' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'ai'>('dictionary');
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [enabledFeatures, setEnabledFeatures] = useState<Set<FeatureType>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffSegments, setDiffSegments] = useState<DiffSegment[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, modifications: 0 });

  useEffect(() => {
    preloadDictionaries().catch(console.error);
  }, []);

  const handleProcess = async () => {
    if (!originalText.trim()) {
      alert('請輸入原始文稿');
      return;
    }
    if (enabledFeatures.size === 0) {
      alert('請至少選擇一個處理功能');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processText(originalText, { enabledFeatures });
      setProcessedText(result.text);
      const segments = calculateDiff(originalText, result.text);
      setDiffSegments(segments);

      const additions = segments.filter(s => s.type === 'insert').length;
      const deletions = segments.filter(s => s.type === 'delete').length;
      const modifications = segments.filter(s => s.type !== 'equal' && s.type !== 'insert' && s.type !== 'delete').length;
      setStats({ additions, deletions, modifications });
    } catch (error) {
      console.error('Processing error:', error);
      alert('處理文稿時發生錯誤');
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
    setDiffSegments([]);
    setStats({ additions: 0, deletions: 0, modifications: 0 });
  };

  const toggleFeature = (featureId: FeatureType) => {
    const newFeatures = new Set(enabledFeatures);
    if (newFeatures.has(featureId)) {
      newFeatures.delete(featureId);
    } else {
      newFeatures.add(featureId);
    }
    setEnabledFeatures(newFeatures);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">文字編輯神器</h1>
              <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">專業文稿處理工具</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'ai' ? (
        <AIEditor />
      ) : (
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">處理功能</h2>
                <p className="text-sm text-slate-500 mt-0.5">選擇需要的文稿處理選項</p>
              </div>
            </div>

            {/* Feature Checkboxes - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {features.map((feature) => (
                <label
                  key={feature.id}
                  className="flex items-center gap-2 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enabledFeatures.has(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                      {feature.name}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:block">{feature.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 sm:mb-8">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isProcessing ? '處理中...' : '處理文稿'}
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清除畫面
            </button>
            <button
              onClick={handleCopy}
              disabled={!processedText}
              className="px-5 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copySuccess ? '已複製!' : '複製結果'}
            </button>
            <button
              onClick={handleExport}
              disabled={!processedText}
              className="px-5 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              匯出 TXT
            </button>
          </div>

          {/* Text Areas - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Original Text */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">原始文稿</h3>
                <span className="text-sm text-slate-500">{originalText.length} 字</span>
              </div>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-rose-200 overflow-hidden flex flex-col min-h-[400px] lg:min-h-[530px]">
                {diffSegments.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                        {diffSegments.map((segment, index) => {
                          if (segment.type === 'equal') {
                            return <span key={index}>{segment.text}</span>;
                          } else if (segment.type === 'delete') {
                            return (
                              <span key={index} className="bg-rose-100 text-rose-700 font-semibold rounded px-0.5">
                                {segment.text}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      placeholder="在此貼上或輸入需要處理的文稿..."
                      className="flex-1 w-full p-6 border-0 outline-none resize-none font-sans text-slate-700 bg-transparent leading-relaxed overflow-y-auto placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 rounded-2xl transition-all duration-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Processed Text */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">處理後文稿</h3>
                <span className="text-sm text-slate-500">{processedText ? processedText.length : 0} 字</span>
              </div>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-amber-200 overflow-hidden flex flex-col min-h-[400px] lg:min-h-[530px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    {diffSegments.length > 0 ? (
                      <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                        {diffSegments.map((segment, index) => {
                          if (segment.type === 'equal') {
                            return <span key={index}>{segment.text}</span>;
                          } else if (segment.type === 'insert') {
                            return (
                              <span key={index} className="bg-amber-100 text-amber-700 font-semibold rounded px-0.5">
                                {segment.text}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        處理後的文稿將顯示在此處...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {processedText && (
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-slate-800">處理統計</h4>
              </div>
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-sm"></span>
                  <span className="text-sm text-slate-600">新增: <strong className="text-emerald-700 font-semibold">{stats.additions}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-sm"></span>
                  <span className="text-sm text-slate-600">刪除: <strong className="text-rose-700 font-semibold">{stats.deletions}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-sm"></span>
                  <span className="text-sm text-slate-600">修改: <strong className="text-amber-700 font-semibold">{stats.modifications}</strong></span>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
