import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';

const FORTUNE_SYSTEM_PROMPT = `你是「紫微大師」的流年分析模組。根據命盤和流年數據，提供精簡、重點突出的逐月運勢。

===== 原則 =====
- 不用嚇人的詞（災厄劫剋煞），用正向引導
- 每個月只講真正有影響的重點，不要每個面向都講
- 有些月份如果沒什麼特別的，就簡單帶過
- 建議要具體到行動：不是「注意財務」而是「適合整理帳目、不宜大額投資」

===== 輸出格式（嚴格遵守，用 JSON）=====

輸出一個 JSON 物件，格式如下（不要輸出其他任何文字，只輸出 JSON）：

{
  "yearSummary": {
    "theme": "一句話年度主題",
    "keywords": ["關鍵字1", "關鍵字2", "關鍵字3"],
    "bestMonths": [3, 8],
    "cautionMonths": [5, 11],
    "overview": "2-3句話的年度概述"
  },
  "months": [
    {
      "month": 1,
      "score": 75,
      "theme": "一句話主題",
      "highlight": "這個月最重要的一件事（1句話）",
      "career": "事業重點（1句話，沒特別的就寫null）",
      "money": "財務重點（1句話）",
      "love": "感情重點（1句話）",
      "health": "健康重點（1句話，沒特別的就寫null）",
      "doThis": "適合做的事（簡短）",
      "avoidThis": "避免做的事（簡短）"
    }
  ]
}

score 評分規則：
- 80-100：能量很好的月份，適合積極行動
- 60-79：平穩的月份，正常推進
- 40-59：需要留意的月份，宜守不宜攻
- 20-39：挑戰較多的月份，專注調整

每個月的分析要基於流月宮位、主星、四化的實際數據，不要編造。
career/money/love/health 如果該月沒什麼特別影響，就填 null，不要硬湊。`;

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

    const userMessage = `請根據以下命盤和流年資料，輸出 JSON 格式的逐月運勢分析：

${chartContext}

${fortuneContext}

請只輸出 JSON，不要輸出其他文字。`;

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7',
      temperature: 0.3,
      max_tokens: 6000,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    // Strip <think> and extract JSON
    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Try to extract JSON from response
    let jsonData;
    try {
      // Try direct parse first
      jsonData = JSON.parse(cleaned);
    } catch {
      // Try to find JSON in markdown code block
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find first { to last }
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
          jsonData = JSON.parse(cleaned.substring(start, end + 1));
        } else {
          throw new Error('無法解析 AI 回應');
        }
      }
    }

    return NextResponse.json({ fortune: jsonData });
  } catch (error) {
    console.error('Fortune analysis error:', error);
    const message = error instanceof Error ? error.message : '流年分析失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
