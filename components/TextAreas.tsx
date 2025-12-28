'use client';

import { Card, Typography, Textarea } from "@material-tailwind/react";
import { DiffDisplay } from './DiffDisplay';
import { getTextStatistics, formatNumber } from '@/lib/exportUtils';
import type { DiffSegment } from '@/lib/diffUtils';

interface TextAreasProps {
  originalText: string;
  processedText: string;
  diffSegments: DiffSegment[];
  onOriginalTextChange: (text: string) => void;
}

export function TextAreas({
  originalText,
  processedText,
  diffSegments,
  onOriginalTextChange,
}: TextAreasProps) {
  const originalStats = getTextStatistics(originalText);
  const processedStats = getTextStatistics(processedText);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Original Text Card */}
      <Card className="p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" color="blue-gray">
            原始文稿 (Before)
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            共 {formatNumber(originalStats.characters)} 字
          </Typography>
        </div>
        <Textarea
          value={originalText}
          onChange={(e) => onOriginalTextChange(e.target.value)}
          placeholder="請貼上或輸入需要處理的文稿..."
          className="min-h-[500px] !border-blue-gray-200 focus:!border-blue-500"
          labelProps={{
            className: "before:content-none after:content-none",
          }}
        />
      </Card>

      {/* Processed Text Card */}
      <Card className="p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" color="blue-gray">
            處理後文稿 (After)
          </Typography>
          {processedText && (
            <Typography variant="small" className="text-blue-gray-500">
              共 {formatNumber(processedStats.characters)} 字
            </Typography>
          )}
        </div>
        {diffSegments.length > 0 ? (
          <div className="min-h-[500px] w-full p-3 border border-blue-gray-200 rounded-lg bg-white overflow-auto">
            <DiffDisplay segments={diffSegments} />
          </div>
        ) : (
          <div className="min-h-[500px] w-full p-3 border border-blue-gray-200 rounded-lg bg-blue-gray-50 flex items-center justify-center">
            <Typography variant="small" className="text-blue-gray-400">
              處理後的文稿將顯示在此處...
            </Typography>
          </div>
        )}
      </Card>
    </div>
  );
}
