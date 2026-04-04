'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { generateYearlyFortune, formatFortuneContext, type YearlyFortune } from '@/lib/ziwei/fortune';
import { buildAnalysisContext } from '@/lib/ziwei/contextBuilder';
import type { StoredReport } from '@/lib/ziwei/types';
import ReportView from '@/components/analysis/ReportView';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

export default function FortunePage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fortune, setFortune] = useState<YearlyFortune | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
  }, [id]);

  // Generate fortune data when year changes
  useEffect(() => {
    if (report) {
      const f = generateYearlyFortune(report.birthData, selectedYear);
      setFortune(f);
      setMarkdown(null); // Reset previous analysis
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
          chartContext: chartContext.substring(0, 3000), // Compact chart context
          fortuneContext: fortuneCtx,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '分析失敗');
      }
      const data = await res.json();
      setMarkdown(data.markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : '流年分析失敗');
    } finally {
      setAnalyzing(false);
    }
  }, [report, fortune]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814] flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-400 mb-4">請先排盤再查看流年</p>
          <Link href="/analysis" className="text-yellow-400 underline">前往排盤</Link>
        </div>
      </div>
    );
  }

  const ming = report.chartData.palaces.find(p => p.name === '命宮');
  const mingStars = ming?.majorStars.map(s => s.name).join('+') || '—';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814]">
      {/* Header */}
      <header className="border-b border-yellow-700/20 bg-purple-950/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold text-lg hover:text-yellow-300">
            ✦ 紫微星鑑
          </Link>
          <div className="flex gap-2">
            <Link href={`/analysis/${id}`} className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60">
              📄 命盤報告
            </Link>
            <Link href={`/chat/${id}`} className="px-3 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60">
              💬 紫微大師
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-yellow-300 text-2xl font-bold mb-2">📅 流年運勢分析</h1>
          <p className="text-purple-400 text-sm">
            {report.birthData.year}/{report.birthData.month}/{report.birthData.day} {report.birthData.gender}
            ｜ 命宮：{mingStars} ｜ {report.chartData.fiveElementsClass}
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {yearOptions.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                selectedYear === year
                  ? 'bg-yellow-600/30 border-2 border-yellow-500/60 text-yellow-300 shadow-lg shadow-yellow-900/20'
                  : 'bg-purple-950/40 border border-purple-700/30 text-purple-400 hover:border-purple-500/50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Fortune Summary Card */}
        {fortune && (
          <div className="bg-purple-950/50 border border-yellow-700/30 rounded-xl p-6 mb-6">
            <h2 className="text-yellow-300 font-bold text-lg mb-4 text-center">
              {selectedYear} 年運勢結構
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-800/30">
                <div className="text-purple-400 text-xs mb-1">大限（十年運）</div>
                <div className="text-yellow-300 font-bold">{fortune.decadalPalaceName}</div>
                <div className="text-purple-500 text-xs">{fortune.decadalHeavenlyStem}{fortune.decadalEarthlyBranch}</div>
                <div className="text-purple-400 text-[10px] mt-1">四化：{fortune.decadalMutagen.join('、')}</div>
              </div>
              <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-yellow-700/40">
                <div className="text-purple-400 text-xs mb-1">流年（今年）</div>
                <div className="text-yellow-300 font-bold text-lg">{fortune.yearlyPalaceName}</div>
                <div className="text-purple-500 text-xs">{fortune.yearlyHeavenlyStem}{fortune.yearlyEarthlyBranch}</div>
                <div className="text-purple-400 text-[10px] mt-1">四化：{fortune.yearlyMutagen.join('、')}</div>
              </div>
              <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-800/30">
                <div className="text-purple-400 text-xs mb-1">小限</div>
                <div className="text-yellow-300 font-bold">{fortune.agePalaceName}</div>
              </div>
            </div>

            {/* Monthly Overview Table */}
            <h3 className="text-purple-300 font-bold text-sm mb-3">逐月流月宮位一覽</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-purple-800/40">
                    <th className="py-2 px-2 text-left text-purple-500">月份</th>
                    <th className="py-2 px-2 text-left text-purple-500">流月宮</th>
                    <th className="py-2 px-2 text-left text-purple-500">天干</th>
                    <th className="py-2 px-2 text-left text-purple-500">主星</th>
                    <th className="py-2 px-2 text-left text-purple-500">流月四化</th>
                  </tr>
                </thead>
                <tbody>
                  {fortune.months.map(m => {
                    const stars = m.majorStars.map(s => {
                      let str = s.name;
                      if (s.brightness) str += `(${s.brightness})`;
                      return str;
                    }).join(' ') || '空宮';

                    return (
                      <tr key={m.month} className="border-b border-purple-900/30 hover:bg-purple-900/20">
                        <td className="py-2 px-2 text-yellow-300 font-bold">{m.month}月</td>
                        <td className="py-2 px-2 text-purple-200">{m.palaceName}</td>
                        <td className="py-2 px-2 text-purple-400">{m.heavenlyStem}{m.earthlyBranch}</td>
                        <td className="py-2 px-2 text-purple-200">{stars}</td>
                        <td className="py-2 px-2">
                          <div className="flex flex-wrap gap-1">
                            {m.mutagen.map((star, i) => {
                              const types = ['祿', '權', '科', '忌'];
                              const colors = ['text-emerald-400', 'text-amber-400', 'text-sky-400', 'text-red-400'];
                              return (
                                <span key={i} className={`${colors[i] || 'text-purple-300'}`}>
                                  {star}化{types[i]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Analyze Button */}
            {!markdown && (
              <div className="text-center mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-10 py-3 rounded-xl bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white font-bold text-sm hover:from-yellow-500/80 hover:to-amber-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-900/20"
                >
                  {analyzing ? '✦ 紫微大師正在分析流年...' : `✦ AI 分析 ${selectedYear} 年逐月運勢`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-4">
            <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-4 mb-4">{error}</div>
            <button onClick={handleAnalyze} className="text-yellow-400 text-sm underline">重新分析</button>
          </div>
        )}

        {/* Loading */}
        {analyzing && (
          <div className="text-center py-16">
            <div className="text-3xl mb-4 animate-pulse">✦</div>
            <div className="text-yellow-300 text-lg font-bold mb-2">紫微大師正在分析 {selectedYear} 年運勢...</div>
            <div className="text-purple-400 text-sm">逐月分析大限、流年、流月的三重交互影響</div>
            <div className="mt-6 flex gap-1 justify-center">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-yellow-500/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Report */}
        {markdown && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-yellow-300 font-bold text-lg">{selectedYear} 年逐月運勢報告</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setMarkdown(null); setSelectedYear(prev => prev); }}
                  className="px-4 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60"
                >
                  重新分析
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-xs hover:border-purple-500/60"
                >
                  🖨️ 列印
                </button>
              </div>
            </div>
            <ReportView markdown={markdown} />
          </div>
        )}
      </main>
    </div>
  );
}
