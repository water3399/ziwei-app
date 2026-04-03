import { astro } from 'iztro';
import type { BirthData, ChartData, PalaceData, StarInfo, PeriodInfo } from './types';

function extractStars(stars: unknown[]): StarInfo[] {
  if (!Array.isArray(stars)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return stars.map((s: any) => ({
    name: String(s.name || ''),
    type: String(s.type || 'major') as StarInfo['type'],
    brightness: s.brightness ? String(s.brightness) : undefined,
    mutagen: s.mutagen ? String(s.mutagen) : undefined,
  }));
}

function extractPalace(raw: Record<string, unknown>, index: number): PalaceData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  const decadal = r.decadal ? {
    range: r.decadal.range as [number, number],
    heavenlyStem: String(r.decadal.heavenlyStem || ''),
    earthlyBranch: String(r.decadal.earthlyBranch || ''),
  } : null;

  return {
    name: String(raw.name || ''),
    heavenlyStem: String(raw.heavenlyStem || ''),
    earthlyBranch: String(raw.earthlyBranch || ''),
    majorStars: extractStars(raw.majorStars as unknown[]),
    minorStars: extractStars(raw.minorStars as unknown[]),
    adjectiveStars: extractStars(raw.adjectiveStars as unknown[]),
    changsheng12: String(r.changsheng12 || ''),
    boshi12: String(r.boshi12 || ''),
    jiangqian12: String(r.jiangqian12 || ''),
    suiqian12: String(r.suiqian12 || ''),
    isBodyPalace: Boolean(r.isBodyPalace),
    decadal,
    ages: Array.isArray(r.ages) ? r.ages : [],
    index,
  };
}

export function generateChart(birthData: BirthData): ChartData {
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

  // Extract 12 palaces
  const palaces: PalaceData[] = [];
  for (let i = 0; i < 12; i++) {
    const raw = chart.palace(i);
    palaces.push(extractPalace(raw as Record<string, unknown>, i));
  }

  // Extract 四化 summary
  const mutagenStars: ChartData['mutagenStars'] = [];
  for (const palace of palaces) {
    for (const star of [...palace.majorStars, ...palace.minorStars]) {
      if (star.mutagen) {
        mutagenStars.push({
          starName: star.name,
          mutagen: star.mutagen,
          palaceName: palace.name,
        });
      }
    }
  }

  // Extract 大限/流年
  let currentDecadal: PeriodInfo | null = null;
  let currentYearly: PeriodInfo | null = null;
  try {
    const now = new Date();
    const h = chart.horoscope(now.toISOString().split('T')[0]);
    if (h?.decadal) {
      currentDecadal = {
        index: h.decadal.index ?? 0,
        heavenlyStem: String(h.decadal.heavenlyStem || ''),
        earthlyBranch: String(h.decadal.earthlyBranch || ''),
      };
    }
    if (h?.yearly) {
      currentYearly = {
        index: h.yearly.index ?? 0,
        heavenlyStem: String(h.yearly.heavenlyStem || ''),
        earthlyBranch: String(h.yearly.earthlyBranch || ''),
      };
    }
  } catch {
    // horoscope may fail for some dates
  }

  return {
    birthData,
    fiveElementsClass: String(chart.fiveElementsClass || ''),
    soul: String(chart.soul || ''),
    body: String(chart.body || ''),
    sign: String(chart.sign || ''),
    zodiac: String(chart.zodiac || ''),
    chineseDate: String(chart.chineseDate || ''),
    lunarDate: String(chart.lunarDate || ''),
    time: String(chart.time || ''),
    timeRange: String(chart.timeRange || ''),
    earthlyBranchOfSoulPalace: String(chart.earthlyBranchOfSoulPalace || ''),
    earthlyBranchOfBodyPalace: String(chart.earthlyBranchOfBodyPalace || ''),
    palaces,
    mutagenStars,
    currentDecadal,
    currentYearly,
  };
}

// Helper: format a palace into readable text for AI context
export function formatPalaceText(palace: PalaceData): string {
  const majors = palace.majorStars
    .map(s => {
      let str = s.name;
      if (s.brightness) str += `(${s.brightness})`;
      if (s.mutagen) str += `[化${s.mutagen}]`;
      return str;
    })
    .join('、') || '無主星';

  const minors = palace.minorStars
    .filter(s => s.name)
    .map(s => {
      let str = s.name;
      if (s.mutagen) str += `[化${s.mutagen}]`;
      return str;
    })
    .join('、');

  let text = `${palace.name}（${palace.heavenlyStem}${palace.earthlyBranch}）：主星 ${majors}`;
  if (minors) text += ` ｜ 輔星 ${minors}`;
  return text;
}

// Helper: get the 命宮 palace
export function getMingPalace(chart: ChartData): PalaceData | undefined {
  return chart.palaces.find(p => p.name === '命宮');
}

// Helper: format full chart as text for AI
export function formatChartText(chart: ChartData): string {
  const lines: string[] = [];
  lines.push(`【基本資料】`);
  lines.push(`出生：${chart.birthData.year}/${chart.birthData.month}/${chart.birthData.day}`);
  lines.push(`性別：${chart.birthData.gender}`);
  lines.push(`五行局：${chart.fiveElementsClass}`);
  lines.push(`命主：${chart.soul}　身主：${chart.body}`);
  lines.push('');
  lines.push(`【十二宮位】`);
  for (const palace of chart.palaces) {
    lines.push(formatPalaceText(palace));
  }
  lines.push('');
  if (chart.mutagenStars.length > 0) {
    lines.push(`【四化】`);
    for (const m of chart.mutagenStars) {
      lines.push(`${m.starName}化${m.mutagen} → ${m.palaceName}`);
    }
    lines.push('');
  }
  if (chart.currentDecadal) {
    const dp = chart.palaces[chart.currentDecadal.index];
    lines.push(`【當前大限】${dp?.name || ''}（${chart.currentDecadal.heavenlyStem}${chart.currentDecadal.earthlyBranch}）`);
  }
  if (chart.currentYearly) {
    const yp = chart.palaces[chart.currentYearly.index];
    lines.push(`【當前流年】${yp?.name || ''}（${chart.currentYearly.heavenlyStem}${chart.currentYearly.earthlyBranch}）`);
  }
  return lines.join('\n');
}
