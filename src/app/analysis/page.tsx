'use client';

import { useReducer, useCallback } from 'react';
import type { AnalysisState, AnalysisAction, BirthData } from '@/lib/ziwei/types';
import { generateChart } from '@/lib/ziwei/engine';
import { buildAnalysisContext } from '@/lib/ziwei/contextBuilder';
import { saveReport } from '@/lib/reportStore';
import StepIndicator from '@/components/analysis/StepIndicator';
import BirthForm from '@/components/analysis/BirthForm';
import ZiweiChart from '@/components/chart/ZiweiChart';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';
import ReportView from '@/components/analysis/ReportView';
import Link from 'next/link';

const initialBirth: BirthData = {
  year: 2000,
  month: 1,
  day: 1,
  hour: 6, // 午時
  gender: '女',
  calendarType: 'solar',
  isLeapMonth: false,
};

const initialState: AnalysisState = {
  step: 1,
  birthData: initialBirth,
  chartData: null,
  chartError: null,
  generating: false,
  analyzing: false,
  reportMarkdown: null,
  reportId: null,
  analysisError: null,
};

function reducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'UPDATE_BIRTH':
      return { ...state, birthData: { ...state.birthData, ...action.data } };
    case 'GENERATE_CHART_START':
      return { ...state, generating: true, chartError: null };
    case 'GENERATE_CHART_SUCCESS':
      return { ...state, generating: false, chartData: action.chartData, step: 2 };
    case 'GENERATE_CHART_ERROR':
      return { ...state, generating: false, chartError: action.error };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'ANALYZE_START':
      return { ...state, analyzing: true, analysisError: null, step: 3 };
    case 'ANALYZE_SUCCESS':
      return { ...state, analyzing: false, reportMarkdown: action.markdown, reportId: action.id };
    case 'ANALYZE_ERROR':
      return { ...state, analyzing: false, analysisError: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function AnalysisPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleGenerateChart = useCallback(() => {
    dispatch({ type: 'GENERATE_CHART_START' });
    try {
      const chartData = generateChart(state.birthData);
      dispatch({ type: 'GENERATE_CHART_SUCCESS', chartData });
    } catch (err) {
      dispatch({ type: 'GENERATE_CHART_ERROR', error: err instanceof Error ? err.message : '排盤失敗' });
    }
  }, [state.birthData]);

  const handleAnalyze = useCallback(async () => {
    if (!state.chartData) return;
    dispatch({ type: 'ANALYZE_START' });
    try {
      const context = buildAnalysisContext(state.chartData);

      // Extract star names for server-side knowledge lookup
      const majorStarNames: string[] = [];
      const comboStars: [string, string][] = [];
      const allStarNames: string[] = [];
      const palaceNames: string[] = [];

      for (const palace of state.chartData.palaces) {
        const majors = palace.majorStars.map(s => s.name);
        majorStarNames.push(...majors);
        allStarNames.push(...majors, ...palace.minorStars.map(s => s.name));
        if (majors.length >= 2) {
          comboStars.push([majors[0], majors[1]]);
        }
        if (palace.majorStars.length > 0) {
          palaceNames.push(palace.name);
        }
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          majorStarNames: Array.from(new Set(majorStarNames)),
          comboStars,
          palaceNames,
          allStarNames: Array.from(new Set(allStarNames)),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '分析失敗');
      }
      const data = await res.json();
      const id = crypto.randomUUID();
      saveReport({
        id,
        createdAt: new Date().toISOString(),
        birthData: state.birthData,
        chartData: state.chartData,
        markdown: data.markdown,
      });
      dispatch({ type: 'ANALYZE_SUCCESS', markdown: data.markdown, id });
    } catch (err) {
      dispatch({ type: 'ANALYZE_ERROR', error: err instanceof Error ? err.message : '分析失敗' });
    }
  }, [state.chartData, state.birthData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814]">
      {/* Header */}
      <header className="border-b border-yellow-700/20 bg-purple-950/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold text-lg hover:text-yellow-300">
            ✦ 紫微星鑑
          </Link>
          {state.step > 1 && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-purple-400 text-sm hover:text-purple-300"
            >
              重新排盤
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <StepIndicator currentStep={state.step} />

        {/* Step 1: Birth Data Input */}
        {state.step === 1 && (
          <div>
            <h2 className="text-center text-yellow-300 text-xl font-bold mb-2">輸入出生資料</h2>
            <p className="text-center text-purple-400 text-sm mb-8">請填入準確的出生日期和時辰，以獲得精確的命盤分析</p>

            <BirthForm
              birthData={state.birthData}
              onChange={(data) => dispatch({ type: 'UPDATE_BIRTH', data })}
              onSubmit={handleGenerateChart}
              disabled={state.generating}
            />

            {state.chartError && (
              <div className="mt-4 text-center text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                {state.chartError}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Chart Confirmation */}
        {state.step === 2 && state.chartData && (
          <div>
            <h2 className="text-center text-yellow-300 text-xl font-bold mb-2">確認命盤</h2>
            <p className="text-center text-purple-400 text-sm mb-6">
              {state.birthData.year}/{state.birthData.month}/{state.birthData.day} {state.birthData.gender}
              ｜ {state.chartData.fiveElementsClass}
            </p>

            <ZiweiChart chartData={state.chartData} />

            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
                className="px-6 py-2.5 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60 transition-all"
              >
                ← 修改資料
              </button>
              <button
                onClick={handleAnalyze}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white font-bold text-sm hover:from-yellow-500/80 hover:to-amber-500/80 transition-all shadow-lg shadow-yellow-900/20"
              >
                ✦ AI 深度分析
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Analysis */}
        {state.step === 3 && (
          <div>
            {state.analyzing && <AnalysisLoading />}

            {state.analysisError && (
              <div className="text-center py-10">
                <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-4 mb-4">{state.analysisError}</div>
                <button
                  onClick={handleAnalyze}
                  className="text-yellow-400 text-sm underline hover:text-yellow-300"
                >
                  重新分析
                </button>
              </div>
            )}

            {state.reportMarkdown && (
              <div>
                <h2 className="text-center text-yellow-300 text-xl font-bold mb-6">命盤分析報告</h2>

                {/* Compact chart at top */}
                {state.chartData && (
                  <div className="mb-6">
                    <ZiweiChart chartData={state.chartData} compact />
                  </div>
                )}

                <ReportView markdown={state.reportMarkdown} />

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center mt-8">
                  {state.reportId && (
                    <Link
                      href={`/chat/${state.reportId}`}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white text-sm font-bold hover:from-purple-500/80 hover:to-purple-600/80 transition-all"
                    >
                      💬 向紫微大師提問
                    </Link>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60 transition-all"
                  >
                    🖨️ 列印報告
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'RESET' })}
                    className="px-6 py-2.5 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60 transition-all"
                  >
                    🔄 重新排盤
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
