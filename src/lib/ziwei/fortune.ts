import { astro } from 'iztro';
import type { BirthData } from './types';

export interface MonthlyFortune {
  month: number;
  palaceName: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: { name: string; brightness?: string; mutagen?: string }[];
  minorStars: { name: string; mutagen?: string }[];
  mutagen: string[];  // 流月四化
  // 流月宮位在12宮的名稱（流月命宮、流月財帛等）
  monthlyPalaceRole: string;
}

export interface YearlyFortune {
  year: number;
  // 流年
  yearlyPalaceName: string;
  yearlyHeavenlyStem: string;
  yearlyEarthlyBranch: string;
  yearlyMutagen: string[];  // 流年四化星名
  yearlyPalaceNames: string[];  // 流年12宮重排
  // 大限
  decadalPalaceName: string;
  decadalHeavenlyStem: string;
  decadalEarthlyBranch: string;
  decadalMutagen: string[];
  // 小限
  agePalaceName: string;
  // 12 個月
  months: MonthlyFortune[];
}

export function generateYearlyFortune(birthData: BirthData, year: number): YearlyFortune {
  const dateStr = `${birthData.year}-${birthData.month}-${birthData.day}`;
  const hour = birthData.hour;
  const gender = birthData.gender === '男' ? '男' : '女';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chart: any;
  if (birthData.calendarType === 'solar') {
    chart = astro.bySolar(dateStr, hour, gender, true, 'zh-TW');
  } else {
    chart = astro.byLunar(dateStr, hour, gender, birthData.isLeapMonth, true, 'zh-TW');
  }

  // Get yearly horoscope at mid-year
  const h = chart.horoscope(`${year}-6-15`);

  // Yearly info
  const yearlyPalace = chart.palace(h.yearly.index);
  const decadalPalace = chart.palace(h.decadal.index);
  const agePalace = chart.palace(h.age?.index ?? 0);

  // 12 months
  const months: MonthlyFortune[] = [];
  for (let month = 1; month <= 12; month++) {
    const mh = chart.horoscope(`${year}-${month}-15`);
    const mm = mh.monthly;
    const mp = chart.palace(mm.index);

    // Get which role this palace plays in the monthly rotation
    const monthlyPalaceRole = mm.palaceNames?.[0] || '';

    months.push({
      month,
      palaceName: mp.name,
      heavenlyStem: mm.heavenlyStem || '',
      earthlyBranch: mm.earthlyBranch || '',
      majorStars: mp.majorStars.map((s: { name: string; brightness?: string; mutagen?: string }) => ({
        name: s.name,
        brightness: s.brightness || undefined,
        mutagen: s.mutagen || undefined,
      })),
      minorStars: mp.minorStars
        .filter((s: { mutagen?: string }) => s.mutagen)
        .map((s: { name: string; mutagen?: string }) => ({
          name: s.name,
          mutagen: s.mutagen || undefined,
        })),
      mutagen: mm.mutagen || [],
      monthlyPalaceRole,
    });
  }

  return {
    year,
    yearlyPalaceName: yearlyPalace.name,
    yearlyHeavenlyStem: h.yearly.heavenlyStem || '',
    yearlyEarthlyBranch: h.yearly.earthlyBranch || '',
    yearlyMutagen: h.yearly.mutagen || [],
    yearlyPalaceNames: h.yearly.palaceNames || [],
    decadalPalaceName: decadalPalace.name,
    decadalHeavenlyStem: h.decadal.heavenlyStem || '',
    decadalEarthlyBranch: h.decadal.earthlyBranch || '',
    decadalMutagen: h.decadal.mutagen || [],
    agePalaceName: agePalace.name,
    months,
  };
}

// Format fortune data for AI analysis
export function formatFortuneContext(fortune: YearlyFortune): string {
  const lines: string[] = [];
  lines.push(`===== ${fortune.year}年流年完整資料 =====`);
  lines.push('');
  lines.push(`【大限】${fortune.decadalPalaceName}（${fortune.decadalHeavenlyStem}${fortune.decadalEarthlyBranch}）`);
  lines.push(`大限四化星：${fortune.decadalMutagen.join('、')}`);
  lines.push('');
  lines.push(`【流年】${fortune.yearlyPalaceName}（${fortune.yearlyHeavenlyStem}${fortune.yearlyEarthlyBranch}）`);
  lines.push(`流年四化星：${fortune.yearlyMutagen.join('、')}`);
  lines.push(`流年十二宮重排：${fortune.yearlyPalaceNames.join('→')}`);
  lines.push('');
  lines.push(`【小限】${fortune.agePalaceName}`);
  lines.push('');
  lines.push(`===== ${fortune.year}年逐月分析資料 =====`);

  for (const m of fortune.months) {
    const stars = m.majorStars.map(s => {
      let str = s.name;
      if (s.brightness) str += `(${s.brightness})`;
      if (s.mutagen) str += `[化${s.mutagen}]`;
      return str;
    }).join('、') || '空宮';

    const mutagenInfo = m.mutagen.length > 0
      ? `流月四化：${m.mutagen.join('、')}`
      : '';

    lines.push(`${m.month}月：流月宮=${m.palaceName}（${m.heavenlyStem}${m.earthlyBranch}）主星=${stars} ${mutagenInfo}`);
  }

  return lines.join('\n');
}
