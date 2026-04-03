'use client';

import { SHICHEN_LIST, type BirthData, type Gender, type CalendarType } from '@/lib/ziwei/types';

interface BirthFormProps {
  birthData: BirthData;
  onChange: (data: Partial<BirthData>) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BirthForm({ birthData, onChange, onSubmit, disabled }: BirthFormProps) {
  const daysInMonth = new Date(birthData.year, birthData.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 曆法選擇 */}
      <div>
        <label className="block text-purple-300 text-sm mb-2">曆法</label>
        <div className="flex gap-3">
          {(['solar', 'lunar'] as CalendarType[]).map(type => (
            <button
              key={type}
              onClick={() => onChange({ calendarType: type })}
              className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                birthData.calendarType === type
                  ? 'bg-yellow-600/20 border-yellow-500/60 text-yellow-300'
                  : 'bg-purple-950/40 border-purple-700/40 text-purple-400 hover:border-purple-500/60'
              }`}
            >
              {type === 'solar' ? '國曆（陽曆）' : '農曆（陰曆）'}
            </button>
          ))}
        </div>
      </div>

      {/* 出生日期 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-purple-300 text-sm mb-2">年</label>
          <select
            value={birthData.year}
            onChange={e => onChange({ year: Number(e.target.value) })}
            className="w-full bg-purple-950/60 border border-purple-700/40 rounded-lg px-3 py-2.5 text-purple-100 text-sm focus:border-yellow-500/60 focus:outline-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-purple-300 text-sm mb-2">月</label>
          <select
            value={birthData.month}
            onChange={e => onChange({ month: Number(e.target.value) })}
            className="w-full bg-purple-950/60 border border-purple-700/40 rounded-lg px-3 py-2.5 text-purple-100 text-sm focus:border-yellow-500/60 focus:outline-none"
          >
            {months.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>
        <div>
          <label className="block text-purple-300 text-sm mb-2">日</label>
          <select
            value={birthData.day > daysInMonth ? daysInMonth : birthData.day}
            onChange={e => onChange({ day: Number(e.target.value) })}
            className="w-full bg-purple-950/60 border border-purple-700/40 rounded-lg px-3 py-2.5 text-purple-100 text-sm focus:border-yellow-500/60 focus:outline-none"
          >
            {days.map(d => <option key={d} value={d}>{d}日</option>)}
          </select>
        </div>
      </div>

      {/* 農曆閏月 */}
      {birthData.calendarType === 'lunar' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="leapMonth"
            checked={birthData.isLeapMonth}
            onChange={e => onChange({ isLeapMonth: e.target.checked })}
            className="rounded border-purple-700 bg-purple-950"
          />
          <label htmlFor="leapMonth" className="text-purple-300 text-sm">閏月</label>
        </div>
      )}

      {/* 出生時辰 */}
      <div>
        <label className="block text-purple-300 text-sm mb-2">出生時辰</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SHICHEN_LIST.map(sc => (
            <button
              key={sc.value}
              onClick={() => onChange({ hour: sc.value })}
              className={`py-2 px-1 rounded-lg border text-xs transition-all ${
                birthData.hour === sc.value
                  ? 'bg-yellow-600/20 border-yellow-500/60 text-yellow-300'
                  : 'bg-purple-950/40 border-purple-700/40 text-purple-400 hover:border-purple-500/60'
              }`}
            >
              <div className="font-medium">{sc.label.split('（')[0]}</div>
              <div className="text-[10px] text-purple-500 mt-0.5">{sc.range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 性別 */}
      <div>
        <label className="block text-purple-300 text-sm mb-2">性別</label>
        <div className="flex gap-3">
          {(['男', '女'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={() => onChange({ gender: g })}
              className={`flex-1 py-2.5 rounded-lg border text-sm transition-all ${
                birthData.gender === g
                  ? 'bg-yellow-600/20 border-yellow-500/60 text-yellow-300'
                  : 'bg-purple-950/40 border-purple-700/40 text-purple-400 hover:border-purple-500/60'
              }`}
            >
              {g === '男' ? '♂ 男' : '♀ 女'}
            </button>
          ))}
        </div>
      </div>

      {/* 排盤按鈕 */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white font-bold text-sm hover:from-yellow-500/80 hover:to-amber-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-900/20"
      >
        {disabled ? '排盤中...' : '✦ 開始排盤'}
      </button>
    </div>
  );
}
