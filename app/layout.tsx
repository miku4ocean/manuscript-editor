import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "文字編輯神器 - 專業文稿編輯工具",
  description: "專業文稿初稿審查工具，提供簡繁轉換、錯字修正、標點符號修正、刪除贅字等多種編輯功能。使用教育部字典，支援超過 3500 個常見錯別字修正。",
  keywords: ["文稿編輯", "簡繁轉換", "錯字修正", "標點符號", "文字處理", "教育部字典"],
  authors: [{ name: "Manuscript Editor Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
