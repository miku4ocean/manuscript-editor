const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 讀取欄位說明檔案
console.log('=== 讀取欄位說明檔案 ===\n');
const columnDescPath = '/Users/leonalin/Downloads/dict_revised_2015_20250923/dict_revised_2015_20250923_欄位說明.xlsx';
const columnWorkbook = XLSX.readFile(columnDescPath);
const columnSheet = columnWorkbook.Sheets[columnWorkbook.SheetNames[0]];
const columnData = XLSX.utils.sheet_to_json(columnSheet);

console.log('欄位說明：');
console.log(JSON.stringify(columnData, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

// 讀取主字典檔案（只讀取前 100 筆作為範例）
console.log('=== 讀取主字典檔案（前 100 筆）===\n');
const dictPath = '/Users/leonalin/Downloads/dict_revised_2015_20250923/dict_revised_2015_20250923.xlsx';
const dictWorkbook = XLSX.readFile(dictPath);

// 列出所有工作表
console.log('工作表列表：', dictWorkbook.SheetNames);
console.log('');

// 讀取第一個工作表
const firstSheet = dictWorkbook.Sheets[dictWorkbook.SheetNames[0]];
const allData = XLSX.utils.sheet_to_json(firstSheet);

console.log(`總筆數：${allData.length}`);
console.log('\n前 10 筆資料範例：');
console.log(JSON.stringify(allData.slice(0, 10), null, 2));

// 分析欄位
if (allData.length > 0) {
  console.log('\n欄位名稱：');
  console.log(Object.keys(allData[0]));
}

// 統計資料
console.log('\n\n=== 資料統計 ===');
console.log(`總字數：${allData.length}`);

// 找出有異體字或錯別字標記的條目
const variantsOrTypos = allData.filter(row => {
  const str = JSON.stringify(row).toLowerCase();
  return str.includes('異體') || str.includes('錯別') || str.includes('正字');
});

console.log(`可能相關的異體字/錯別字條目：${variantsOrTypos.length}`);
if (variantsOrTypos.length > 0) {
  console.log('\n範例：');
  console.log(JSON.stringify(variantsOrTypos.slice(0, 5), null, 2));
}

// 儲存完整分析結果
const outputDir = path.join(__dirname, '../public/dictionaries');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 儲存欄位說明
fs.writeFileSync(
  path.join(outputDir, 'dict-column-info.json'),
  JSON.stringify(columnData, null, 2)
);

// 儲存前 1000 筆作為範例
fs.writeFileSync(
  path.join(outputDir, 'dict-sample.json'),
  JSON.stringify(allData.slice(0, 1000), null, 2)
);

console.log('\n\n=== 檔案已儲存 ===');
console.log('欄位說明：public/dictionaries/dict-column-info.json');
console.log('範例資料（前 1000 筆）：public/dictionaries/dict-sample.json');
