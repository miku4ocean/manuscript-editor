/**
 * 取得字典檔路徑。前綴取自「建置時」的 basePath（next.config.ts 以 NEXT_PUBLIC_BASE_PATH 注入）：
 * - GitHub Pages 建置：/manuscript-editor
 * - Cloudflare Pages（DEPLOY_TARGET=cloudflare）與本機開發：空字串
 * 不可再依 hostname 判斷，否則部署在任何非 localhost 網域根目錄都會 404。
 */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

export function getDictionaryPath(filename: string): string {
  return `${getBasePath()}/dictionaries/${filename}`;
}
