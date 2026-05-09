// 同氣對應表：小星 → 主星「大哥」
// 核心概念：小星是主星的同義詞，同宮或對宮出現時，主星效果 double
//
// 資料來源：公開資料交叉比對 + 紫微老師口述
// ⚠️ 標記 confirmed 的是老師明確提到的，其餘待老師校正

export interface ResonancePair {
  minor: string;       // 小星（小弟）
  major: string;       // 主星（大哥）
  effect: string;      // 同氣加強的效果描述
  confirmed: boolean;  // 是否經老師確認
}

export const RESONANCE_TABLE: ResonancePair[] = [
  // ===== 老師明確提到 =====
  { minor: '天才', major: '天機', effect: '智慧、靈活加倍，思維更敏捷', confirmed: true },
  { minor: '破碎', major: '破軍', effect: '破壞、動盪加倍，變動更劇烈', confirmed: true },

  // ===== 高確信度（多來源交叉確認）=====
  { minor: '天壽', major: '天梁', effect: '蔭星加倍，逢凶化吉力更強', confirmed: false },
  { minor: '龍池', major: '天府', effect: '庫藏貴氣加倍，財富更穩固', confirmed: false },
  { minor: '鳳閣', major: '天相', effect: '典雅印星加倍，行政能力更強', confirmed: false },
  { minor: '恩光', major: '太陽', effect: '光明榮耀加倍，公開貴氣更顯', confirmed: false },
  { minor: '天貴', major: '太陰', effect: '隱性貴氣加倍，科名運更強', confirmed: false },
  { minor: '三台', major: '太陽', effect: '位階名聲加倍（經左輔）', confirmed: false },
  { minor: '八座', major: '太陰', effect: '位階財富加倍（經右弼）', confirmed: false },
  { minor: '天官', major: '天梁', effect: '權威正義加倍，官運更旺', confirmed: false },
  { minor: '天福', major: '天同', effect: '福氣安逸加倍', confirmed: false },
  { minor: '天巫', major: '天梁', effect: '靈性庇蔭加倍，宗教緣更深', confirmed: false },
  { minor: '解神', major: '天梁', effect: '化解災厄能力加倍', confirmed: false },
  { minor: '台輔', major: '左輔', effect: '直接輔助力加倍', confirmed: false },
  { minor: '封誥', major: '右弼', effect: '幕後輔助力加倍', confirmed: false },

  // ===== 桃花系 =====
  { minor: '天姚', major: '廉貞', effect: '感官桃花加倍，慾望更強', confirmed: false },
  { minor: '咸池', major: '貪狼', effect: '肉慾桃花加倍，原始吸引力更強', confirmed: false },
  { minor: '紅鸞', major: '貪狼', effect: '婚姻桃花加倍，異性緣更旺', confirmed: false },
  { minor: '天喜', major: '貪狼', effect: '喜慶浪漫加倍', confirmed: false },

  // ===== 刑傷/孤獨系 =====
  { minor: '天刑', major: '廉貞', effect: '刑罰紀律加倍，官非風險增', confirmed: false },
  { minor: '天刑', major: '七殺', effect: '將星殺氣加倍，軍警法律緣深', confirmed: false },
  { minor: '華蓋', major: '天梁', effect: '宗教孤獨傾向加倍', confirmed: false },
  { minor: '天哭', major: '巨門', effect: '暗黑悲觀加倍', confirmed: false },
  { minor: '天虛', major: '太陰', effect: '空虛感傷加倍', confirmed: false },
  { minor: '陰煞', major: '巨門', effect: '暗黑猜忌加倍', confirmed: false },
  { minor: '孤辰', major: '天梁', effect: '孤高出世傾向加倍', confirmed: false },
  { minor: '寡宿', major: '天機', effect: '離群哲思傾向加倍', confirmed: false },

  // ===== 其他 =====
  { minor: '天月', major: '太陰', effect: '月系陰性能量加倍，慢性病風險增', confirmed: false },
  { minor: '天廚', major: '天府', effect: '食祿物質豐裕加倍', confirmed: false },
  { minor: '蜚廉', major: '七殺', effect: '攻擊破壞力加倍', confirmed: false },
  { minor: '天馬', major: '天機', effect: '驛動不安定加倍', confirmed: false },
  { minor: '天空', major: '天機', effect: '抽象空想加倍，可能流於不切實際', confirmed: false },
];

// 快速查詢：給一顆小星，找到它的大哥
const _minorToMajor = new Map<string, ResonancePair[]>();
for (const pair of RESONANCE_TABLE) {
  const existing = _minorToMajor.get(pair.minor) || [];
  existing.push(pair);
  _minorToMajor.set(pair.minor, existing);
}

export function getResonanceByMinor(minorName: string): ResonancePair[] {
  return _minorToMajor.get(minorName) || [];
}

// 快速查詢：給一顆主星，找到它所有的小弟
const _majorToMinors = new Map<string, ResonancePair[]>();
for (const pair of RESONANCE_TABLE) {
  const existing = _majorToMinors.get(pair.major) || [];
  existing.push(pair);
  _majorToMinors.set(pair.major, existing);
}

export function getResonanceByMajor(majorName: string): ResonancePair[] {
  return _majorToMinors.get(majorName) || [];
}
