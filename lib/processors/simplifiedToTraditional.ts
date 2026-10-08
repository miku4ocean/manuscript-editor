/**
 * Feature 1: 簡體轉繁體（台灣正體）
 *
 * 轉換分兩層：
 *   1. **opencc-js（`cn` → `twp`）為基底**——字元與常見詞彙都靠它，帶詞組上下文。
 *   2. **`s2t-overlay.json` 為覆蓋層**——opencc 不涵蓋的台灣軟體／設計術語
 *      （IP位址、收件匣、遮色片、範本…共 165 條）。
 *
 * 為什麼換掉原本的手工字典（2026-08-03）：
 * 原本是一份 8263 條的 `s2t-dictionary.json`，逐條做全域字串取代。實測有兩類真錯誤：
 *   - **缺字**：`汉` 不在字典裡，「汉语很难」轉出來是「汉語很難」。
 *   - **單字對應到整個詞**：`库→函式庫` 讓「这个库很好用」變成「這個函式庫很好用」；
 *     `类→類別` 讓「分类」變「分類別」。
 * 把 8263 條逐條與 opencc 比對後：7563 條一致、700 條不一致，
 * 而不一致處多半是手工字典錯（單字歧義本來就要靠上下文，那正是 opencc 的強項）。
 *
 * 覆蓋層**刻意排除所有單字條目**（制→製、注→註、周→週、列→欄、堆→堆積 等 9 條）。
 * 實測若照套會產生：制度→製度、注意→註意、周圍→週圍、列車→欄車、堆疊→堆積疊，全是誤譯。
 * 單字交給 opencc 依上下文判斷，覆蓋層只放「多字的專有術語」。
 */

import { getDictionaryPath } from '../utils/paths';

type Convert = (text: string) => string;

let overlay: Record<string, string> = {};
let overlayLoaded = false;
let converter: Convert | null = null;
let converterPromise: Promise<Convert> | null = null;

/**
 * opencc-js 會把字典資料一起打包，體積不小。用動態 import 讓它只在真的要做簡繁轉換時
 * 才載入，不拖累首屏——這與原本「用到才 fetch 字典」的延遲載入行為一致。
 */
async function getConverter(): Promise<Convert> {
  if (converter) return converter;
  if (!converterPromise) {
    converterPromise = import('opencc-js').then((OpenCC) => {
      converter = OpenCC.Converter({ from: 'cn', to: 'twp' });
      return converter;
    });
  }
  return converterPromise;
}

async function loadOverlay(): Promise<Record<string, string>> {
  if (overlayLoaded) return overlay;
  try {
    const response = await fetch(getDictionaryPath('s2t-overlay.json'));
    if (response.ok) {
      overlay = await response.json();
      overlayLoaded = true;
    } else {
      console.warn('⚠️ 載入 s2t-overlay.json 失敗，僅以 opencc 轉換（術語不會被在地化）');
    }
  } catch (error) {
    console.warn('⚠️ 載入 s2t-overlay.json 發生錯誤，僅以 opencc 轉換：', error);
  }
  return overlay;
}

/**
 * 「支持」→「支援」只在軟硬體／技術語境才換。
 *
 * opencc 的 twp 詞庫會把所有「支持」一律換成「支援」，但「支持某人／某立場／某政策」
 * 在台灣是正確用法，不該被改（我支持你 ≠ 我支援你）。處理方式：
 *   1. 轉換前把「支持」換成私用區佔位字元，避免 opencc 動到它；
 *   2. 轉換後逐處看前後文：附近有軟硬體／技術名詞才還原成「支援」，其餘還原為「支持」。
 * 技術語境判斷刻意保守（寧可不換）：漏換只是保留了正確的「支持」，誤換卻是改錯字。
 */
const ZHICHI_PLACEHOLDER = '\uE000';
const TECH_CONTEXT =
  /軟體|硬體|裝置|設備|系統(?!性)|作業系統|版本|格式|瀏覽器|平台|協定|驅動|程式|應用程式|外掛|插件|伺服器|處理器|晶片|解析度|編碼|相容|熱插拔|API|SDK|USB|HDMI|Wi-?Fi|藍牙|Windows|macOS|Linux|iOS|Android|Python|JavaScript|HTML|CSS|GPU|CPU|檔案格式|中文輸入|多國語言|多語系/i;

export function localizeZhichi(converted: string): string {
  if (!converted.includes(ZHICHI_PLACEHOLDER)) return converted;
  return converted.replace(new RegExp(ZHICHI_PLACEHOLDER, 'g'), (_m, offset: number) => {
    const before = converted.slice(Math.max(0, offset - 8), offset);
    const after = converted.slice(offset + 1, offset + 1 + 10);
    return TECH_CONTEXT.test(before) || TECH_CONTEXT.test(after) ? '支援' : '支持';
  });
}

function convertTW(convert: Convert, text: string): string {
  const protectedText = text.split('支持').join(ZHICHI_PLACEHOLDER);
  return localizeZhichi(convert(protectedText));
}

export async function simplifiedToTraditionalAsync(text: string): Promise<string> {
  if (!text) return text;
  const [convert, terms] = await Promise.all([getConverter(), loadOverlay()]);
  return applyOverlay(convertTW(convert, text), terms);
}

/**
 * 純字典取代（長詞優先、單次掃描）。覆蓋層與呼叫端自備字典都走這條。
 * 匯出是為了讓術語表能被單獨測試，不必先跑 opencc。
 */
export function applyOverlay(text: string, dictionary: Record<string, string>): string {
  if (!text || !dictionary || Object.keys(dictionary).length === 0) return text;

  // **單次掃描**，不是「逐條 split/join 跑一輪」。
  // 逐條做的話，前面替換出來的結果會被後面的鍵再打一次——實際資料就有這個 bug：
  // `皮筋→橡皮筋` 換完後，`橡皮→橡皮擦` 又命中它，最後吐出「橡皮擦筋」。
  // 把所有鍵組成一個 alternation、由長到短排序後一次掃過，每個位置只會被替換一次。
  const sortedKeys = Object.keys(dictionary)
    .filter((k) => k && dictionary[k] && k !== dictionary[k])
    .sort((a, b) => b.length - a.length);
  if (sortedKeys.length === 0) return text;

  const pattern = new RegExp(sortedKeys.map(escapeRegex).join('|'), 'g');
  return text.replace(pattern, (matched) => dictionary[matched] ?? matched);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 同步版本。`dictionary` 有給就只用該字典（呼叫端自備術語表時用）；
 * 沒給則要求 opencc 已經載入過——沒載入就原樣回傳並提醒改用 async 版，
 * 不會靜默吐出半轉換的結果。
 */
export function simplifiedToTraditional(text: string, dictionary?: Record<string, string>): string {
  if (!text) return text;

  if (dictionary) return applyOverlay(text, dictionary);

  if (!converter) {
    console.warn('⚠️ 轉換器尚未載入，請改用 simplifiedToTraditionalAsync()');
    return text;
  }
  return applyOverlay(convertTW(converter, text), overlay);
}

/** 舊名保留，避免呼叫端一次改太多；語義是「預先載入轉換所需資源」。 */
async function loadS2TDictionary(): Promise<Record<string, string>> {
  await getConverter();
  return loadOverlay();
}

export { loadS2TDictionary };
