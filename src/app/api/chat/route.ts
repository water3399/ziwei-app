import { NextRequest } from 'next/server';
import { streamMiniMax } from '@/lib/minimax';
import { CHAT_SYSTEM_PROMPT } from '@/lib/prompts';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  reportContext: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, reportContext } = (await request.json()) as ChatRequestBody;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: '缺少對話訊息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemContent = `${CHAT_SYSTEM_PROMPT}\n\n===== 用戶命盤資料 =====\n${reportContext}`;

    const stream = streamMiniMax({
      model: 'MiniMax-M2.7',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const encoder = new TextEncoder();
    const byteStream = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      }),
    );

    return new Response(byteStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : '對話失敗';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
