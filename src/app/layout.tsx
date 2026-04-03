import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '紫微星鑑 — AI 紫微斗數命理分析',
  description: '結合 iztro 排盤引擎與 AI 深度解讀，提供精準的紫微斗數命盤分析、格局判定、大運流年預測。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0A0814] text-purple-100 min-h-screen" style={{ fontFamily: "'Noto Sans TC', 'Noto Serif TC', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
