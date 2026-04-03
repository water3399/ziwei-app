import type { ChartData, PalaceData } from './types';
import { formatPalaceText } from './engine';
import { getStarTraits, getComboInterpretation, getPalaceMeaning, MUTAGEN_MEANINGS } from './knowledge';

// 為單一宮位生成知識增強的分析上下文
function buildPalaceContext(palace: PalaceData): string {
  const lines: string[] = [];
  lines.push(formatPalaceText(palace));

  // 主星特質查詢
  const majorNames = palace.majorStars.map(s => s.name);
  for (const star of palace.majorStars) {
    const traits = getStarTraits(star.name);
    if (traits) {
      let starLine = `  ▸ ${star.name}：${traits.nature}，${traits.keywords.join('、')}`;
      if (star.brightness) starLine += `（亮度：${star.brightness}）`;
      if (star.mutagen) {
        const mm = MUTAGEN_MEANINGS[star.mutagen];
        starLine += `【化${star.mutagen}：${mm?.nature || ''}，${mm?.effect || ''}】`;
      }
      lines.push(starLine);
    }
  }

  // 雙星組合查詢
  if (majorNames.length >= 2) {
    const combo = getComboInterpretation(majorNames[0], majorNames[1]);
    if (combo) {
      lines.push(`  ▸ 雙星組合（${majorNames.join('+')}）：${combo}`);
    }
  }

  // 輔星四化
  for (const star of palace.minorStars) {
    if (star.mutagen) {
      const mm = MUTAGEN_MEANINGS[star.mutagen];
      lines.push(`  ▸ ${star.name}化${star.mutagen}：${mm?.effect || ''}`);
    }
  }

  return lines.join('\n');
}

// 為完整命盤生成 AI 分析用的上下文（用於 /api/analyze）
export function buildAnalysisContext(chart: ChartData): string {
  const sections: string[] = [];
  const year = new Date().getFullYear();

  // 1. 基本資料
  sections.push(`===== 命盤基本資料 =====`);
  sections.push(`出生日期：${chart.birthData.year}年${chart.birthData.month}月${chart.birthData.day}日`);
  sections.push(`曆法：${chart.birthData.calendarType === 'solar' ? '國曆' : '農曆'}`);
  sections.push(`性別：${chart.birthData.gender}`);
  sections.push(`五行局：${chart.fiveElementsClass}`);
  sections.push(`命主：${chart.soul}　身主：${chart.body}`);

  // 找到命宮和身宮
  const mingPalace = chart.palaces.find(p => p.name === '命宮');
  if (mingPalace) {
    sections.push(`命宮位置：${mingPalace.heavenlyStem}${mingPalace.earthlyBranch}`);
  }

  // 2. 四化總覽
  if (chart.mutagenStars.length > 0) {
    sections.push('');
    sections.push(`===== 生年四化（最重要） =====`);
    for (const m of chart.mutagenStars) {
      const mm = MUTAGEN_MEANINGS[m.mutagen];
      sections.push(`${m.starName}化${m.mutagen} → ${m.palaceName}（${mm?.nature || ''}：${mm?.description || ''}）`);
    }
  }

  // 3. 十二宮位逐宮分析
  sections.push('');
  sections.push(`===== 十二宮位詳細資料（含知識庫解釋） =====`);

  // 按重要性排序：命宮 > 官祿 > 財帛 > 夫妻 > 其他
  const priorityOrder = ['命宮', '官祿', '財帛', '夫妻', '遷移', '福德', '疾厄', '父母', '子女', '兄弟', '僕役', '田宅'];
  const sortedPalaces = [...chart.palaces].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.name);
    const bIdx = priorityOrder.indexOf(b.name);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  for (const palace of sortedPalaces) {
    const meaning = getPalaceMeaning(palace.name);
    sections.push('');
    sections.push(`【${palace.name}】${meaning ? `（${meaning.domain}）` : ''}`);
    sections.push(buildPalaceContext(palace));
  }

  // 4. 大限流年
  if (chart.currentDecadal) {
    sections.push('');
    sections.push(`===== 當前大限（${year}年） =====`);
    const dp = chart.palaces[chart.currentDecadal.index];
    if (dp) {
      sections.push(`大限宮位：${dp.name}（${chart.currentDecadal.heavenlyStem}${chart.currentDecadal.earthlyBranch}）`);
      sections.push(buildPalaceContext(dp));
    }
  }

  if (chart.currentYearly) {
    sections.push('');
    sections.push(`===== ${year}年流年 =====`);
    const yp = chart.palaces[chart.currentYearly.index];
    if (yp) {
      sections.push(`流年宮位：${yp.name}（${chart.currentYearly.heavenlyStem}${chart.currentYearly.earthlyBranch}）`);
      sections.push(buildPalaceContext(yp));
    }
  }

  return sections.join('\n');
}

// 為 Chat 生成精簡版上下文
export function buildChatContext(chart: ChartData, reportMarkdown: string): string {
  const lines: string[] = [];
  lines.push(`【命盤摘要】`);
  lines.push(`出生：${chart.birthData.year}/${chart.birthData.month}/${chart.birthData.day} ${chart.birthData.gender}`);
  lines.push(`五行局：${chart.fiveElementsClass} ｜ 命主：${chart.soul} ｜ 身主：${chart.body}`);

  const ming = chart.palaces.find(p => p.name === '命宮');
  if (ming) {
    const stars = ming.majorStars.map(s => s.name).join('、') || '無主星';
    lines.push(`命宮主星：${stars}`);
  }

  if (chart.mutagenStars.length > 0) {
    lines.push(`四化：${chart.mutagenStars.map(m => `${m.starName}化${m.mutagen}→${m.palaceName}`).join('、')}`);
  }

  // 附上報告的前 2000 字作為參考
  lines.push('');
  lines.push(`【分析報告摘要】`);
  lines.push(reportMarkdown.substring(0, 2000));

  return lines.join('\n');
}
