import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveToHistory,
  getHistory,
  getHistoryItem,
  clearHistory,
  deleteHistoryItem,
  formatTimestamp,
  isLocalStorageAvailable,
} from './storageUtils';

describe('storageUtils history management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports an empty history initially', () => {
    expect(getHistory()).toEqual([]);
  });

  it('saves an item and retrieves it back from the front of the list', () => {
    saveToHistory('原始文字', '處理後文字', ['fix-typos']);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].originalText).toBe('原始文字');
    expect(history[0].processedText).toBe('處理後文字');
    expect(history[0].features).toEqual(['fix-typos']);
  });

  it('keeps only the most recent 10 items', () => {
    for (let i = 0; i < 12; i++) {
      saveToHistory(`原始${i}`, `處理${i}`, []);
    }
    const history = getHistory();
    expect(history).toHaveLength(10);
    // Most recent save should be first
    expect(history[0].originalText).toBe('原始11');
  });

  it('finds a specific history item by id', () => {
    saveToHistory('文字A', '結果A', []);
    const [item] = getHistory();
    expect(getHistoryItem(item.id)?.originalText).toBe('文字A');
    expect(getHistoryItem('不存在的 id')).toBeNull();
  });

  it('deletes a specific history item', () => {
    saveToHistory('文字A', '結果A', []);
    saveToHistory('文字B', '結果B', []);
    const history = getHistory();
    const toDelete = history.find((h) => h.originalText === '文字A')!;
    deleteHistoryItem(toDelete.id);
    const remaining = getHistory();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].originalText).toBe('文字B');
  });

  it('clears all history', () => {
    saveToHistory('文字A', '結果A', []);
    clearHistory();
    expect(getHistory()).toEqual([]);
  });
});

describe('formatTimestamp', () => {
  it('shows "剛才" for a timestamp less than a minute ago', () => {
    expect(formatTimestamp(Date.now())).toBe('剛才');
  });

  it('shows minutes ago for recent timestamps', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(formatTimestamp(fiveMinutesAgo)).toBe('5 分鐘前');
  });

  it('shows hours ago for older timestamps', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(formatTimestamp(twoHoursAgo)).toBe('2 小時前');
  });
});

describe('isLocalStorageAvailable', () => {
  it('returns true in the jsdom test environment', () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });
});
