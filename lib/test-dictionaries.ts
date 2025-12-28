/**
 * Dictionary Functionality Test Suite
 * Tests all three dictionaries: s2t, typo, redundancy
 */

import { simplifiedToTraditionalAsync, loadS2TDictionary } from './processors/simplifiedToTraditional';
import { fixTypos, loadTypoDictionary } from './processors/fixTypos';
import { removeRedundancy, loadRedundancyDictionary } from './processors/removeRedundancy';
import { fixPunctuation } from './processors/fixPunctuation';

interface TestResult {
  testName: string;
  passed: boolean;
  original: string;
  result: string;
  expected?: string;
  dictionarySize?: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('\n='.repeat(60));
  console.log('🧪 開始字典功能測試');
  console.log('='.repeat(60) + '\n');

  // ========== Test 1: S2T Dictionary ==========
  console.log('📚 測試 1: 簡繁字典 (s2t-dictionary.json)');
  console.log('-'.repeat(60));

  try {
    const s2tDict = await loadS2TDictionary();
    const s2tSize = Object.keys(s2tDict).length;
    console.log(`✅ 字典載入成功: ${s2tSize} 個字詞對照`);

    // Test case 1.1: Basic simplified to traditional
    const s2tTest1 = '电脑软件和网络';
    const s2tResult1 = await simplifiedToTraditionalAsync(s2tTest1);
    results.push({
      testName: '簡繁轉換 - 基本測試',
      passed: s2tResult1.includes('電') && s2tResult1.includes('軟') && s2tResult1.includes('網'),
      original: s2tTest1,
      result: s2tResult1,
      expected: '電腦軟體和網路',
      dictionarySize: s2tSize
    });

    // Test case 1.2: Mixed content
    const s2tTest2 = '我使用电脑上网查资料';
    const s2tResult2 = await simplifiedToTraditionalAsync(s2tTest2);
    results.push({
      testName: '簡繁轉換 - 混合內容',
      passed: s2tResult2.includes('電') && s2tResult2.includes('網'),
      original: s2tTest2,
      result: s2tResult2,
      dictionarySize: s2tSize
    });

    console.log(`  測試 1.1: ${s2tTest1} → ${s2tResult1}`);
    console.log(`  測試 1.2: ${s2tTest2} → ${s2tResult2}`);

  } catch (error) {
    console.error('❌ 簡繁字典測試失敗:', error);
    results.push({
      testName: '簡繁字典載入',
      passed: false,
      original: '',
      result: '',
      error: String(error)
    });
  }

  console.log('');

  // ========== Test 2: Typo Dictionary ==========
  console.log('📚 測試 2: 錯字字典 (typo-dictionary.json)');
  console.log('-'.repeat(60));

  try {
    const typoDict = await loadTypoDictionary();
    const typoSize = Object.keys(typoDict).length;
    console.log(`✅ 字典載入成功: ${typoSize} 個錯字對照`);

    // Test case 2.1: User-requested examples
    const typoTest1 = '這件事很作崇';
    const typoResult1 = await fixTypos(typoTest1);
    results.push({
      testName: '錯字修正 - 作崇→作祟',
      passed: typoResult1.includes('作祟'),
      original: typoTest1,
      result: typoResult1,
      expected: '這件事很作祟',
      dictionarySize: typoSize
    });

    // Test case 2.2: 座/坐 confusion
    const typoTest2 = '這個房子座落在山上';
    const typoResult2 = await fixTypos(typoTest2);
    results.push({
      testName: '錯字修正 - 座落→坐落',
      passed: typoResult2.includes('坐落'),
      original: typoTest2,
      result: typoResult2,
      expected: '這個房子坐落在山上',
      dictionarySize: typoSize
    });

    // Test case 2.3: 帳/賬 confusion
    const typoTest3 = '請查看您的帐号和帳單';
    const typoResult3 = await fixTypos(typoTest3);
    results.push({
      testName: '錯字修正 - 帐号→賬號',
      passed: typoResult3.includes('賬號'),
      original: typoTest3,
      result: typoResult3,
      expected: '請查看您的賬號和賬單',
      dictionarySize: typoSize
    });

    // Test case 2.4: Idiom correction
    const typoTest4 = '金璧輝煌的大廳';
    const typoResult4 = await fixTypos(typoTest4);
    results.push({
      testName: '錯字修正 - 成語（金璧→金碧）',
      passed: typoResult4.includes('金碧輝煌'),
      original: typoTest4,
      result: typoResult4,
      expected: '金碧輝煌的大廳',
      dictionarySize: typoSize
    });

    // Test case 2.5: 磨擦→摩擦
    const typoTest5 = '物體之間會產生磨擦';
    const typoResult5 = await fixTypos(typoTest5);
    results.push({
      testName: '錯字修正 - 磨擦→摩擦',
      passed: typoResult5.includes('摩擦'),
      original: typoTest5,
      result: typoResult5,
      expected: '物體之間會產生摩擦',
      dictionarySize: typoSize
    });

    console.log(`  測試 2.1: ${typoTest1} → ${typoResult1}`);
    console.log(`  測試 2.2: ${typoTest2} → ${typoResult2}`);
    console.log(`  測試 2.3: ${typoTest3} → ${typoResult3}`);
    console.log(`  測試 2.4: ${typoTest4} → ${typoResult4}`);
    console.log(`  測試 2.5: ${typoTest5} → ${typoResult5}`);

  } catch (error) {
    console.error('❌ 錯字字典測試失敗:', error);
    results.push({
      testName: '錯字字典載入',
      passed: false,
      original: '',
      result: '',
      error: String(error)
    });
  }

  console.log('');

  // ========== Test 3: Redundancy Dictionary ==========
  console.log('📚 測試 3: 贅字字典 (redundancy-dictionary.json)');
  console.log('-'.repeat(60));

  try {
    const redundancyDict = await loadRedundancyDictionary();
    const fillerCount = redundancyDict.fillerWords?.length || 0;
    const patternCount = redundancyDict.patterns?.length || 0;
    const phraseCount = redundancyDict.redundantPhrases?.length || 0;

    console.log(`✅ 字典載入成功:`);
    console.log(`   - 發語詞: ${fillerCount} 個`);
    console.log(`   - 重複模式: ${patternCount} 個`);
    console.log(`   - 贅詞片語: ${phraseCount} 個`);

    // Test case 3.1: Remove filler words
    const redundTest1 = '其實，我覺得這個想法很好。';
    const redundResult1 = await removeRedundancy(redundTest1);
    results.push({
      testName: '贅字移除 - 發語詞',
      passed: !redundResult1.includes('其實') && !redundResult1.includes('我覺得'),
      original: redundTest1,
      result: redundResult1,
      expected: '這個想法很好。',
      dictionarySize: fillerCount + patternCount + phraseCount
    });

    // Test case 3.2: Remove duplicate patterns
    const redundTest2 = '這個的的確確是真的的';
    const redundResult2 = await removeRedundancy(redundTest2);
    results.push({
      testName: '贅字移除 - 重複字詞',
      passed: !redundResult2.includes('的的'),
      original: redundTest2,
      result: redundResult2,
      dictionarySize: fillerCount + patternCount + phraseCount
    });

    // Test case 3.3: Remove redundant phrases
    const redundTest3 = '廢話不多說，我們開始吧。';
    const redundResult3 = await removeRedundancy(redundTest3);
    results.push({
      testName: '贅字移除 - 贅詞片語',
      passed: !redundResult3.includes('廢話不多說'),
      original: redundTest3,
      result: redundResult3,
      expected: '我們開始吧。',
      dictionarySize: fillerCount + patternCount + phraseCount
    });

    // Test case 3.4: Remove interjections
    const redundTest4 = '喔，就是說，你懂嗎？';
    const redundResult4 = await removeRedundancy(redundTest4);
    results.push({
      testName: '贅字移除 - 語氣詞',
      passed: !redundResult4.includes('喔') && !redundResult4.includes('就是說'),
      original: redundTest4,
      result: redundResult4,
      dictionarySize: fillerCount + patternCount + phraseCount
    });

    console.log(`  測試 3.1: ${redundTest1} → ${redundResult1}`);
    console.log(`  測試 3.2: ${redundTest2} → ${redundResult2}`);
    console.log(`  測試 3.3: ${redundTest3} → ${redundResult3}`);
    console.log(`  測試 3.4: ${redundTest4} → ${redundResult4}`);

  } catch (error) {
    console.error('❌ 贅字字典測試失敗:', error);
    results.push({
      testName: '贅字字典載入',
      passed: false,
      original: '',
      result: '',
      error: String(error)
    });
  }

  console.log('');

  // ========== Test 4: Fix Punctuation (No dictionary but related) ==========
  console.log('📚 測試 4: 標點符號修正');
  console.log('-'.repeat(60));

  try {
    // Test case 4.1: Convert half-width to full-width
    const punctTest1 = '你好,世界.';
    const punctResult1 = fixPunctuation(punctTest1);
    results.push({
      testName: '標點修正 - 半形轉全形',
      passed: punctResult1.includes('，') && punctResult1.includes('。'),
      original: punctTest1,
      result: punctResult1,
      expected: '你好，世界。'
    });

    // Test case 4.2: Remove duplicate punctuation
    const punctTest2 = '真的嗎？？？';
    const punctResult2 = fixPunctuation(punctTest2);
    results.push({
      testName: '標點修正 - 移除重複標點',
      passed: punctResult2 === '真的嗎？',
      original: punctTest2,
      result: punctResult2,
      expected: '真的嗎？'
    });

    // Test case 4.3: Add period at end
    const punctTest3 = '這是一個測試';
    const punctResult3 = fixPunctuation(punctTest3);
    results.push({
      testName: '標點修正 - 自動補句號',
      passed: punctResult3.endsWith('。'),
      original: punctTest3,
      result: punctResult3,
      expected: '這是一個測試。'
    });

    console.log(`  測試 4.1: ${punctTest1} → ${punctResult1}`);
    console.log(`  測試 4.2: ${punctTest2} → ${punctResult2}`);
    console.log(`  測試 4.3: ${punctTest3} → ${punctResult3}`);

  } catch (error) {
    console.error('❌ 標點符號測試失敗:', error);
    results.push({
      testName: '標點符號修正',
      passed: false,
      original: '',
      result: '',
      error: String(error)
    });
  }

  console.log('');

  // ========== Summary ==========
  console.log('='.repeat(60));
  console.log('📊 測試結果總結');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n總測試數: ${total}`);
  console.log(`✅ 通過: ${passed}`);
  console.log(`❌ 失敗: ${failed}`);
  console.log(`通過率: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('失敗的測試:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.testName}`);
      if (r.error) {
        console.log(`     錯誤: ${r.error}`);
      } else {
        console.log(`     原文: ${r.original}`);
        console.log(`     結果: ${r.result}`);
        if (r.expected) {
          console.log(`     預期: ${r.expected}`);
        }
      }
    });
  }

  console.log('\n='.repeat(60));
  console.log('🎉 測試完成！');
  console.log('='.repeat(60) + '\n');

  return results;
}

// Export for use in other files
export { runTests };
export type { TestResult };

// If running directly in Node.js
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}
