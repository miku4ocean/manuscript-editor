/**
 * Text Diff Utilities
 * Calculate and display differences between original and processed text
 */

import { diff_match_patch, Diff, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch';

export interface DiffSegment {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface DiffStatistics {
  insertions: number;
  deletions: number;
  modifications: number;
  totalChanges: number;
}

/**
 * Calculate diff between two texts
 */
export function calculateDiff(originalText: string, processedText: string): DiffSegment[] {
  const dmp = new diff_match_patch();
  const diffs: Diff[] = dmp.diff_main(originalText, processedText);

  // Clean up the diffs for better readability
  dmp.diff_cleanupSemantic(diffs);

  return diffs.map((diff) => {
    const [type, text] = diff;
    return {
      type: type === DIFF_DELETE ? 'delete' : type === DIFF_INSERT ? 'insert' : 'equal',
      text,
    };
  });
}

/**
 * Calculate statistics from diff segments
 */
export function calculateStatistics(segments: DiffSegment[]): DiffStatistics {
  let insertions = 0;
  let deletions = 0;

  for (const segment of segments) {
    if (segment.type === 'insert') {
      insertions += segment.text.length;
    } else if (segment.type === 'delete') {
      deletions += segment.text.length;
    }
  }

  // Count modifications as min of insertions/deletions pairs
  const modifications = Math.min(insertions, deletions);
  const totalChanges = segments.filter((s) => s.type !== 'equal').length;

  return {
    insertions,
    deletions,
    modifications,
    totalChanges,
  };
}

/**
 * Merge consecutive segments of the same type
 */
export function mergeConsecutiveSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];

  const merged: DiffSegment[] = [];
  let current = segments[0];

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].type === current.type) {
      current = {
        ...current,
        text: current.text + segments[i].text,
      };
    } else {
      merged.push(current);
      current = segments[i];
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Get color class for diff type
 */
export function getDiffColorClass(type: DiffSegment['type']): string {
  switch (type) {
    case 'insert':
      return 'bg-green-200 text-green-900';
    case 'delete':
      return 'bg-red-200 text-red-900 line-through';
    case 'equal':
    default:
      return '';
  }
}

/**
 * Get label for diff type
 */
export function getDiffLabel(type: DiffSegment['type']): string {
  switch (type) {
    case 'insert':
      return '新增';
    case 'delete':
      return '刪除';
    case 'equal':
      return '相同';
    default:
      return '';
  }
}
