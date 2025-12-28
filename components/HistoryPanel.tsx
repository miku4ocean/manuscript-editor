'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Chip,
  IconButton,
} from "@material-tailwind/react";
import {
  getHistory,
  clearHistory,
  deleteHistoryItem,
  formatTimestamp,
  type HistoryItem,
} from '@/lib/storageUtils';

interface HistoryPanelProps {
  onLoadHistory: (originalText: string, processedText: string) => void;
  onClose: () => void;
}

export function HistoryPanel({ onLoadHistory, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = () => {
    const items = getHistory();
    setHistory(items);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearAll = () => {
    if (confirm('確定要清除所有歷史記錄嗎？')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadHistory();
  };

  const handleLoad = (item: HistoryItem) => {
    onLoadHistory(item.originalText, item.processedText);
  };

  return (
    <Card className="p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h6">歷史記錄</Typography>
        <IconButton
          onClick={onClose}
          variant="text"
          color="blue-gray"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </IconButton>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <Typography variant="small" className="text-blue-gray-500">
            尚無歷史記錄
          </Typography>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Button
              size="sm"
              variant="outlined"
              color="red"
              onClick={handleClearAll}
              className="capitalize"
            >
              清除全部
            </Button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {history.map((item) => (
              <Card
                key={item.id}
                className="p-3 hover:shadow-md transition-shadow border border-blue-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <Typography variant="small" className="text-blue-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </Typography>
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    variant="text"
                    color="red"
                    size="sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </IconButton>
                </div>

                <Typography variant="small" className="text-blue-gray-700 line-clamp-3 mb-2">
                  {item.originalText.substring(0, 100)}
                  {item.originalText.length > 100 ? '...' : ''}
                </Typography>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {item.features.slice(0, 3).map((feature) => (
                      <Chip
                        key={feature}
                        value={getFeatureLabel(feature)}
                        color="blue"
                        size="sm"
                        className="text-xs"
                      />
                    ))}
                    {item.features.length > 3 && (
                      <Chip
                        value={`+${item.features.length - 3}`}
                        color="gray"
                        size="sm"
                        className="text-xs"
                      />
                    )}
                  </div>

                  <Button
                    onClick={() => handleLoad(item)}
                    color="blue"
                    size="sm"
                    className="capitalize shrink-0"
                  >
                    載入
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function getFeatureLabel(featureId: string): string {
  const labels: Record<string, string> = {
    'simplified-to-traditional': '簡轉繁',
    'add-spaces': '加空白',
    'fix-typos': '錯字',
    'remove-redundancy': '贅字',
    'fix-punctuation': '標點',
    'segment-paragraphs': '分段',
    'remove-timestamps': '時間戳',
  };
  return labels[featureId] || featureId;
}
