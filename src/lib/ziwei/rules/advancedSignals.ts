// 進階訊號閘門層
// 把 rules 的原始資料轉成分級、帶信心值的結構化訊號
// contextBuilder 只消費這裡的輸出，不直接碰 rules 原文

import type { PalaceData } from '../types';
import { getResonanceByMinor } from './starResonance';
import { MALEFIC_PROFILES } from './maleficRules';
import { getStarTags } from './starTags';
import {
  calculateAllFlyingMutagens,
  assessJiSeverity,
  getJiSeverityLabel,
  getOppositePalace,
} from './flyingMutagen';

// ===== 信心等級 =====
export type Confidence = 'teacher_confirmed' | 'public_sources' | 'inferred';

// ===== 訊號類型 =====
export type SignalType =
  | 'resonance'        // 同氣加強
  | 'malefic_tag'      // 煞星能量標籤
  | 'flying_mutagen'   // 飛星四化
  | 'self_transform'   // 自化
  | 'ji_pressure'      // 忌壓力
  | 'ji_clash';        // 忌沖對宮

export interface AdvancedSignal {
  type: SignalType;
  confidence: Confidence;
  palace: string;
  stars: string[];
  summary: string;
  // 階段控制：phase 1 = 低風險先上，2 = 中風險，3 = 高風險
  phase: 1 | 2 | 3;
}

// ===== 第一階段：只產出低風險訊號 =====
// 老師確認的同氣 + 煞星標籤 + 飛星純計算

export function generateSignals(
  palaces: PalaceData[],
  maxPhase: 1 | 2 | 3 = 1,
): AdvancedSignal[] {
  const signals: AdvancedSignal[] = [];

  // 1. 同氣偵測
  signals.push(...detectResonance(palaces, maxPhase));

  // 2. 煞星能量標籤
  signals.push(...detectMaleficTags(palaces));

  // 3. 飛星四化
  if (maxPhase >= 1) {
    signals.push(...detectFlyingSignals(palaces, maxPhase));
  }

  return signals;
}

// ----- 同氣偵測 -----
function detectResonance(palaces: PalaceData[], maxPhase: 1 | 2 | 3): AdvancedSignal[] {
  const signals: AdvancedSignal[] = [];
  const opposites = buildOppositeMap(palaces);

  for (const palace of palaces) {
    const allStars = [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars];
    const majorNames = new Set(palace.majorStars.map(s => s.name));

    for (const star of allStars) {
      if (majorNames.has(star.name)) continue; // 跳過主星自己

      const pairs = getResonanceByMinor(star.name);
      for (const pair of pairs) {
        // 同宮：小弟和大哥在同一宮
        const hasMajorSamePalace = majorNames.has(pair.major);

        // 對宮：小弟在這宮，大哥在對宮
        const oppPalace = opposites.get(palace.name);
        const hasMajorOpposite = oppPalace
          ? oppPalace.majorStars.some(s => s.name === pair.major)
          : false;

        if (hasMajorSamePalace || hasMajorOpposite) {
          const confidence: Confidence = pair.confirmed ? 'teacher_confirmed' : 'public_sources';
          const phase = pair.confirmed ? 1 : 2;

          if (phase <= maxPhase) {
            const location = hasMajorSamePalace ? '同宮' : '對宮';
            signals.push({
              type: 'resonance',
              confidence,
              palace: palace.name,
              stars: [pair.major, pair.minor],
              summary: `${pair.major}與${pair.minor}${location}，${pair.effect}`,
              phase,
            });
          }
        }
      }
    }
  }

  return signals;
}

// ----- 煞星能量標籤 -----
function detectMaleficTags(palaces: PalaceData[]): AdvancedSignal[] {
  const signals: AdvancedSignal[] = [];

  for (const palace of palaces) {
    const allStars = [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars];

    for (const star of allStars) {
      const profile = MALEFIC_PROFILES[star.name];
      if (!profile) continue;

      const tags = getStarTags(star.name);
      signals.push({
        type: 'malefic_tag',
        confidence: 'public_sources',
        palace: palace.name,
        stars: [star.name],
        summary: `${palace.name}有${star.name}（${profile.nature}），能量標籤：${tags.join('、')}`,
        phase: 1,
      });
    }
  }

  return signals;
}

// ----- 飛星四化訊號 -----
// 過濾策略：不全量輸出，只保留有分析價值的訊號
const KEY_PALACES = new Set(['命宮', '官祿', '財帛', '福德', '夫妻', '遷移']);

function isFlyingSignificant(f: { fromPalace: string; toPalace: string; mutagenType: string; isSelfTransform: boolean }): boolean {
  // 自化一律保留（能量外洩是重要訊號）
  if (f.isSelfTransform) return true;
  // 化忌一律保留（忌是最需要關注的）
  if (f.mutagenType === '化忌') return true;
  // 重點宮位飛出的化祿/化權保留
  if (KEY_PALACES.has(f.fromPalace) && (f.mutagenType === '化祿' || f.mutagenType === '化權')) return true;
  // 化祿/化權飛入重點宮位也保留
  if (KEY_PALACES.has(f.toPalace) && (f.mutagenType === '化祿' || f.mutagenType === '化權')) return true;
  // 其餘過濾掉（化科影響力較小，非重點宮位的祿權也過濾）
  return false;
}

function detectFlyingSignals(palaces: PalaceData[], maxPhase: 1 | 2 | 3): AdvancedSignal[] {
  const signals: AdvancedSignal[] = [];
  const allFlying = calculateAllFlyingMutagens(palaces);

  // Phase 1: 只保留有分析價值的飛星
  for (const f of allFlying) {
    if (!isFlyingSignificant(f)) continue;

    signals.push({
      type: f.isSelfTransform ? 'self_transform' : 'flying_mutagen',
      confidence: 'public_sources',
      palace: f.fromPalace,
      stars: [f.activatedStar],
      summary: f.isSelfTransform
        ? `${f.fromPalace}自化${f.mutagenType.replace('化', '')}（${f.activatedStar}），能量有外洩跡象`
        : `${f.fromPalace}（${f.fromStem}）${f.mutagenType}飛入${f.toPalace}（${f.activatedStar}）`,
      phase: 1,
    });
  }

  // Phase 2: 忌壓力評估
  if (maxPhase >= 2) {
    for (const palace of palaces) {
      const jiCount = assessJiSeverity(palace.name, allFlying);
      if (jiCount >= 2) {
        signals.push({
          type: 'ji_pressure',
          confidence: 'public_sources',
          palace: palace.name,
          stars: allFlying
            .filter(f => f.mutagenType === '化忌' && f.toPalace === palace.name)
            .map(f => f.activatedStar),
          summary: `${palace.name}承受${jiCount}忌：${getJiSeverityLabel(jiCount)}`,
          phase: 2,
        });
      }
    }
  }

  // Phase 3: 忌沖對宮
  if (maxPhase >= 3) {
    const jiResults = allFlying.filter(f => f.mutagenType === '化忌');
    for (const ji of jiResults) {
      const clash = getOppositePalace(ji.toPalace);
      if (clash) {
        signals.push({
          type: 'ji_clash',
          confidence: 'public_sources',
          palace: ji.toPalace,
          stars: [ji.activatedStar],
          summary: `${ji.activatedStar}化忌在${ji.toPalace}，沖${clash}，${clash}相關事務需留意`,
          phase: 3,
        });
      }
    }
  }

  return signals;
}

// ===== 格式化輸出：給 contextBuilder 用 =====
export function formatSignalsForContext(signals: AdvancedSignal[]): string {
  if (signals.length === 0) return '';

  const sections: string[] = ['===== 進階命盤訊號 ====='];

  // 按信心分組
  const confirmed = signals.filter(s => s.confidence === 'teacher_confirmed');
  const derived = signals.filter(s => s.confidence !== 'teacher_confirmed');

  if (confirmed.length > 0) {
    sections.push('');
    sections.push('【核心訊號（已校正）】');
    for (const s of confirmed) {
      sections.push(`  ▸ ${s.summary}`);
    }
  }

  if (derived.length > 0) {
    sections.push('');
    sections.push('【參考訊號（公開資料推導，僅供輔助判斷）】');
    for (const s of derived) {
      sections.push(`  ▸ ${s.summary}`);
    }
  }

  return sections.join('\n');
}

// ===== 輔助 =====
function buildOppositeMap(palaces: PalaceData[]): Map<string, PalaceData> {
  const map = new Map<string, PalaceData>();
  for (const p of palaces) {
    const oppName = getOppositePalace(p.name);
    if (oppName) {
      const oppPalace = palaces.find(x => x.name === oppName);
      if (oppPalace) map.set(p.name, oppPalace);
    }
  }
  return map;
}
