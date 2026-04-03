'use client';

import type { ChartData } from '@/lib/ziwei/types';

interface ChartSummaryProps {
  chartData: ChartData;
}

export default function ChartSummary({ chartData }: ChartSummaryProps) {
  const ming = chartData.palaces.find(p => p.name === '命宮');
  const career = chartData.palaces.find(p => p.name === '官祿');
  const wealth = chartData.palaces.find(p => p.name === '財帛');
  const spouse = chartData.palaces.find(p => p.name === '夫妻');

  const formatStars = (palace?: typeof chartData.palaces[0]) => {
    if (!palace) return '—';
    return palace.majorStars.map(s => {
      let str = s.name;
      if (s.brightness) str += `(${s.brightness})`;
      if (s.mutagen) str += ` 化${s.mutagen}`;
      return str;
    }).join('、') || '空宮';
  };

  return (
    <div className="bg-purple-950/60 border border-yellow-700/30 rounded-lg p-4 text-sm">
      <h3 className="text-yellow-400 font-bold mb-3 text-center">命盤摘要</h3>

      <div className="space-y-2 text-purple-200">
        <div className="flex justify-between">
          <span className="text-purple-400">出生</span>
          <span>{chartData.birthData.year}/{chartData.birthData.month}/{chartData.birthData.day}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400">性別</span>
          <span>{chartData.birthData.gender}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400">五行局</span>
          <span className="text-yellow-300">{chartData.fiveElementsClass}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400">命主 / 身主</span>
          <span>{chartData.soul} / {chartData.body}</span>
        </div>

        <div className="border-t border-purple-800/50 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-purple-400">命宮</span>
            <span className="text-yellow-300">{formatStars(ming)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">官祿</span>
            <span>{formatStars(career)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">財帛</span>
            <span>{formatStars(wealth)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">夫妻</span>
            <span>{formatStars(spouse)}</span>
          </div>
        </div>

        {chartData.mutagenStars.length > 0 && (
          <div className="border-t border-purple-800/50 pt-2 mt-2">
            <span className="text-purple-400 block mb-1">四化</span>
            <div className="flex flex-wrap gap-2">
              {chartData.mutagenStars.map((m, i) => {
                const colors: Record<string, string> = {
                  '祿': 'text-emerald-400', '權': 'text-amber-400',
                  '科': 'text-sky-400', '忌': 'text-red-400',
                };
                return (
                  <span key={i} className={`text-xs ${colors[m.mutagen] || ''}`}>
                    {m.starName}化{m.mutagen}→{m.palaceName}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
