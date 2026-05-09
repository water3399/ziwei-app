// 飛星四化計算
// 宮干四化：每個宮位的天干產生四化，飛入其他宮位

import type { PalaceData } from '../types';

// ===== 十天干四化表 =====
export const SIHUA_TABLE: Record<string, { 化祿: string; 化權: string; 化科: string; 化忌: string }> = {
  '甲': { 化祿: '廉貞', 化權: '破軍', 化科: '武曲', 化忌: '太陽' },
  '乙': { 化祿: '天機', 化權: '天梁', 化科: '紫微', 化忌: '太陰' },
  '丙': { 化祿: '天同', 化權: '天機', 化科: '文昌', 化忌: '廉貞' },
  '丁': { 化祿: '太陰', 化權: '天同', 化科: '天機', 化忌: '巨門' },
  '戊': { 化祿: '貪狼', 化權: '太陰', 化科: '右弼', 化忌: '天機' },
  '己': { 化祿: '武曲', 化權: '貪狼', 化科: '天梁', 化忌: '文曲' },
  '庚': { 化祿: '太陽', 化權: '武曲', 化科: '太陰', 化忌: '天同' },
  '辛': { 化祿: '巨門', 化權: '太陽', 化科: '文曲', 化忌: '文昌' },
  '壬': { 化祿: '天梁', 化權: '紫微', 化科: '左輔', 化忌: '武曲' },
  '癸': { 化祿: '破軍', 化權: '巨門', 化科: '太陰', 化忌: '貪狼' },
};

export type MutagenType = '化祿' | '化權' | '化科' | '化忌';

// ===== 飛星結果 =====
export interface FlyingResult {
  fromPalace: string;       // 化出宮
  fromStem: string;         // 宮干
  mutagenType: MutagenType; // 化祿/權/科/忌
  activatedStar: string;    // 被激活的星
  toPalace: string;         // 化入宮（星所在的宮位）
  isSelfTransform: boolean; // 是否自化（星就在化出宮內）
}

// ===== 計算某一宮的宮干四化飛向 =====
export function calculateFlyingMutagen(
  sourcePalace: PalaceData,
  allPalaces: PalaceData[],
): FlyingResult[] {
  const stem = sourcePalace.heavenlyStem;
  const sihua = SIHUA_TABLE[stem];
  if (!sihua) return [];

  const results: FlyingResult[] = [];

  for (const [mutagenType, starName] of Object.entries(sihua)) {
    // 在所有宮位中找到這顆星
    const targetPalace = findStarInPalaces(starName, allPalaces);
    if (!targetPalace) continue;

    results.push({
      fromPalace: sourcePalace.name,
      fromStem: stem,
      mutagenType: mutagenType as MutagenType,
      activatedStar: starName,
      toPalace: targetPalace.name,
      isSelfTransform: targetPalace.name === sourcePalace.name,
    });
  }

  return results;
}

// ===== 計算全盤 12 宮的飛星四化 =====
export function calculateAllFlyingMutagens(palaces: PalaceData[]): FlyingResult[] {
  const all: FlyingResult[] = [];
  for (const palace of palaces) {
    all.push(...calculateFlyingMutagen(palace, palaces));
  }
  return all;
}

// ===== 化忌轉忌：追蹤因果鏈 =====
// A宮化忌飛入B宮 → 再看B宮天干的化忌飛去哪裡
export function traceJiChain(
  startPalace: PalaceData,
  allPalaces: PalaceData[],
  maxDepth: number = 3,
): FlyingResult[] {
  const chain: FlyingResult[] = [];
  let current = startPalace;

  for (let i = 0; i < maxDepth; i++) {
    const flying = calculateFlyingMutagen(current, allPalaces);
    const ji = flying.find(f => f.mutagenType === '化忌');
    if (!ji) break;

    chain.push(ji);

    // 自化就停止
    if (ji.isSelfTransform) break;

    // 找到化忌落入的宮，繼續追
    const nextPalace = allPalaces.find(p => p.name === ji.toPalace);
    if (!nextPalace) break;

    // 避免循環
    if (chain.some((c, idx) => idx < chain.length - 1 && c.fromPalace === nextPalace.name)) break;

    current = nextPalace;
  }

  return chain;
}

// ===== 偵測自化 =====
export function detectSelfTransforms(palaces: PalaceData[]): FlyingResult[] {
  const all = calculateAllFlyingMutagens(palaces);
  return all.filter(f => f.isSelfTransform);
}

// ===== 忌的壓力集中度 =====
// 用於標記需要多花心力經營的宮位，不直接斷疾病或災禍。
export function assessJiSeverity(palaceName: string, allFlying: FlyingResult[]): number {
  return allFlying.filter(
    f => f.mutagenType === '化忌' && f.toPalace === palaceName
  ).length;
}

export function getJiSeverityLabel(count: number): string {
  if (count <= 0) return '無忌';
  if (count === 1) return '單忌（牽掛較深，需付出額外心力）';
  if (count === 2) return '雙忌（壓力集中，建議重點關注此領域）';
  if (count === 3) return '三忌（高度敏感區域，需提前規劃應對策略）';
  return '四忌以上（核心挑戰區，建議尋求專業協助）';
}

// ===== 對宮表（固定）=====
const OPPOSITE_PALACE: Record<string, string> = {
  '命宮': '遷移', '遷移': '命宮',
  '兄弟': '僕役', '僕役': '兄弟',
  '夫妻': '官祿', '官祿': '夫妻',
  '子女': '田宅', '田宅': '子女',
  '財帛': '福德', '福德': '財帛',
  '疾厄': '父母', '父母': '疾厄',
};

export function getOppositePalace(name: string): string | undefined {
  return OPPOSITE_PALACE[name];
}

// 化忌沖對宮：化忌所在宮位自動沖對面
export function getJiClashTargets(allFlying: FlyingResult[]): Array<{ ji: FlyingResult; clashPalace: string }> {
  return allFlying
    .filter(f => f.mutagenType === '化忌')
    .map(f => ({
      ji: f,
      clashPalace: OPPOSITE_PALACE[f.toPalace] || '',
    }))
    .filter(x => x.clashPalace !== '');
}

// ===== 輔助：在所有宮位中找某顆星 =====
function findStarInPalaces(starName: string, palaces: PalaceData[]): PalaceData | undefined {
  for (const palace of palaces) {
    const allStars = [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars];
    if (allStars.some(s => s.name === starName)) {
      return palace;
    }
  }
  return undefined;
}
