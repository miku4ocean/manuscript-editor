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
  { id: 'simplified-to-traditional' as FeatureType, name: '簡體轉繁體', icon: '🔄', desc: '簡體中文轉換為繁體' },
  { id: 'add-spaces' as FeatureType, name: '英文加空白', icon: '␣', desc: '中英文間自動加空格' },
  { id: 'fix-typos' as FeatureType, name: '修正錯字', icon: '✏️', desc: '根據字典修正常見錯字' },
  { id: 'remove-redundancy' as FeatureType, name: '刪除贅字', icon: '🗑️', desc: '移除不必要的發語詞' },
  { id: 'fix-punctuation' as FeatureType, name: '修正標點', icon: '。', desc: '統一全形半形標點' },
  { id: 'segment-paragraphs' as FeatureType, name: '語義分段', icon: '¶', desc: '自動分段提升可讀性' },
  { id: 'remove-timestamps' as FeatureType, name: '刪除時間戳', icon: '⏱️', desc: '移除字幕時間標記' },
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
  const [processingTime, setProcessingTime] = useState<number | null>(null);

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
    const startTime = performance.now();

    try {
      const result = await processText(originalText, { enabledFeatures });
      setProcessedText(result.text);
      const segments = calculateDiff(originalText, result.text);
      setDiffSegments(segments);

      const additions = segments.filter(s => s.type === 'insert').length;
      const deletions = segments.filter(s => s.type === 'delete').length;
      const modifications = segments.filter(s => s.type !== 'equal' && s.type !== 'insert' && s.type !== 'delete').length;
      setStats({ additions, deletions, modifications });
      setProcessingTime((performance.now() - startTime) / 1000);
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
    setProcessingTime(null);
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

  const selectAll = () => {
    setEnabledFeatures(new Set(features.map(f => f.id)));
  };

  const clearAll = () => {
    setEnabledFeatures(new Set());
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="header-gradient">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%)' }}>
                ✨
              </div>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  文字編輯神器
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  專業文稿處理工具
                </p>
              </div>
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
        <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
          {/* Feature Selection Card */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>處理功能</h2>
                <span className="badge badge-brand">{enabledFeatures.size} 項已選</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="btn btn-ghost text-xs">
                  全選
                </button>
                <button onClick={clearAll} className="btn btn-ghost text-xs">
                  清除
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="feature-grid">
                {features.map((feature) => {
                  const isChecked = enabledFeatures.has(feature.id);
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

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={handleProcess}
              disabled={isProcessing || enabledFeatures.size === 0}
              className="btn btn-primary px-8"
            >
              {isProcessing ? (
                <>
                  <span className="animate-pulse">⏳</span>
                  處理中...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  處理文稿
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
            <button
              onClick={handleExport}
              disabled={!processedText}
              className="btn btn-secondary"
            >
              📥 匯出
            </button>
            <button
              onClick={handleReset}
              className="btn btn-ghost"
            >
              🗑️ 清除
            </button>
          </div>

          {/* Statistics */}
          {processedText && (
            <div className="flex justify-center mb-6 animate-slide-up">
              <div className="stats-group">
                <div className="stat-item">
                  <span className="badge badge-success">+{stats.additions}</span>
                  <span>新增</span>
                </div>
                <div className="stat-item">
                  <span className="badge badge-error">-{stats.deletions}</span>
                  <span>刪除</span>
                </div>
                <div className="stat-item">
                  <span className="badge badge-warning">~{stats.modifications}</span>
                  <span>修改</span>
                </div>
                {processingTime !== null && (
                  <div className="stat-item">
                    <span className="badge badge-brand">{processingTime.toFixed(2)}s</span>
                    <span>處理時間</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
                {diffSegments.length > 0 ? (
                  <div className="p-4 overflow-y-auto" style={{ height: '500px' }}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'delete') {
                          return (
                            <span key={index} className="diff-delete">
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
                    placeholder="在此貼上或輸入您要處理的文稿..."
                    className="w-full border-0 outline-none resize-none text-sm leading-relaxed p-4"
                    style={{
                      height: '500px',
                      color: 'var(--text-primary)',
                      background: 'transparent'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Processed Text */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>處理後文稿</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  {processedText.length.toLocaleString()} 字
                </span>
              </div>
              <div className="card-body p-0">
                <div className="overflow-y-auto p-4" style={{ height: '500px' }}>
                  {diffSegments.length > 0 ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {diffSegments.map((segment, index) => {
                        if (segment.type === 'equal') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'insert') {
                          return (
                            <span key={index} className="diff-insert">
                              {segment.text}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="empty-state h-full">
                      <div className="empty-state-icon">📄</div>
                      <p className="text-sm">處理後的結果將顯示在此</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
                        選擇功能並點擊「處理文稿」開始
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-4 rounded-xl" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--brand-700)' }}>使用提示</h4>
                <p className="text-xs" style={{ color: 'var(--brand-600)' }}>
                  建議先使用「簡體轉繁體」功能，再配合其他處理選項。處理完成後，變更處會以顏色標示：
                  <span className="diff-insert mx-1">綠色為新增</span>
                  <span className="diff-delete mx-1">紅色為刪除</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
