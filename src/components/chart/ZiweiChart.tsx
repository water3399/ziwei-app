'use client';

import type { ChartData } from '@/lib/ziwei/types';
import PalaceCell from './PalaceCell';

interface ZiweiChartProps {
  chartData: ChartData;
  highlightIndex?: number;
  compact?: boolean;
  onPalaceClick?: (index: number) => void;
}

/*
  Traditional 紫微命盤 layout (4×4 grid):

  ┌────┬────┬────┬────┐
  │ 巳 │ 午 │ 未 │ 申 │   indexes from iztro by earthly branch:
  │ i4 │ i5 │ i6 │ i7 │   巳=4, 午=5, 未=6, 申=7
  ├────┼────┴────┼────┤
  │ 辰 │ CENTER  │ 酉 │   辰=3, 酉=8
  │ i3 │         │ i8 │
  ├────┤  Info   ├────┤
  │ 卯 │         │ 戌 │   卯=2, 戌=9
  │ i2 │         │ i9 │
  ├────┼────┬────┼────┤
  │ 寅 │ 丑 │ 子 │ 亥 │   寅=1, 丑=0, 子=11(子=index varies), 亥=10
  │ i1 │ i0 │ i11│ i10│
  └────┴────┴────┴────┘

  iztro palace(i) uses index 0-11 where index 0 is 丑 position by default.
  We need to map by earthly branch to the correct grid position.
*/

const BRANCH_ORDER = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];

// Grid positions for each earthly branch [row, col]
const GRID_POSITIONS: Record<string, [number, number]> = {
  '巳': [0, 0], '午': [0, 1], '未': [0, 2], '申': [0, 3],
  '辰': [1, 0],                               '酉': [1, 3],
  '卯': [2, 0],                               '戌': [2, 3],
  '寅': [3, 0], '丑': [3, 1], '子': [3, 2], '亥': [3, 3],
};

export default function ZiweiChart({ chartData, highlightIndex, compact, onPalaceClick }: ZiweiChartProps) {
  // Build branch-to-palace mapping
  const branchMap = new Map<string, { palace: typeof chartData.palaces[0]; idx: number }>();
  for (let i = 0; i < chartData.palaces.length; i++) {
    const p = chartData.palaces[i];
    branchMap.set(p.earthlyBranch, { palace: p, idx: i });
  }

  // Create 4x4 grid
  const grid: (JSX.Element | null)[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  for (const branch of BRANCH_ORDER) {
    const pos = GRID_POSITIONS[branch];
    const entry = branchMap.get(branch);
    if (pos && entry) {
      grid[pos[0]][pos[1]] = (
        <PalaceCell
          key={branch}
          palace={entry.palace}
          isHighlighted={highlightIndex === entry.idx}
          compact={compact}
          onClick={onPalaceClick ? () => onPalaceClick(entry.idx) : undefined}
        />
      );
    }
  }

  // Center info area
  const ming = chartData.palaces.find(p => p.name === '命宮');
  const mingStars = ming?.majorStars.map(s => s.name).join('、') || '—';

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className={`grid grid-cols-4 gap-0 border border-yellow-700/40 rounded-lg overflow-hidden bg-purple-950/60 ${compact ? '' : 'shadow-xl shadow-purple-900/30'}`}>
        {/* Row 0: 巳午未申 */}
        {grid[0].map((cell, i) => (
          <div key={`r0-${i}`}>{cell}</div>
        ))}

        {/* Row 1: 辰 + center-top + 酉 */}
        <div>{grid[1][0]}</div>
        <div className="col-span-2 row-span-2 flex flex-col items-center justify-center p-3 bg-purple-950/80 border-x border-yellow-700/20">
          {!compact && (
            <>
              <div className="text-yellow-500/60 text-[9px] tracking-[0.2em] mb-1">紫微斗數命盤</div>
              <div className="text-yellow-300 text-sm font-bold">
                {chartData.birthData.year}/{chartData.birthData.month}/{chartData.birthData.day}
              </div>
              <div className="text-purple-300 text-[11px] mb-1">
                {chartData.birthData.gender} ｜ {chartData.fiveElementsClass}
              </div>
              <div className="text-purple-400 text-[10px] space-y-0.5">
                <div>命主：{chartData.soul}　身主：{chartData.body}</div>
                {chartData.sign && <div>星座：{chartData.sign}</div>}
                {chartData.chineseDate && <div className="text-[9px] text-purple-500">{chartData.chineseDate}</div>}
                {chartData.lunarDate && <div className="text-[9px] text-purple-500">{chartData.lunarDate}</div>}
              </div>
              <div className="mt-2 px-3 py-1 rounded bg-yellow-600/10 border border-yellow-600/30">
                <span className="text-yellow-300 text-[11px]">命宮：{mingStars}</span>
              </div>
              {chartData.mutagenStars.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                  {chartData.mutagenStars.map((m, i) => {
                    const colors: Record<string, string> = {
                      '祿': 'text-emerald-400', '權': 'text-amber-400',
                      '科': 'text-sky-400', '忌': 'text-red-400',
                    };
                    return (
                      <span key={i} className={`text-[9px] ${colors[m.mutagen] || 'text-purple-300'}`}>
                        {m.starName}化{m.mutagen}
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {compact && (
            <>
              <div className="text-yellow-300 text-xs font-bold">
                {chartData.birthData.year}/{chartData.birthData.month}/{chartData.birthData.day}
              </div>
              <div className="text-purple-400 text-[10px]">{chartData.fiveElementsClass}</div>
              <div className="text-yellow-400 text-[10px] mt-1">命宮：{mingStars}</div>
            </>
          )}
        </div>
        <div>{grid[1][3]}</div>

        {/* Row 2: 卯 + center-bottom + 戌 */}
        <div>{grid[2][0]}</div>
        {/* center already spans */}
        <div>{grid[2][3]}</div>

        {/* Row 3: 寅丑子亥 */}
        {grid[3].map((cell, i) => (
          <div key={`r3-${i}`}>{cell}</div>
        ))}
      </div>
    </div>
  );
}
