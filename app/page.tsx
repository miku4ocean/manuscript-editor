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
  { id: 'simplified-to-traditional' as FeatureType, name: '簡體轉繁體' },
  { id: 'add-spaces' as FeatureType, name: '英文加空白' },
  { id: 'fix-typos' as FeatureType, name: '修正錯字' },
  { id: 'remove-redundancy' as FeatureType, name: '刪除贅字' },
  { id: 'fix-punctuation' as FeatureType, name: '修正標點' },
  { id: 'segment-paragraphs' as FeatureType, name: '語義分段' },
  { id: 'remove-timestamps' as FeatureType, name: '刪除時間戳' },
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
    <div className="min-h-screen" style={{ background: 'var(--nordic-bg-primary)' }}>
      {/* Simple Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--nordic-border-color)' }}>
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
            文字編輯神器
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'ai' ? (
        <AIEditor />
      ) : (
        <main className="max-w-[1400px] mx-auto px-12">
          {/* Feature Options - Grid layout for perfect alignment */}
          <div className="py-20 border-b" style={{ borderColor: '#f0f0f0' }}>
            <div className="grid grid-cols-4 gap-x-12 gap-y-12 max-w-[900px] mx-auto">
              {features.map((feature) => (
                <label
                  key={feature.id}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={enabledFeatures.has(feature.id)}
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

          {/* Action Buttons - More spacing from options */}
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
                {diffSegments.length > 0 ? (
                  <div className="h-full overflow-y-auto p-10">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--nordic-text-primary)' }}>
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'delete') {
                          return (
                            <span key={index} className="font-medium px-1" style={{ background: '#fee', color: '#c55' }}>
                              {segment.text}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ) : (
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
                )}
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
                  {diffSegments.length > 0 ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--nordic-text-primary)' }}>
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'insert') {
                          return (
                            <span key={index} className="font-medium px-1" style={{ background: '#ffc', color: '#960' }}>
                              {segment.text}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                      處理結果將顯示在此...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics - Minimal design */}
          {processedText && (
            <div className="mt-20 flex items-center justify-center gap-8 text-xs font-medium" style={{ color: '#a0aec0' }}>
              <span>新增 <strong style={{ color: '#48bb78' }}>{stats.additions}</strong></span>
              <span className="opacity-30">·</span>
              <span>刪除 <strong style={{ color: '#f56565' }}>{stats.deletions}</strong></span>
              <span className="opacity-30">·</span>
              <span>修改 <strong style={{ color: '#ed8936' }}>{stats.modifications}</strong></span>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
