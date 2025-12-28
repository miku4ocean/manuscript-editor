'use client';

import { Card, Typography, Chip } from "@material-tailwind/react";
import { formatNumber } from '@/lib/exportUtils';
import type { DiffStatistics } from '@/lib/diffUtils';

interface StatisticsProps {
  statistics: DiffStatistics;
  processingTime: number;
  originalLength: number;
  processedLength: number;
}

export function Statistics({
  statistics,
  processingTime,
  originalLength,
  processedLength,
}: StatisticsProps) {
  const changePercentage =
    originalLength > 0
      ? (((originalLength - processedLength) / originalLength) * 100).toFixed(1)
      : '0';

  return (
    <Card className="p-5 shadow-lg">
      <Typography variant="h6" className="mb-4 text-blue-gray-700">
        處理統計
      </Typography>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatChip
          label="新增"
          value={formatNumber(statistics.insertions)}
          unit="字"
          color="green"
        />
        <StatChip
          label="刪除"
          value={formatNumber(statistics.deletions)}
          unit="字"
          color="red"
        />
        <StatChip
          label="變更處數"
          value={formatNumber(statistics.totalChanges)}
          unit="處"
          color="blue"
        />
        <StatChip
          label="字數變化"
          value={changePercentage}
          unit="%"
          color={Number(changePercentage) > 0 ? "amber" : "green"}
        />
        <StatChip
          label="處理時間"
          value={processingTime.toFixed(2)}
          unit="秒"
          color="gray"
        />
        <StatChip
          label="處理後字數"
          value={formatNumber(processedLength)}
          unit="字"
          color="gray"
        />
      </div>
    </Card>
  );
}

function StatChip({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: "green" | "red" | "blue" | "amber" | "gray";
}) {
  return (
    <div className="flex flex-col items-center p-3 bg-blue-gray-50/50 rounded-lg">
      <Typography variant="small" className="text-blue-gray-500 mb-2 text-center">
        {label}
      </Typography>
      <Chip
        value={
          <span className="font-bold">
            {value}
            <span className="text-xs font-normal ml-1">{unit}</span>
          </span>
        }
        color={color}
        size="lg"
        className="rounded-full"
      />
    </div>
  );
}
