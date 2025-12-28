/**
 * Simple Dictionary Test Script
 * Tests the current dictionaries with sample text
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data
const testCases = {
  s2t: {
    input: '我使用电脑软件来进行网络开发工作',
    description: '簡繁轉換測試'
  },
  typo: {
    input: '座落在山上的房子，帳單很貴，金璧輝煌的大廳',
    description: '錯字修正測試'
  },
  redundancy: {
    input: '其實，基本上，老實說這個想法很好。',
    description: '贅字移除測試'
  },
  punctuation: {
    input: '你好,世界.這是測試???',
    description: '標點符號修正測試'
  }
};

// Load dictionaries
console.log('\n========== 載入字典 ==========\n');

const dictPath = join(__dirname, 'public', 'dictionaries');

let s2tDict = {};
let typoDict = {};
let redundancyDict = {};

try {
  s2tDict = JSON.parse(readFileSync(join(dictPath, 's2t-dictionary.json'), 'utf8'));
  console.log(`✅ S2T 字典載入: ${Object.keys(s2tDict).length} 個字詞`);
} catch (e) {
  console.error('❌ S2T 字典載入失敗:', e.message);
}

try {
  typoDict = JSON.parse(readFileSync(join(dictPath, 'typo-dictionary.json'), 'utf8'));
  console.log(`✅ 錯字字典載入: ${Object.keys(typoDict).length} 個字詞`);
} catch (e) {
  console.error('❌ 錯字字典載入失敗:', e.message);
}

try {
  redundancyDict = JSON.parse(readFileSync(join(dictPath, 'redundancy-dictionary.json'), 'utf8'));
  const fillerCount = redundancyDict.fillerWords?.length || 0;
  const patternCount = redundancyDict.patterns?.length || 0;
  const phraseCount = redundancyDict.redundantPhrases?.length || 0;
  console.log(`✅ 贅字字典載入: ${fillerCount} 個發語詞, ${patternCount} 個模式, ${phraseCount} 個片語`);
} catch (e) {
  console.error('❌ 贅字字典載入失敗:', e.message);
}

// Simple test functions
function testS2T(text, dict) {
  let result = text;
  for (const [simp, trad] of Object.entries(dict)) {
    result = result.replace(new RegExp(simp, 'g'), trad);
  }
  return result;
}

function testTypoFix(text, dict) {
  let result = text;
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const typo of sortedKeys) {
    const correction = dict[typo];
    result = result.replace(new RegExp(typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correction);
  }
  return result;
}

function testRedundancy(text, dict) {
  let result = text;

  // Remove filler words
  if (dict.fillerWords) {
    for (const filler of dict.fillerWords) {
      result = result.replace(new RegExp(filler, 'g'), '');
    }
  }

  // Clean up extra punctuation and spaces
  result = result.replace(/，+/g, '，');
  result = result.replace(/\s{2,}/g, ' ');
  result = result.trim();

  return result;
}

function testPunctuation(text) {
  let result = text;

  // Half-width to full-width
  result = result.replace(/,/g, '，');
  result = result.replace(/\./g, '。');

  // Remove duplicate punctuation
  result = result.replace(/？{2,}/g, '？');
  result = result.replace(/。{2,}/g, '。');

  return result;
}

// Run tests
console.log('\n========== 執行測試 ==========\n');

// Test 1: S2T
console.log(`【測試 1】 ${testCases.s2t.description}`);
console.log(`輸入: ${testCases.s2t.input}`);
const s2tResult = testS2T(testCases.s2t.input, s2tDict);
console.log(`輸出: ${s2tResult}`);
console.log(`結果: ${s2tResult.includes('電') && s2tResult.includes('軟') ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Typo Fix
console.log(`【測試 2】 ${testCases.typo.description}`);
console.log(`輸入: ${testCases.typo.input}`);
const typoResult = testTypoFix(testCases.typo.input, typoDict);
console.log(`輸出: ${typoResult}`);
console.log(`結果: ${typoResult.includes('坐落') ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Redundancy
console.log(`【測試 3】 ${testCases.redundancy.description}`);
console.log(`輸入: ${testCases.redundancy.input}`);
const redundancyResult = testRedundancy(testCases.redundancy.input, redundancyDict);
console.log(`輸出: ${redundancyResult}`);
console.log(`結果: ${!redundancyResult.includes('其實') ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Punctuation
console.log(`【測試 4】 ${testCases.punctuation.description}`);
console.log(`輸入: ${testCases.punctuation.input}`);
const punctResult = testPunctuation(testCases.punctuation.input);
console.log(`輸出: ${punctResult}`);
console.log(`結果: ${punctResult.includes('，') && punctResult.includes('。') ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('========== 測試完成 ==========\n');
