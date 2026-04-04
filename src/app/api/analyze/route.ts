import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';
import { buildKnowledgeContext } from '@/lib/ziwei/knowledgeLoader';

const VISUAL_ANALYSIS_PROMPT = `你是「紫微大師」，結合古典紫微斗數與現代視角的命理分析師。

===== 現代化原則 =====
- 沒有絕對的凶星，只有需要管理的高能量特質
- 化忌 = 人生課題和成長方向，不是災難
- 禁止使用：孤克、刑傷、剋、淫、蕩、煞、災厄
- 性別完全平等
- 職業對應現代職業（科技、自媒體、創業等）
- 語調正向，聚焦「如何發揮優勢」

===== 輸出格式（只輸出 JSON，不要其他文字）=====

{
  "profile": {
    "headline": "一句話總結此人（如：天生的策略家，用智慧引領方向）",
    "personality": ["特質1", "特質2", "特質3", "特質4", "特質5"],
    "element": "命盤主要元素屬性（如：火六局·行動派）",
    "archetype": "一個現代比喻（如：創業型CEO / 藝術策展人 / 數據分析師）"
  },
  "scores": {
    "career": { "score": 78, "label": "事業潛力", "brief": "一句話概述" },
    "wealth": { "score": 65, "label": "財運指數", "brief": "一句話概述" },
    "love": { "score": 72, "label": "感情運勢", "brief": "一句話概述" },
    "social": { "score": 80, "label": "人際資源", "brief": "一句話概述" },
    "health": { "score": 70, "label": "身心狀態", "brief": "一句話概述" }
  },
  "palaceHighlights": [
    {
      "palace": "命宮",
      "stars": "主星名稱",
      "brightness": "廟/旺/得/利/平/不/陷",
      "score": 85,
      "title": "一句話標題",
      "insight": "2-3句話的核心解讀",
      "advice": "一句話建議"
    },
    {
      "palace": "官祿宮",
      "stars": "主星名稱",
      "brightness": "亮度",
      "score": 75,
      "title": "一句話標題",
      "insight": "2-3句話解讀",
      "advice": "一句話建議"
    }
  ],
  "patterns": [
    {
      "name": "格局名稱",
      "type": "high-energy 或 stable",
      "effect": "一句話效果",
      "tip": "一句話如何運用"
    }
  ],
  "fourTransforms": [
    {
      "star": "星名",
      "transform": "祿/權/科/忌",
      "palace": "落入宮位",
      "meaning": "一句話含義"
    }
  ],
  "currentFortune": {
    "decade": "大限宮位名",
    "year": "流年宮位名",
    "theme": "當前運勢主題（一句話）",
    "opportunity": "目前最大的機會",
    "challenge": "目前需要面對的課題",
    "advice": "當前最重要的行動建議"
  },
  "lifePath": {
    "summary": "三句話總結人生藍圖",
    "strengths": ["優勢1", "優勢2", "優勢3"],
    "growthAreas": ["成長方向1", "成長方向2"],
    "bestCareers": ["適合職業1", "適合職業2", "適合職業3", "適合職業4"]
  }
}

===== 評分規則 =====
- 85-100：該領域條件非常好，有天生優勢
- 70-84：條件不錯，稍加努力就能發揮
- 55-69：普通，需要持續經營
- 40-54：有挑戰，需要額外關注和調整
- 25-39：較弱的領域，但不代表不行，代表需要更多學習

palaceHighlights 只列最重要的 6 個宮位（命宮 + 官祿 + 財帛 + 夫妻 + 疾厄 + 福德），其他宮位不用列。

每個欄位都要精簡，insight 最多 3 句話，advice 最多 1 句話。不要寫長段落。`;

interface AnalyzeRequestBody {
  context: string;
  majorStarNames: string[];
  comboStars: [string, string][];
  palaceNames: string[];
  allStarNames: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { context, majorStarNames, comboStars, palaceNames, allStarNames } =
      (await request.json()) as AnalyzeRequestBody;

    if (!context) {
      return NextResponse.json({ error: '缺少命盤資料' }, { status: 400 });
    }

    let knowledgeContext = '';
    try {
      knowledgeContext = buildKnowledgeContext(
        majorStarNames || [],
        comboStars || [],
        palaceNames || [],
        allStarNames || [],
      );
    } catch (err) {
      console.error('Knowledge loading error:', err);
    }

    const fullContext = knowledgeContext
      ? `${context}\n\n===== 知識庫參考 =====\n\n${knowledgeContext}`
      : context;

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7',
      temperature: 0.3,
      max_tokens: 6000,
      messages: [
        { role: 'system', content: VISUAL_ANALYSIS_PROMPT },
        { role: 'user', content: `根據以下命盤資料，輸出 JSON 格式分析（只輸出 JSON）：\n\n${fullContext}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1].trim());
      } else {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
          analysis = JSON.parse(cleaned.substring(start, end + 1));
        } else {
          throw new Error('無法解析 AI 回應');
        }
      }
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : '分析失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
