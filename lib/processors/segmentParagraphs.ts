/**
 * Feature 6: 語義分段
 * Segment text into paragraphs based on rules
 */

interface SegmentOptions {
  maxParagraphLength?: number; // Maximum characters per paragraph
  minParagraphLength?: number; // Minimum characters per paragraph
  dialogueNewLine?: boolean; // Put dialogue on separate lines
}

const DEFAULT_OPTIONS: Required<SegmentOptions> = {
  maxParagraphLength: 1000, // Increased to avoid breaking natural paragraphs
  minParagraphLength: 50,
  dialogueNewLine: false, // Disabled by default to preserve original formatting
};

export function segmentParagraphs(
  text: string,
  options: SegmentOptions = {}
): string {
  if (!text) return text;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = text;

  // 1. Normalize single line breaks to spaces (merge continuous sentences)
  // Only preserve double line breaks as paragraph separators
  // This handles the case where single \n should not create a new paragraph
  result = result.replace(/([^\n])\n([^\n])/g, '$1 $2');

  // 2. Normalize multiple line breaks to exactly double
  result = result.replace(/\n{2,}/g, '\n\n');

  // 3. Split into paragraphs
  const paragraphs = result.split(/\n\n/);

  const processedParagraphs = paragraphs.map((para) => {
    // Skip empty paragraphs
    if (!para.trim()) return '';

    // 3. Handle dialogue - extract dialogue and put on separate lines
    if (opts.dialogueNewLine && /[「『"]/.test(para)) {
      // Split by dialogue markers
      const parts: string[] = [];
      let currentPart = '';
      let inDialogue = false;
      let dialogueChar = '';

      for (let i = 0; i < para.length; i++) {
        const char = para[i];

        if (char === '「' || char === '『' || char === '"') {
          if (currentPart.trim()) {
            parts.push(currentPart.trim());
          }
          currentPart = char;
          inDialogue = true;
          dialogueChar = char;
        } else if (
          (char === '」' && dialogueChar === '「') ||
          (char === '』' && dialogueChar === '『') ||
          (char === '"' && dialogueChar === '"')
        ) {
          currentPart += char;
          parts.push(currentPart.trim());
          currentPart = '';
          inDialogue = false;
          dialogueChar = '';
        } else {
          currentPart += char;
        }
      }

      if (currentPart.trim()) {
        parts.push(currentPart.trim());
      }

      para = parts.join('\n');
    }

    // 4. Split long paragraphs
    if (para.length > opts.maxParagraphLength) {
      return splitLongParagraph(para, opts.maxParagraphLength);
    }

    return para;
  });

  // 5. Join paragraphs with double line break
  result = processedParagraphs.filter((p) => p.trim()).join('\n\n');

  // 6. Final cleanup
  result = result.replace(/\n{3,}/g, '\n\n'); // Ensure max 2 line breaks
  result = result.replace(/[ \t]+\n/g, '\n'); // Remove trailing spaces
  result = result.replace(/\n[ \t]+/g, '\n'); // Remove leading spaces

  return result.trim();
}

function splitLongParagraph(text: string, maxLength: number): string {
  // Only split at natural sentence boundaries (。！？)
  // Don't force split if there are no natural boundaries

  const sentences: string[] = [];
  let currentParagraph = '';

  // Split by Chinese sentence-ending punctuation only
  const sentenceEnders = /([。！？])/g;
  const parts = text.split(sentenceEnders);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (sentenceEnders.test(part)) {
      // This is a punctuation mark, add to current paragraph
      currentParagraph += part;

      // Only split if current paragraph is long AND we have a natural break point
      // This prevents breaking in the middle of a sentence
      if (currentParagraph.length >= maxLength) {
        if (currentParagraph.trim()) {
          sentences.push(currentParagraph.trim());
        }
        currentParagraph = '';
      }
    } else {
      // This is text content
      currentParagraph += part;
    }
  }

  // Add any remaining text
  if (currentParagraph.trim()) {
    sentences.push(currentParagraph.trim());
  }

  // If we only got one sentence, don't split it (preserve original paragraph)
  if (sentences.length <= 1) {
    return text;
  }

  return sentences.join('\n\n');
}
