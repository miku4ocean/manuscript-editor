/**
 * Export Utilities
 * Handle file export and clipboard operations
 */

/**
 * Download text as a .txt file
 */
export function downloadTextFile(text: string, filename?: string): void {
  try {
    // Generate filename if not provided
    const defaultFilename = generateFilename();
    const actualFilename = filename || defaultFilename;

    // Create blob
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = actualFilename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('下載檔案失敗');
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('複製到剪貼簿失敗');
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string = 'manuscript_edited'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}.txt`;
}

/**
 * Get text statistics
 */
export interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
}

export function getTextStatistics(text: string): TextStatistics {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;

  // Word counting (approximate for Chinese)
  // Count Chinese characters as individual words
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // Count English words
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const words = chineseChars + englishWords;

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
  };
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-TW');
}
