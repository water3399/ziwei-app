import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';

const FORTUNE_SYSTEM_PROMPT = `你是「紫微大師」的流年分析模組。你要根據命盤資料和流年數據，提供極其細緻的逐月運勢分析。

===== 現代化原則（必須遵守）=====
- 沒有絕對的凶月，每個月都有機會和課題
- 禁止使用：災、厄、劫、剋、煞等嚇人的詞
- 用正向引導：「這個月適合XX」「需要注意XX」「可以把握XX」
- 所有建議必須具體可執行，不要空泛的「注意身體」
- 性別平等，不做性別差異分析

===== 報告結構（嚴格按此格式，用 Markdown）=====

## 年度總覽
- 這一年的核心主題（一句話）
- 大限 + 流年 + 小限的三重交互分析
- 全年最有利的月份和需要注意的月份
- 年度關鍵字（3-5 個）

## 上半年運勢（1-6月）

### 1月
- **運勢主題**：（一句話概括）
- **事業**：具體分析 + 建議
- **財務**：具體分析 + 建議
- **感情**：具體分析 + 建議
- **健康**：需注意的面向 + 建議
- **本月建議**：最重要的一件事
- **適合**：列出適合做的事
- **避免**：列出不適合做的事

### 2月
（同上格式）

### 3月
（同上格式）

### 4月
（同上格式）

### 5月
（同上格式）

### 6月
（同上格式）

## 下半年運勢（7-12月）

### 7月
（同上格式）

### 8月
（同上格式）

### 9月
（同上格式）

### 10月
（同上格式）

### 11月
（同上格式）

### 12月
（同上格式）

## 年度總結
- 全年最佳時機（做什麼、什麼時候）
- 全年需要持續注意的課題
- 給這一年的三句話忠告

===== 分析要點 =====
- 每個月的分析要基於「流月宮位 + 流月主星 + 流月四化」的實際數據
- 要考慮流月與流年、大限的疊加效應
- 四化飛入不同宮位的連鎖反應要分析到位
- 建議要具體到行動層面：不是「注意財務」，而是「這個月適合整理帳目、檢視訂閱服務、不宜大額投資」
- 每個月的分析要有差異化，不要每個月都寫一樣的套話`;

interface FortuneRequestBody {
  chartContext: string;
  fortuneContext: string;
}

export async function POST(request: NextRequest) {
  try {
    const { chartContext, fortuneContext } = (await request.json()) as FortuneRequestBody;

    if (!fortuneContext) {
      return NextResponse.json({ error: '缺少流年資料' }, { status: 400 });
    }

    const userMessage = `請根據以下命盤和流年資料，提供完整的逐月運勢分析：

${chartContext}

${fortuneContext}`;

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7',
      temperature: 0.4,
      max_tokens: 10000,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    // Strip <think> blocks
    const markdown = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return NextResponse.json({ markdown });
  } catch (error) {
    console.error('Fortune analysis error:', error);
    const message = error instanceof Error ? error.message : '流年分析失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
