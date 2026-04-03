import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserMessage } from '@/lib/prompts';
import { buildKnowledgeContext } from '@/lib/ziwei/knowledgeLoader';

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
      console.error('Knowledge loading error (continuing without):', err);
    }

    const fullContext = knowledgeContext
      ? `${context}\n\n===== 以下是知識庫參考資料（用於輔助分析，不要原文輸出）=====\n\n${knowledgeContext}`
      : context;

    const userMessage = buildAnalysisUserMessage(fullContext);

    const markdown = await callMiniMax({
      model: 'MiniMax-M2.7',
      temperature: 0.3,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : '分析失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
