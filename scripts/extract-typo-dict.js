const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('開始提取錯字對照表...\n');

const dictPath = '/Users/leonalin/Downloads/dict_revised_2015_20250923/dict_revised_2015_20250923.xlsx';
const dictWorkbook = XLSX.readFile(dictPath);
const firstSheet = dictWorkbook.Sheets[dictWorkbook.SheetNames[0]];
const allData = XLSX.utils.sheet_to_json(firstSheet);

console.log(`總字數：${allData.length}`);

// 提取錯字對照資訊
const typoMapping = {};
const variantMapping = {};
let extractedCount = 0;

allData.forEach((row, index) => {
  const word = row['字詞名'];
  const definition = row['釋義'] || '';

  // 提取「本作XX」、「俗作XX」、「通作XX」、「同XX」等資訊
  const patterns = [
    /本作[「『]?(\S+?)[」』]?[\。\,]/g,
    /俗[呼稱]?[^「『]*?[「『](\S+?)[」』]/g,
    /通[「『]?(\S+?)[」』]/g,
    /同[「『]?(\S+?)[」』]/g,
    /正字[為是][「『]?(\S+?)[」』]/g,
    /正作[「『]?(\S+?)[」』]/g,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(definition)) !== null) {
      const correctWord = match[1];
      if (correctWord && correctWord !== word && correctWord.length <= 3) {
        // 只記錄單字或短詞
        if (!typoMapping[word]) {
          typoMapping[word] = new Set();
        }
        typoMapping[word].add(correctWord);
        extractedCount++;
      }
    }
  });

  // 提取異體字資訊
  if (row['異體字']) {
    const variants = row['異體字'].toString().split(/[,，、]/);
    variants.forEach(v => {
      const cleanVariant = v.trim().replace(/[【】「」『』]/g, '');
      if (cleanVariant && cleanVariant !== word && cleanVariant.length <= 2) {
        if (!variantMapping[word]) {
          variantMapping[word] = new Set();
        }
        variantMapping[word].add(cleanVariant);
      }
    });
  }
});

// 轉換 Set 為 Array
const typoDict = {};
Object.keys(typoMapping).forEach(key => {
  typoDict[key] = Array.from(typoMapping[key]);
});

const variantDict = {};
Object.keys(variantMapping).forEach(key => {
  variantDict[key] = Array.from(variantMapping[key]);
});

console.log(`\n提取的錯字對照：${Object.keys(typoDict).length} 組`);
console.log(`提取的異體字：${Object.keys(variantDict).length} 組`);

// 顯示範例
console.log('\n錯字對照範例（前 20 組）：');
Object.entries(typoDict).slice(0, 20).forEach(([wrong, correct]) => {
  console.log(`  ${wrong} → ${correct.join(', ')}`);
});

console.log('\n異體字範例（前 20 組）：');
Object.entries(variantDict).slice(0, 20).forEach(([char, variants]) => {
  console.log(`  ${char} ↔ ${variants.join(', ')}`);
});

// 儲存結果
const outputDir = path.join(__dirname, '../public/dictionaries');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 儲存錯字對照表
fs.writeFileSync(
  path.join(outputDir, 'typo-corrections.json'),
  JSON.stringify(typoDict, null, 2)
);

// 儲存異體字對照表
fs.writeFileSync(
  path.join(outputDir, 'variant-characters.json'),
  JSON.stringify(variantDict, null, 2)
);

// 建立完整字詞列表（用於驗證是否為正確用字）
const validWords = new Set();
allData.forEach(row => {
  const word = row['字詞名'];
  if (word) {
    validWords.add(word);
  }
});

fs.writeFileSync(
  path.join(outputDir, 'valid-words.json'),
  JSON.stringify(Array.from(validWords), null, 2)
);

console.log('\n=== 檔案已儲存 ===');
console.log(`錯字對照表：public/dictionaries/typo-corrections.json (${Object.keys(typoDict).length} 組)`);
console.log(`異體字對照表：public/dictionaries/variant-characters.json (${Object.keys(variantDict).length} 組)`);
console.log(`有效字詞列表：public/dictionaries/valid-words.json (${validWords.size} 個)`);
console.log('\n提取完成！✅');
