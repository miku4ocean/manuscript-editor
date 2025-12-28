'use client';

import { useState } from 'react';
import { Button, Spinner } from "@material-tailwind/react";
import { downloadTextFile, copyToClipboard } from '@/lib/exportUtils';

interface ActionButtonsProps {
  onProcess: () => void;
  onReset: () => void;
  onToggleHistory: () => void;
  processedText: string;
  isProcessing: boolean;
  hasProcessedText: boolean;
}

export function ActionButtons({
  onProcess,
  onReset,
  onToggleHistory,
  processedText,
  isProcessing,
  hasProcessedText,
}: ActionButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(processedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      alert('複製失敗，請稍後再試');
    }
  };

  const handleExport = () => {
    try {
      downloadTextFile(processedText);
    } catch (error) {
      alert('匯出失敗，請稍後再試');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Process Button */}
      <Button
        onClick={onProcess}
        disabled={isProcessing}
        color="blue"
        size="md"
        className="flex items-center gap-2 capitalize"
      >
        {isProcessing ? (
          <>
            <Spinner className="h-4 w-4" />
            處理中...
          </>
        ) : (
          '處理文稿'
        )}
      </Button>

      {/* Export Button */}
      {hasProcessedText && (
        <>
          <Button
            onClick={handleExport}
            color="green"
            size="md"
            className="capitalize"
          >
            匯出
          </Button>

          <Button
            onClick={handleCopy}
            color="purple"
            size="md"
            className="capitalize"
          >
            {copySuccess ? '已複製!' : '複製'}
          </Button>
        </>
      )}

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="outlined"
        color="gray"
        size="md"
        className="capitalize"
      >
        重置
      </Button>

      {/* History Button */}
      <Button
        onClick={onToggleHistory}
        variant="outlined"
        color="gray"
        size="md"
        className="capitalize"
      >
        歷史記錄
      </Button>
    </div>
  );
}
