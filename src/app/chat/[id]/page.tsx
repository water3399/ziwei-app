'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { getChatMessages, saveChatMessages } from '@/lib/chatStore';
import { buildChatContext } from '@/lib/ziwei/contextBuilder';
import type { StoredReport } from '@/lib/ziwei/types';
import ChartSummary from '@/components/chart/ChartSummary';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  '我的命宮主星代表什麼性格？',
  '我適合什麼類型的工作？',
  '今年的感情運勢如何？',
  '我的財運怎麼看？',
  '命盤中有什麼特別的格局？',
  '大限走到這裡要注意什麼？',
];

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
    if (r) {
      const saved = getChatMessages(id);
      if (saved) setMessages(saved);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !report || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setStreaming(true);
    setStreamContent('');

    try {
      const reportContext = buildChatContext(report.chartData, report.markdown);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          reportContext,
        }),
      });

      if (!res.ok) throw new Error('回應失敗');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setStreamContent(full);
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: full,
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, assistantMsg];
      setMessages(final);
      saveChatMessages(id, final);
      setStreamContent('');
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '抱歉，回覆時發生錯誤。請稍後再試。',
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, errMsg];
      setMessages(final);
    } finally {
      setStreaming(false);
    }
  }, [messages, report, streaming, id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814] flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-400 mb-4">找不到此報告</p>
          <Link href="/analysis" className="text-yellow-400 underline">重新排盤</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814] flex flex-col">
      {/* Header */}
      <header className="border-b border-yellow-700/20 bg-purple-950/30 shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold hover:text-yellow-300">
            ✦ 紫微星鑑
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/analysis/${id}`}
              className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60"
            >
              📄 報告
            </Link>
            <Link
              href="/analysis"
              className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60"
            >
              新排盤
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - chart summary */}
        <aside className="hidden lg:block w-80 border-r border-purple-800/30 p-4 overflow-y-auto shrink-0">
          <ChartSummary chartData={report.chartData} />
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Welcome */}
            {messages.length === 0 && !streaming && (
              <div className="max-w-2xl mx-auto text-center">
                <div className="text-4xl mb-4">✦</div>
                <h2 className="text-yellow-300 text-lg font-bold mb-2">紫微大師</h2>
                <p className="text-purple-400 text-sm mb-6">
                  根據你的命盤分析，我可以回答關於性格、事業、感情、健康、運勢等問題。
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left px-3 py-2 rounded-lg bg-purple-950/60 border border-purple-800/30 text-purple-300 text-xs hover:border-yellow-700/40 hover:text-yellow-300 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-700/40 text-purple-100'
                      : 'bg-purple-950/60 border border-purple-800/30 text-purple-200'
                  }`}>
                    {msg.role === 'assistant' && (
                      <span className="text-yellow-400 text-xs font-bold block mb-1">✦ 紫微大師</span>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streaming && streamContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm bg-purple-950/60 border border-purple-800/30 text-purple-200">
                    <span className="text-yellow-400 text-xs font-bold block mb-1">✦ 紫微大師</span>
                    <div className="whitespace-pre-wrap">{streamContent}</div>
                    <span className="inline-block w-1.5 h-4 bg-yellow-400/60 animate-pulse ml-0.5" />
                  </div>
                </div>
              )}

              {streaming && !streamContent && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-4 py-3 bg-purple-950/60 border border-purple-800/30">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-yellow-500/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-purple-800/30 bg-purple-950/30 px-4 py-3 shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入你的問題...（Enter 送出，Shift+Enter 換行）"
                rows={1}
                className="flex-1 bg-purple-950/60 border border-purple-700/40 rounded-xl px-4 py-2.5 text-sm text-purple-100 placeholder-purple-600 resize-none focus:border-yellow-500/60 focus:outline-none"
                disabled={streaming}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="px-4 py-2.5 rounded-xl bg-yellow-600/80 text-white text-sm font-bold hover:bg-yellow-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                送出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
