/**
 * LocalStorage Utilities
 * Manage history and preferences
 */

const HISTORY_KEY = 'manuscript-editor-history';
const MAX_HISTORY_ITEMS = 10;

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  processedText: string;
  features: string[]; // Array of enabled feature IDs
}

/**
 * Save a processed text to history
 */
export function saveToHistory(
  originalText: string,
  processedText: string,
  enabledFeatures: string[]
): void {
  try {
    const history = getHistory();

    const newItem: HistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      originalText: truncateText(originalText),
      processedText: truncateText(processedText),
      features: enabledFeatures,
    };

    // Add to beginning of array
    history.unshift(newItem);

    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

/**
 * Get all history items
 */
export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Get a specific history item by ID
 */
export function getHistoryItem(id: string): HistoryItem | null {
  const history = getHistory();
  return history.find((item) => item.id === id) || null;
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '剛才';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text for storage (to avoid localStorage quota issues)
 */
function truncateText(text: string, maxLength: number = 5000): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if LocalStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
