'use client';

import { useState } from 'react';

interface AnalysisData {
  profile: {
    headline: string;
    personality: string[];
    element: string;
    archetype: string;
  };
  scores: Record<string, { score: number; label: string; brief: string }>;
  palaceHighlights: Array<{
    palace: string;
    stars: string;
    brightness: string;
    score: number;
    title: string;
    insight: string;
    advice: string;
  }>;
  patterns: Array<{
    name: string;
    type: string;
    effect: string;
    tip: string;
  }>;
  fourTransforms: Array<{
    star: string;
    transform: string;
    palace: string;
    meaning: string;
  }>;
  currentFortune: {
    decade: string;
    year: string;
    theme: string;
    opportunity: string;
    challenge: string;
    advice: string;
  };
  lifePath: {
    summary: string;
    strengths: string[];
    growthAreas: string[];
    bestCareers: string[];
  };
}

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-[10px] text-purple-400 mt-1">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label, brief }: { score: number; label: string; brief: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-300' : score >= 40 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-purple-300 text-xs">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
      </div>
      <div className="h-2 bg-purple-900/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-purple-400 text-[10px]">{brief}</p>
    </div>
  );
}

function TransformBadge({ transform }: { transform: string }) {
  const styles: Record<string, string> = {
    '祿': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    '權': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    '科': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    '忌': 'bg-red-500/20 text-red-300 border-red-500/40',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${styles[transform] || 'border-purple-400'}`}>
      化{transform}
    </span>
  );
}

export default function VisualReport({ data }: { data: AnalysisData }) {
  const [expandedPalace, setExpandedPalace] = useState<number | null>(null);

  const scoreKeys = Object.keys(data.scores);

  return (
    <div className="space-y-6">

      {/* === Profile Card === */}
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/60 border border-yellow-700/30 rounded-2xl p-6 text-center">
        <div className="text-yellow-500/60 text-xs tracking-widest mb-2">命盤人格畫像</div>
        <h2 className="text-yellow-300 text-xl font-bold mb-2">{data.profile.headline}</h2>
        <div className="text-purple-400 text-sm mb-4">{data.profile.element} ｜ {data.profile.archetype}</div>
        <div className="flex flex-wrap justify-center gap-2">
          {data.profile.personality.map((trait, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-purple-800/40 border border-purple-700/30 text-purple-200 text-xs">
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* === Five Dimension Scores === */}
      <div className="bg-purple-950/50 border border-purple-800/30 rounded-2xl p-6">
        <h3 className="text-yellow-300 font-bold text-center mb-6">五維命格指數</h3>

        {/* Radar-like visual with bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {scoreKeys.map(key => (
            <ScoreBar
              key={key}
              score={data.scores[key].score}
              label={data.scores[key].label}
              brief={data.scores[key].brief}
            />
          ))}
        </div>

        {/* Score rings row */}
        <div className="flex justify-center gap-6 mt-6">
          {scoreKeys.map(key => (
            <div key={key} className="relative">
              <ScoreRing score={data.scores[key].score} size={70} label={data.scores[key].label} />
            </div>
          ))}
        </div>
      </div>

      {/* === Four Transforms === */}
      <div className="bg-purple-950/50 border border-purple-800/30 rounded-2xl p-6">
        <h3 className="text-yellow-300 font-bold text-center mb-4">生年四化</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.fourTransforms.map((ft, i) => (
            <div key={i} className="bg-purple-900/30 rounded-xl p-3 text-center border border-purple-800/20">
              <div className="mb-2"><TransformBadge transform={ft.transform} /></div>
              <div className="text-purple-100 text-sm font-bold">{ft.star}</div>
              <div className="text-purple-500 text-[10px] my-1">→ {ft.palace}</div>
              <div className="text-purple-300 text-[11px]">{ft.meaning}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === Palace Highlights === */}
      <div className="bg-purple-950/50 border border-purple-800/30 rounded-2xl p-6">
        <h3 className="text-yellow-300 font-bold text-center mb-4">核心宮位分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.palaceHighlights.map((ph, i) => {
            const isExpanded = expandedPalace === i;
            const scoreColor = ph.score >= 80 ? 'text-emerald-400' : ph.score >= 60 ? 'text-yellow-300' : ph.score >= 40 ? 'text-orange-400' : 'text-red-400';
            const barColor = ph.score >= 80 ? 'bg-emerald-500' : ph.score >= 60 ? 'bg-yellow-500' : ph.score >= 40 ? 'bg-orange-500' : 'bg-red-500';

            return (
              <div
                key={i}
                onClick={() => setExpandedPalace(isExpanded ? null : i)}
                className={`bg-purple-900/20 rounded-xl p-4 border border-purple-800/20 cursor-pointer transition-all hover:border-purple-600/40 ${
                  isExpanded ? 'md:col-span-2 ring-1 ring-yellow-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-yellow-400 text-xs font-bold">{ph.palace}</span>
                    <span className="text-purple-500 text-[10px] ml-2">{ph.stars} ({ph.brightness})</span>
                  </div>
                  <span className={`text-xl font-bold ${scoreColor}`}>{ph.score}</span>
                </div>

                <div className="h-1.5 bg-purple-900/40 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ph.score}%` }} />
                </div>

                <p className="text-purple-200 text-sm font-medium">{ph.title}</p>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-purple-700/30 space-y-2">
                    <p className="text-purple-300 text-xs leading-relaxed">{ph.insight}</p>
                    <div className="bg-yellow-500/5 rounded-lg px-3 py-2 border border-yellow-500/15">
                      <span className="text-yellow-400 text-[10px] font-bold">💡 建議：</span>
                      <span className="text-purple-200 text-xs ml-1">{ph.advice}</span>
                    </div>
                  </div>
                )}

                {!isExpanded && (
                  <div className="text-purple-600 text-[10px] text-right mt-1">點擊展開 ▼</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* === Patterns === */}
      {data.patterns && data.patterns.length > 0 && (
        <div className="bg-purple-950/50 border border-purple-800/30 rounded-2xl p-6">
          <h3 className="text-yellow-300 font-bold text-center mb-4">命盤格局</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.patterns.map((p, i) => (
              <div key={i} className={`rounded-xl p-4 border ${
                p.type === 'high-energy'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${p.type === 'high-energy' ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {p.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    p.type === 'high-energy'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {p.type === 'high-energy' ? '高能量' : '穩定型'}
                  </span>
                </div>
                <p className="text-purple-300 text-xs">{p.effect}</p>
                <p className="text-purple-400 text-[10px] mt-1">💡 {p.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === Current Fortune === */}
      <div className="bg-gradient-to-br from-yellow-900/10 to-purple-950/50 border border-yellow-700/30 rounded-2xl p-6">
        <h3 className="text-yellow-300 font-bold text-center mb-4">當前運勢</h3>
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-purple-900/30 rounded-lg px-4 py-2 text-center border border-purple-800/20">
            <div className="text-purple-400 text-[10px]">大限</div>
            <div className="text-yellow-300 font-bold">{data.currentFortune.decade}</div>
          </div>
          <div className="bg-purple-900/30 rounded-lg px-4 py-2 text-center border border-yellow-700/30">
            <div className="text-purple-400 text-[10px]">流年</div>
            <div className="text-yellow-300 font-bold">{data.currentFortune.year}</div>
          </div>
        </div>
        <p className="text-purple-200 text-center text-sm mb-4">{data.currentFortune.theme}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/15 text-center">
            <div className="text-emerald-400 text-xs font-bold mb-1">🎯 機會</div>
            <p className="text-purple-200 text-xs">{data.currentFortune.opportunity}</p>
          </div>
          <div className="bg-orange-500/5 rounded-xl p-3 border border-orange-500/15 text-center">
            <div className="text-orange-400 text-xs font-bold mb-1">⚡ 課題</div>
            <p className="text-purple-200 text-xs">{data.currentFortune.challenge}</p>
          </div>
          <div className="bg-yellow-500/5 rounded-xl p-3 border border-yellow-500/15 text-center">
            <div className="text-yellow-300 text-xs font-bold mb-1">💡 建議</div>
            <p className="text-purple-200 text-xs">{data.currentFortune.advice}</p>
          </div>
        </div>
      </div>

      {/* === Life Path === */}
      <div className="bg-purple-950/50 border border-yellow-700/30 rounded-2xl p-6">
        <h3 className="text-yellow-300 font-bold text-center mb-4">人生藍圖</h3>
        <p className="text-purple-200 text-sm text-center mb-6 max-w-lg mx-auto leading-relaxed">{data.lifePath.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-emerald-400 text-xs font-bold mb-2 text-center">✦ 核心優勢</div>
            <div className="space-y-1.5">
              {data.lifePath.strengths.map((s, i) => (
                <div key={i} className="bg-emerald-500/5 rounded-lg px-3 py-2 text-xs text-purple-200 border border-emerald-500/10">
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-amber-400 text-xs font-bold mb-2 text-center">✦ 成長方向</div>
            <div className="space-y-1.5">
              {data.lifePath.growthAreas.map((s, i) => (
                <div key={i} className="bg-amber-500/5 rounded-lg px-3 py-2 text-xs text-purple-200 border border-amber-500/10">
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sky-400 text-xs font-bold mb-2 text-center">✦ 適合職業</div>
            <div className="space-y-1.5">
              {data.lifePath.bestCareers.map((s, i) => (
                <div key={i} className="bg-sky-500/5 rounded-lg px-3 py-2 text-xs text-purple-200 border border-sky-500/10">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
