'use client';

import { useState, useEffect } from 'react';
import {
  Navbar,
  Typography,
} from "@material-tailwind/react";
import { FeatureToggles } from './FeatureToggles';
import { TextAreas } from './TextAreas';
import { ActionButtons } from './ActionButtons';
import { Statistics } from './Statistics';
import { HistoryPanel } from './HistoryPanel';
import {
  processText,
  preloadDictionaries,
  type FeatureType,
} from '@/lib/textProcessor';
import { calculateDiff, calculateStatistics, type DiffSegment } from '@/lib/diffUtils';
import { saveToHistory } from '@/lib/storageUtils';

export function Editor() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [enabledFeatures, setEnabledFeatures] = useState<Set<FeatureType>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffSegments, setDiffSegments] = useState<DiffSegment[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Preload dictionaries on mount
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
      setProcessingTime(result.processingTime);

      // Calculate diff
      const segments = calculateDiff(originalText, result.text);
      setDiffSegments(segments);

      // Save to history
      saveToHistory(originalText, result.text, Array.from(enabledFeatures));
    } catch (error) {
      console.error('Processing error:', error);
      alert('處理文稿時發生錯誤，請稍後再試');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFeature = (featureId: FeatureType) => {
    const newFeatures = new Set(enabledFeatures);
    if (newFeatures.has(featureId)) {
      newFeatures.delete(featureId);
    } else {
      newFeatures.add(featureId);
    }
    setEnabledFeatures(newFeatures);
  };

  const handleSelectAll = () => {
    const allFeatures: FeatureType[] = [
      'simplified-to-traditional',
      'add-spaces',
      'fix-typos',
      'remove-redundancy',
      'fix-punctuation',
      'segment-paragraphs',
      'remove-timestamps',
    ];
    setEnabledFeatures(new Set(allFeatures));
  };

  const handleClearAll = () => {
    setEnabledFeatures(new Set());
  };

  const handleReset = () => {
    setOriginalText('');
    setProcessedText('');
    setDiffSegments([]);
    setProcessingTime(0);
  };

  const handleLoadHistory = (original: string, processed: string) => {
    setOriginalText(original);
    setProcessedText(processed);
    const segments = calculateDiff(original, processed);
    setDiffSegments(segments);
    setShowHistory(false);
  };

  const statistics = diffSegments.length > 0 ? calculateStatistics(diffSegments) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Material Design Navbar */}
      <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 py-3 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-blue-gray-900 mb-4">
            <div>
              <Typography variant="h4" className="font-bold">
                Manuscript Editor
              </Typography>
              <Typography variant="small" className="text-blue-gray-600 mt-1">
                專業文稿編輯工具 - 教育部字典支援
              </Typography>
            </div>
            <a
              href="https://github.com/yourusername/manuscript-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-gray-600 hover:text-blue-gray-900 transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          {/* Feature Toggles */}
          <div className="mb-4">
            <FeatureToggles
              enabledFeatures={enabledFeatures}
              onToggle={handleToggleFeature}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Action Buttons */}
          <div>
            <ActionButtons
              onProcess={handleProcess}
              onReset={handleReset}
              onToggleHistory={() => setShowHistory(!showHistory)}
              processedText={processedText}
              isProcessing={isProcessing}
              hasProcessedText={!!processedText}
            />
          </div>
        </div>
      </Navbar>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Text Areas */}
          <div className="flex-1">
            <TextAreas
              originalText={originalText}
              processedText={processedText}
              diffSegments={diffSegments}
              onOriginalTextChange={setOriginalText}
            />
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="w-80">
              <HistoryPanel
                onLoadHistory={handleLoadHistory}
                onClose={() => setShowHistory(false)}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mt-6">
            <Statistics
              statistics={statistics}
              processingTime={processingTime}
              originalLength={originalText.length}
              processedLength={processedText.length}
            />
          </div>
        )}
      </main>
    </div>
  );
}
