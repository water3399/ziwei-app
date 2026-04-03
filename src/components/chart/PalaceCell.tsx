'use client';

import type { PalaceData } from '@/lib/ziwei/types';

function brightnessColor(b?: string): string {
  if (!b) return 'text-purple-200';
  if (b === '廟') return 'text-yellow-300 font-bold';
  if (b === '旺') return 'text-green-400 font-bold';
  if (b === '得') return 'text-purple-100 font-semibold';
  if (b === '利') return 'text-purple-200';
  if (b === '平') return 'text-purple-400';
  if (b === '不') return 'text-orange-400';
  if (b === '陷') return 'text-red-400';
  return 'text-purple-200';
}

function brightnessTag(b?: string): JSX.Element | null {
  if (!b) return null;
  const colors: Record<string, string> = {
    '廟': 'text-yellow-400',
    '旺': 'text-green-400',
    '得': 'text-blue-300',
    '利': 'text-purple-300',
    '平': 'text-purple-500',
    '不': 'text-orange-400',
    '陷': 'text-red-400',
  };
  return <span className={`text-[8px] ${colors[b] || 'text-purple-400'}`}>{b}</span>;
}

function mutagenBadge(m?: string): JSX.Element | null {
  if (!m) return null;
  const styles: Record<string, string> = {
    '祿': 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
    '權': 'bg-amber-500/25 text-amber-300 border-amber-500/50',
    '科': 'bg-sky-500/25 text-sky-300 border-sky-500/50',
    '忌': 'bg-red-500/25 text-red-300 border-red-500/50',
  };
  return (
    <span className={`text-[8px] px-1 py-0.5 rounded border font-bold ${styles[m] || 'border-purple-400 text-purple-300'}`}>
      {m}
    </span>
  );
}

interface PalaceCellProps {
  palace: PalaceData;
  isHighlighted?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function PalaceCell({ palace, isHighlighted, compact, onClick }: PalaceCellProps) {
  const isMing = palace.name === '命宮';
  const isBody = palace.isBodyPalace;
  const decadalRange = palace.decadal?.range;

  return (
    <div
      onClick={onClick}
      className={`
        relative border border-yellow-700/25 flex flex-col overflow-hidden
        transition-all duration-200
        ${isHighlighted ? 'bg-purple-800/40 border-yellow-500/60 shadow-lg shadow-purple-500/10' : 'bg-purple-950/50 hover:bg-purple-900/30'}
        ${isMing ? 'ring-1 ring-yellow-600/40' : ''}
        ${compact ? 'p-1 min-h-[55px]' : 'p-1.5 min-h-[100px]'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Top bar: 宮位名 + 天干地支 */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-bold ${isMing ? 'text-yellow-400' : 'text-purple-400'}`}>
            {palace.name}
          </span>
          {isMing && <span className="text-yellow-500 text-[8px]">★</span>}
          {isBody && <span className="text-cyan-400 text-[8px]">身</span>}
        </div>
        <span className="text-[8px] text-purple-600">
          {palace.heavenlyStem}{palace.earthlyBranch}
        </span>
      </div>

      {/* 主星 */}
      <div className="flex flex-col gap-0.5">
        {palace.majorStars.length === 0 && (
          <span className="text-[9px] text-purple-600/60 italic">空宮</span>
        )}
        {palace.majorStars.map((star) => (
          <div key={star.name} className="flex items-center gap-0.5 flex-wrap">
            <span className={`text-[11px] leading-tight ${brightnessColor(star.brightness)}`}>
              {star.name}
            </span>
            {brightnessTag(star.brightness)}
            {mutagenBadge(star.mutagen)}
          </div>
        ))}
      </div>

      {!compact && (
        <>
          {/* 輔星（六吉六煞 + 祿存天馬） */}
          {palace.minorStars.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-x-1 gap-y-0">
              {palace.minorStars.map((star) => (
                <span key={star.name} className="text-[9px] text-purple-300/80 flex items-center gap-0.5">
                  {star.name}
                  {star.brightness && <span className="text-[7px] text-purple-500">{star.brightness}</span>}
                  {mutagenBadge(star.mutagen)}
                </span>
              ))}
            </div>
          )}

          {/* 雜曜 */}
          {palace.adjectiveStars.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-x-1">
              {palace.adjectiveStars.map((star) => (
                <span key={star.name} className="text-[8px] text-purple-500/60">
                  {star.name}
                </span>
              ))}
            </div>
          )}

          {/* Bottom area: 長生 + 博士 + 將前 + 歲前 + 大限 + 小限 */}
          <div className="mt-auto pt-1 space-y-0.5">
            <div className="flex flex-wrap gap-x-1.5">
              {palace.changsheng12 && (
                <span className="text-[7px] text-yellow-600/70">{palace.changsheng12}</span>
              )}
              {palace.boshi12 && (
                <span className="text-[7px] text-cyan-600/60">{palace.boshi12}</span>
              )}
              {palace.jiangqian12 && (
                <span className="text-[7px] text-pink-600/50">{palace.jiangqian12}</span>
              )}
              {palace.suiqian12 && (
                <span className="text-[7px] text-green-600/50">{palace.suiqian12}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              {palace.ages && palace.ages.length > 0 && (
                <span className="text-[7px] text-purple-700/60 font-mono">
                  {palace.ages.slice(0, 5).join(' ')}
                </span>
              )}
              {decadalRange && (
                <span className="text-[7px] text-red-400/70 font-bold font-mono">
                  {decadalRange[0]}-{decadalRange[1]}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
