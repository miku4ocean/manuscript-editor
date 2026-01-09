/**
 * 功能完整性測試腳本
 * Manuscript Editor - 所有核心功能測試
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results storage
const testResults = {
    passed: [],
    failed: [],
    warnings: []
};

function logTest(testId, testName, passed, input, output, expected = null) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} [${testId}] ${testName}`);
    console.log(`  輸入: "${input}"`);
    console.log(`  輸出: "${output}"`);
    if (expected) {
        console.log(`  預期: "${expected}"`);
    }

    if (passed) {
        testResults.passed.push({ testId, testName });
    } else {
        testResults.failed.push({ testId, testName, input, output, expected });
    }
}

function logWarning(testId, message) {
    console.log(`⚠️ WARNING [${testId}] ${message}`);
    testResults.warnings.push({ testId, message });
}

// ============================================
// Test 1: Dictionary Files Check
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📁 測試 1: 字典檔案完整性檢查');
console.log('='.repeat(60));

const dictPath = path.join(__dirname, 'public/dictionaries');
const requiredDicts = [
    'typo-dictionary.json',
    'redundancy-dictionary.json',
    's2t-dictionary.json'
];

for (const dict of requiredDicts) {
    const exists = fs.existsSync(path.join(dictPath, dict));
    logTest(
        `DICT-${dict.split('.')[0]}`,
        `字典檔案 ${dict} 存在`,
        exists,
        dict,
        exists ? '存在' : '不存在'
    );
}

// ============================================
// Test 2: Typo Dictionary Content
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📝 測試 2: 錯字字典內容驗證');
console.log('='.repeat(60));

const typoDict = JSON.parse(fs.readFileSync(path.join(dictPath, 'typo-dictionary.json'), 'utf8'));
const typoCount = Object.keys(typoDict).length;
logTest(
    'TYPO-001',
    '錯字字典條目數量 > 100',
    typoCount > 100,
    '條目數量',
    typoCount.toString(),
    '> 100'
);

// Test specific entries
const typoTests = [
    { wrong: '作崇', correct: '作祟' },
    { wrong: '磨擦', correct: '摩擦' },
    { wrong: '座落', correct: '坐落' }
];

for (const test of typoTests) {
    const actual = typoDict[test.wrong];
    logTest(
        `TYPO-${test.wrong}`,
        `錯字修正: ${test.wrong} → ${test.correct}`,
        actual === test.correct,
        test.wrong,
        actual || '(無對應)',
        test.correct
    );
}

// ============================================
// Test 3: Redundancy Dictionary Content
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🗑️ 測試 3: 贅字字典內容驗證');
console.log('='.repeat(60));

const redundancyDict = JSON.parse(fs.readFileSync(path.join(dictPath, 'redundancy-dictionary.json'), 'utf8'));

const hasFillerWords = redundancyDict.fillerWords && Array.isArray(redundancyDict.fillerWords);
logTest(
    'REDUNDANCY-001',
    '贅字字典包含 fillerWords 陣列',
    hasFillerWords,
    'fillerWords',
    hasFillerWords ? `${redundancyDict.fillerWords.length} 項` : '不存在'
);

const hasPatterns = redundancyDict.patterns && Array.isArray(redundancyDict.patterns);
logTest(
    'REDUNDANCY-002',
    '贅字字典包含 patterns 陣列',
    hasPatterns,
    'patterns',
    hasPatterns ? `${redundancyDict.patterns.length} 項` : '不存在'
);

// Check for common filler words
const expectedFillers = ['其實', '基本上', '然後'];
for (const filler of expectedFillers) {
    const exists = redundancyDict.fillerWords?.includes(filler);
    logTest(
        `REDUNDANCY-FILLER-${filler}`,
        `發語詞「${filler}」存在於字典`,
        exists,
        filler,
        exists ? '存在' : '不存在'
    );
}

// ============================================
// Test 4: S2T Dictionary Content
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🔄 測試 4: 簡繁轉換字典內容驗證');
console.log('='.repeat(60));

const s2tDict = JSON.parse(fs.readFileSync(path.join(dictPath, 's2t-dictionary.json'), 'utf8'));
const s2tCount = Object.keys(s2tDict).length;
logTest(
    'S2T-001',
    '簡繁轉換字典條目數量 > 1000',
    s2tCount > 1000,
    '條目數量',
    s2tCount.toString(),
    '> 1000'
);

// Test specific conversions
const s2tTests = [
    { simplified: '简', traditional: '簡' },
    { simplified: '体', traditional: '體' },
    { simplified: '汉', traditional: '漢' }
];

for (const test of s2tTests) {
    const actual = s2tDict[test.simplified];
    logTest(
        `S2T-${test.simplified}`,
        `簡繁轉換: ${test.simplified} → ${test.traditional}`,
        actual === test.traditional,
        test.simplified,
        actual || '(無對應)',
        test.traditional
    );
}

// ============================================
// Test 5: Processor Files Existence
// ============================================
console.log('\n' + '='.repeat(60));
console.log('⚙️ 測試 5: 處理器檔案完整性');
console.log('='.repeat(60));

const processorsPath = path.join(__dirname, 'lib/processors');
const requiredProcessors = [
    'simplifiedToTraditional.ts',
    'addSpacesAroundEnglish.ts',
    'fixTypos.ts',
    'removeRedundancy.ts',
    'fixPunctuation.ts',
    'segmentParagraphs.ts',
    'removeTimestamps.ts'
];

for (const processor of requiredProcessors) {
    const exists = fs.existsSync(path.join(processorsPath, processor));
    logTest(
        `PROC-${processor.split('.')[0]}`,
        `處理器 ${processor} 存在`,
        exists,
        processor,
        exists ? '存在' : '不存在'
    );
}

// ============================================
// Test 6: Component Files Existence
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🧩 測試 6: React 組件檔案完整性');
console.log('='.repeat(60));

const componentsPath = path.join(__dirname, 'components');
const requiredComponents = [
    'AIEditor.tsx',
    'TabNavigation.tsx',
    'Editor.tsx',
    'FeatureToggles.tsx',
    'TextAreas.tsx',
    'DiffDisplay.tsx',
    'ActionButtons.tsx',
    'Statistics.tsx',
    'HistoryPanel.tsx'
];

for (const component of requiredComponents) {
    const exists = fs.existsSync(path.join(componentsPath, component));
    logTest(
        `COMP-${component.split('.')[0]}`,
        `組件 ${component} 存在`,
        exists,
        component,
        exists ? '存在' : '不存在'
    );
}

// ============================================
// Test 7: Configuration Files
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📄 測試 7: 配置檔案完整性');
console.log('='.repeat(60));

const configFiles = [
    'package.json',
    'next.config.ts',
    'tailwind.config.ts',
    'tsconfig.json'
];

for (const config of configFiles) {
    const exists = fs.existsSync(path.join(__dirname, config));
    logTest(
        `CONFIG-${config.split('.')[0]}`,
        `配置檔案 ${config} 存在`,
        exists,
        config,
        exists ? '存在' : '不存在'
    );
}

// ============================================
// Test 8: Package Dependencies
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📦 測試 8: NPM 依賴套件檢查');
console.log('='.repeat(60));

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredDeps = ['opencc-js', 'pangu', 'diff-match-patch', 'next', 'react'];

for (const dep of requiredDeps) {
    const exists = packageJson.dependencies?.[dep] !== undefined;
    logTest(
        `DEP-${dep}`,
        `依賴套件 ${dep} 已安裝`,
        exists,
        dep,
        exists ? packageJson.dependencies[dep] : '未安裝'
    );
}

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 測試結果摘要');
console.log('='.repeat(60));

const total = testResults.passed.length + testResults.failed.length;
console.log(`\n總測試數: ${total}`);
console.log(`✅ 通過: ${testResults.passed.length}`);
console.log(`❌ 失敗: ${testResults.failed.length}`);
console.log(`⚠️ 警告: ${testResults.warnings.length}`);

if (testResults.failed.length > 0) {
    console.log('\n❌ 失敗的測試:');
    for (const fail of testResults.failed) {
        console.log(`  - [${fail.testId}] ${fail.testName}`);
    }
}

const passRate = ((testResults.passed.length / total) * 100).toFixed(1);
console.log(`\n通過率: ${passRate}%`);

if (passRate >= 90) {
    console.log('\n🎉 測試結果: 優秀！專案功能完整性良好。');
} else if (passRate >= 70) {
    console.log('\n⚠️ 測試結果: 尚可，但有一些項目需要修復。');
} else {
    console.log('\n❌ 測試結果: 需要重大修復。');
}
