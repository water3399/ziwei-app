'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { generateYearlyFortune, formatFortuneContext, type YearlyFortune } from '@/lib/ziwei/fortune';
import { buildAnalysisContext } from '@/lib/ziwei/contextBuilder';
import type { StoredReport } from '@/lib/ziwei/types';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

interface MonthData {
  month: number;
  score: number;
  theme: string;
  highlight: string;
  career: string | null;
  money: string | null;
  love: string | null;
  health: string | null;
  doThis: string | null;
  avoidThis: string | null;
}

interface FortuneData {
  yearSummary: {
    theme: string;
    keywords: string[];
    bestMonths: number[];
    cautionMonths: number[];
    overview: string;
  };
  months: MonthData[];
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-300';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/30';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/25';
  if (score >= 40) return 'bg-orange-500/10 border-orange-500/25';
  return 'bg-red-500/10 border-red-500/25';
}

function scoreLabel(score: number): string {
  if (score >= 80) return '大吉';
  if (score >= 60) return '平穩';
  if (score >= 40) return '留意';
  return '調整';
}

function scoreBar(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

const MONTH_NAMES = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function FortunePage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fortune, setFortune] = useState<YearlyFortune | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
  }, [id]);

  useEffect(() => {
    if (report) {
      const f = generateYearlyFortune(report.birthData, selectedYear);
      setFortune(f);
      setFortuneData(null);
      setExpandedMonth(null);
    }
  }, [report, selectedYear]);

  const handleAnalyze = useCallback(async () => {
    if (!report || !fortune) return;
    setAnalyzing(true);
    setError(null);
    try {
      const chartContext = buildAnalysisContext(report.chartData);
      const fortuneCtx = formatFortuneContext(fortune);
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartContext: chartContext.substring(0, 3000),
          fortuneContext: fortuneCtx,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '分析失敗');
      }
      const data = await res.json();
      setFortuneData(data.fortune);
    } catch (err) {
      setError(err instanceof Error ? err.message : '流年分析失敗');
    } finally {
      setAnalyzing(false);
    }
  }, [report, fortune]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814] flex items-center justify-center">
        <p className="text-purple-400">請先排盤 → <Link href="/analysis" className="text-yellow-400 underline">前往排盤</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814]">
      <header className="border-b border-yellow-700/20 bg-purple-950/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold text-lg hover:text-yellow-300">✦ 紫微星鑑</Link>
          <div className="flex gap-2">
            <Link href={`/analysis/${id}`} className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs">📄 報告</Link>
            <Link href={`/chat/${id}`} className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs">💬 提問</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-center text-yellow-300 text-2xl font-bold mb-2">📅 流年運勢</h1>
        <p className="text-center text-purple-400 text-sm mb-6">
          {report.chartData.fiveElementsClass} ｜ 命宮：{report.chartData.palaces.find(p => p.name === '命宮')?.majorStars.map(s => s.name).join('+') || '—'}
        </p>

        {/* Year Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {yearOptions.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedYear === year
                  ? 'bg-yellow-600/30 border-2 border-yellow-500/60 text-yellow-300'
                  : 'bg-purple-950/40 border border-purple-700/30 text-purple-500 hover:text-purple-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Fortune Structure Card */}
        {fortune && !fortuneData && !analyzing && (
          <div className="text-center">
            <div className="bg-purple-950/50 border border-yellow-700/30 rounded-xl p-6 mb-6 inline-block">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-purple-400 text-xs mb-1">大限</div>
                  <div className="text-yellow-300 font-bold">{fortune.decadalPalaceName}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-xs mb-1">流年</div>
                  <div className="text-yellow-300 font-bold text-lg">{fortune.yearlyPalaceName}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-xs mb-1">小限</div>
                  <div className="text-yellow-300 font-bold">{fortune.agePalaceName}</div>
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                className="px-10 py-3 rounded-xl bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white font-bold hover:from-yellow-500/80 hover:to-amber-500/80 transition-all shadow-lg shadow-yellow-900/20"
              >
                ✦ 分析 {selectedYear} 年逐月運勢
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {analyzing && <AnalysisLoading type="fortune" />}

        {/* Error */}
        {error && (
          <div className="text-center py-4">
            <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-4 mb-4">{error}</div>
            <button onClick={handleAnalyze} className="text-yellow-400 text-sm underline">重新分析</button>
          </div>
        )}

        {/* Fortune Results */}
        {fortuneData && (
          <div>
            {/* Year Summary */}
            <div className="bg-purple-950/50 border border-yellow-700/30 rounded-xl p-6 mb-8">
              <h2 className="text-yellow-300 font-bold text-xl mb-2 text-center">{selectedYear}：{fortuneData.yearSummary.theme}</h2>
              <p className="text-purple-300 text-sm text-center mb-4">{fortuneData.yearSummary.overview}</p>
              <div className="flex justify-center gap-2 mb-4">
                {fortuneData.yearSummary.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-purple-800/40 border border-purple-700/30 text-purple-300 text-xs">{kw}</span>
                ))}
              </div>
              <div className="flex justify-center gap-6 text-xs">
                <div>
                  <span className="text-emerald-400">最佳月份：</span>
                  {fortuneData.yearSummary.bestMonths.map(m => MONTH_NAMES[m]).join('、')}
                </div>
                <div>
                  <span className="text-orange-400">留意月份：</span>
                  {fortuneData.yearSummary.cautionMonths.map(m => MONTH_NAMES[m]).join('、')}
                </div>
              </div>
            </div>

            {/* Year Score Timeline */}
            <div className="mb-8">
              <h3 className="text-purple-300 text-sm font-bold mb-3 text-center">全年運勢走勢</h3>
              <div className="flex items-end justify-center gap-1.5 h-32 px-4">
                {fortuneData.months.map((m) => {
                  const height = Math.max(15, m.score);
                  return (
                    <button
                      key={m.month}
                      onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                      className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${expandedMonth === m.month ? 'scale-110' : ''}`}
                    >
                      <span className={`text-[10px] font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                      <div
                        className={`w-8 rounded-t-md transition-all ${scoreBar(m.score)} ${expandedMonth === m.month ? 'opacity-100 ring-2 ring-yellow-400/50' : 'opacity-70 hover:opacity-100'}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-purple-500">{m.month}月</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fortuneData.months.map((m) => {
                const isExpanded = expandedMonth === m.month;
                const isBest = fortuneData.yearSummary.bestMonths.includes(m.month);
                const isCaution = fortuneData.yearSummary.cautionMonths.includes(m.month);

                return (
                  <div
                    key={m.month}
                    onClick={() => setExpandedMonth(isExpanded ? null : m.month)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${scoreBg(m.score)} ${
                      isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 ring-2 ring-yellow-500/30' : 'hover:scale-[1.02]'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-purple-100">{m.month}月</span>
                        {isBest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">最佳</span>}
                        {isCaution && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">留意</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${scoreColor(m.score)}`}>{m.score}</div>
                        <div className={`text-[10px] ${scoreColor(m.score)}`}>{scoreLabel(m.score)}</div>
                      </div>
                    </div>

                    {/* Theme */}
                    <p className="text-yellow-300/90 text-sm font-medium mb-1">{m.theme}</p>
                    <p className="text-purple-300 text-xs mb-2">{m.highlight}</p>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-purple-700/30 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.career && (
                          <div className="flex gap-2">
                            <span className="text-amber-400 text-sm">💼</span>
                            <div><span className="text-purple-400 text-xs">事業</span><p className="text-purple-200 text-xs">{m.career}</p></div>
                          </div>
                        )}
                        {m.money && (
                          <div className="flex gap-2">
                            <span className="text-yellow-400 text-sm">💰</span>
                            <div><span className="text-purple-400 text-xs">財務</span><p className="text-purple-200 text-xs">{m.money}</p></div>
                          </div>
                        )}
                        {m.love && (
                          <div className="flex gap-2">
                            <span className="text-pink-400 text-sm">💕</span>
                            <div><span className="text-purple-400 text-xs">感情</span><p className="text-purple-200 text-xs">{m.love}</p></div>
                          </div>
                        )}
                        {m.health && (
                          <div className="flex gap-2">
                            <span className="text-emerald-400 text-sm">🏥</span>
                            <div><span className="text-purple-400 text-xs">健康</span><p className="text-purple-200 text-xs">{m.health}</p></div>
                          </div>
                        )}
                        {(m.doThis || m.avoidThis) && (
                          <div className="md:col-span-2 flex gap-4 mt-1">
                            {m.doThis && (
                              <div className="flex-1 bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/15">
                                <span className="text-emerald-400 text-[10px] font-bold">✓ 適合</span>
                                <p className="text-purple-200 text-xs mt-0.5">{m.doThis}</p>
                              </div>
                            )}
                            {m.avoidThis && (
                              <div className="flex-1 bg-red-500/5 rounded-lg p-2 border border-red-500/15">
                                <span className="text-red-400 text-[10px] font-bold">✗ 避免</span>
                                <p className="text-purple-200 text-xs mt-0.5">{m.avoidThis}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!isExpanded && (
                      <div className="text-purple-600 text-[10px] text-right mt-1">點擊展開 ▼</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => { setFortuneData(null); }}
                className="px-5 py-2 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60"
              >
                重新分析
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60"
              >
                🖨️ 列印
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
