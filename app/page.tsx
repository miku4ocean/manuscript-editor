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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-gray-300 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <h1 className="text-4xl font-bold text-gray-900">文字編輯神器</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'ai' ? (
        <AIEditor />
      ) : (
        <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Features Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⚙️</span>功能選項
          </h2>

          {/* Feature Checkboxes - Evenly Spaced Row */}
          <div className="flex justify-between items-center">
            {features.map((feature) => (
              <label
                key={feature.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={enabledFeatures.has(feature.id)}
                  onChange={() => toggleFeature(feature.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  {feature.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="px-6 py-2 bg-white border-2 border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            🖊️ {isProcessing ? '處理中...' : '處理文稿'}
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
            📋 {copySuccess ? '已複製!' : '複製結果'}
          </button>
          <button
            onClick={handleExport}
            disabled={!processedText}
            className="px-5 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ↓ 匯出 TXT
          </button>
        </div>

        {/* Text Areas - Side by Side */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original Text */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">原始文稿</h3>
            <div className="border-4 border-red-500 rounded-lg bg-white" style={{ height: '530px' }}>
              {diffSegments.length > 0 ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'delete') {
                          return (
                            <span key={index} className="text-red-600 font-bold">
                              {segment.text}
                            </span>
                          );
                        }
                        // Don't show 'insert' segments in original text
                        return null;
                      })}
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                    字數: {originalText.length}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="貼上或輸入需要處理的文稿..."
                    className="flex-1 w-full p-4 border-0 outline-none resize-none font-sans text-gray-900 bg-transparent leading-relaxed overflow-y-auto"
                  />
                  <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                    字數: {originalText.length}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Processed Text */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">處理後文稿</h3>
            <div className="border-4 border-yellow-500 rounded-lg bg-white" style={{ height: '530px' }}>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {diffSegments.length > 0 ? (
                    <div className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'insert') {
                          return (
                            <span key={index} className="text-red-600 font-bold">
                              {segment.text}
                            </span>
                          );
                        }
                        // Don't show 'delete' segments in processed text
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      處理後的文稿將顯示在此處...
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

        {/* Statistics */}
        {processedText && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">新增: <strong className="text-green-700">{stats.additions}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-700">刪除: <strong className="text-red-700">{stats.deletions}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-700">修改: <strong className="text-yellow-700">{stats.modifications}</strong></span>
              </div>
            </div>
          </div>
        )}
        </main>
      )}
    </div>
  );
}
