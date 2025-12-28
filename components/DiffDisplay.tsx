'use client';

import { getDiffColorClass, getDiffLabel, type DiffSegment } from '@/lib/diffUtils';

interface DiffDisplayProps {
  segments: DiffSegment[];
}

export function DiffDisplay({ segments }: DiffDisplayProps) {
  return (
    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.type === 'equal') {
          return <span key={index}>{segment.text}</span>;
        }

        const colorClass = getDiffColorClass(segment.type);
        const label = getDiffLabel(segment.type);

        return (
          <span
            key={index}
            className={`${colorClass} px-0.5 rounded relative group`}
            title={label}
          >
            {segment.text}
            {/* Tooltip on hover */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
