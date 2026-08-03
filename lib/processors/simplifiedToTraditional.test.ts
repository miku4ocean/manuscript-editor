import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';
import { applyOverlay, simplifiedToTraditional } from './simplifiedToTraditional';

/**
 * 這支測的是**實際的轉換管線**：opencc（cn → twp）為基底，再套 s2t-overlay.json。
 * 模組本身用 fetch 取覆蓋層（瀏覽器環境），在 node 測試裡改成直接讀檔並組出同一條管線，
 * 不 mock fetch——mock 掉就等於測不到真正的 opencc 行為。
 */
const overlay: Record<string, string> = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../public/dictionaries/s2t-overlay.json'), 'utf8')
);
const convert = OpenCC.Converter({ from: 'cn', to: 'twp' });
const pipeline = (text: string) => applyOverlay(convert(text), overlay);

describe('簡繁轉換管線（opencc + 覆蓋層）', () => {
  it('轉換常見簡體字——這組正是舊手工字典缺漏而長期失敗的', () => {
    expect(pipeline('汉语')).toBe('漢語');
    expect(pipeline('习惯')).toBe('習慣');
    expect(pipeline('经济')).toBe('經濟');
    expect(pipeline('图书馆')).toBe('圖書館');
    expect(pipeline('儿子')).toBe('兒子');
    expect(pipeline('马')).toBe('馬');
    expect(pipeline('鸟')).toBe('鳥');
    expect(pipeline('鱼')).toBe('魚');
    expect(pipeline('车轮')).toBe('車輪');
    expect(pipeline('翻译')).toBe('翻譯');
  });

  it('台灣用語在地化（twp）', () => {
    expect(pipeline('软件')).toBe('軟體');
    expect(pipeline('鼠标')).toBe('滑鼠');
    expect(pipeline('程序')).toBe('程式');
    expect(pipeline('信息')).toBe('資訊');
  });

  it('覆蓋層補上 opencc 不涵蓋的台灣術語', () => {
    expect(pipeline('IP地址')).toBe('IP位址');
    expect(pipeline('收件箱')).toBe('收件匣');
    expect(pipeline('模板')).toBe('範本');
    expect(pipeline('蒙版')).toBe('遮色片');
  });

  it('單字不再被錯換成整個詞（舊字典的 库→函式庫、类→類別 bug）', () => {
    expect(pipeline('这个库很好用')).toBe('這個庫很好用');
    expect(pipeline('分类标准')).toBe('分類標準');
    expect(pipeline('数据库设计')).toBe('資料庫設計');
  });

  it('單字歧義交給 opencc 依上下文判斷，不被覆蓋層硬換', () => {
    // 這些若把單字條目放進覆蓋層就會變成 製度／註意／週圍／欄車／堆積疊
    expect(pipeline('制度')).toBe('制度');
    expect(pipeline('注意')).toBe('注意');
    expect(pipeline('周围')).toBe('周圍');
    expect(pipeline('列车')).toBe('列車');
    expect(pipeline('堆栈')).toBe('堆疊');
  });

  it('已是繁體的文字不被改動', () => {
    expect(pipeline('繁體中文')).toBe('繁體中文');
    expect(pipeline('這是一段正常的中文句子。')).toBe('這是一段正常的中文句子。');
  });

  it('空字串與非中文原樣回傳', () => {
    expect(pipeline('')).toBe('');
    expect(pipeline('Hello, world! 123')).toBe('Hello, world! 123');
  });
});

describe('覆蓋層資料本身的不變條件', () => {
  it('不得含單字條目——單字歧義要交給 opencc，硬換會誤譯', () => {
    const singles = Object.keys(overlay).filter((k) => [...k].length === 1);
    expect(singles, `覆蓋層出現單字條目：${singles.join('、')}`).toEqual([]);
  });

  it('每一條都真的會改變文字（沒有 a→a 的空轉條目）', () => {
    const noop = Object.entries(overlay).filter(([s, t]) => s === t);
    expect(noop).toEqual([]);
  });

  it('每一條都是 opencc 處理不了的，才有存在必要', () => {
    const redundant = Object.keys(overlay).filter((s) => convert(s) !== s);
    expect(redundant, `這些 opencc 已能處理，覆蓋層不需要：${redundant.slice(0, 5).join('、')}`).toEqual([]);
  });
});

describe('applyOverlay（純字典取代）', () => {
  it('空輸入原樣回傳', () => {
    expect(applyOverlay('', overlay)).toBe('');
  });

  it('空字典時不改動文字', () => {
    expect(applyOverlay('电脑', {})).toBe('电脑');
  });

  it('長詞優先，不會被短詞拆掉', () => {
    const dict = { 收件箱: '收件匣', 收件: '收信' };
    expect(applyOverlay('收件箱', dict)).toBe('收件匣');
  });

  it('單次掃描：已替換出來的結果不會再被其他鍵打到', () => {
    // 真實資料的碰撞：皮筋→橡皮筋，而橡皮→橡皮擦。
    // 舊的「逐條 split/join」寫法會吐出「橡皮擦筋」。
    expect(applyOverlay('皮筋', overlay)).toBe('橡皮筋');
    expect(applyOverlay('橡皮', overlay)).toBe('橡皮擦');
  });
});

describe('simplifiedToTraditional（同步版）', () => {
  it('有給字典就只用該字典', () => {
    expect(simplifiedToTraditional('模板', { 模板: '範本' })).toBe('範本');
  });

  it('沒給字典且轉換器尚未載入時，原樣回傳而不是吐半套結果', () => {
    expect(simplifiedToTraditional('汉语')).toBe('汉语');
  });
});
