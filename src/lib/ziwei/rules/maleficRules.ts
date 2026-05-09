// 煞星與主星交互規則
// 六煞 × 主星 = 格局變化

// ===== 煞星分組 =====
export const MALEFIC_GROUPS = {
  '刑剋型': ['擎羊', '陀羅'],   // 金屬性，主衝突阻滯
  '爆發型': ['火星', '鈴星'],   // 火屬性，主急暴爆發
  '空亡型': ['地空', '地劫'],   // 主落空損失
} as const;

// ===== 煞星詳細特性 =====
export interface MaleficProfile {
  name: string;
  element: string;
  yinYang: '陽' | '陰';
  nature: string;
  positive: string[];
  negative: string[];
  bestWith: string[];   // 五行相生的好搭配
  worstWith: string[];  // 五行相剋的壞搭配
}

export const MALEFIC_PROFILES: Record<string, MaleficProfile> = {
  '擎羊': {
    name: '擎羊',
    element: '金',
    yinYang: '陽',
    nature: '明刀——正面硬幹、挑明衝突',
    positive: ['執行力強', '果斷', '膽識', '抗壓', '突破力'],
    negative: ['衝動', '固執', '暴戾', '招刑傷官非'],
    bestWith: ['火星'],   // 陽金遇明火=烘爐成器
    worstWith: ['鈴星'],  // 陽金遇陰火=極端性格
  },
  '陀羅': {
    name: '陀羅',
    element: '金',
    yinYang: '陰',
    nature: '暗鬥——纏繞遲滯、慢性消耗',
    positive: ['耐力', '長期耕耘', '謹慎', '毅力'],
    negative: ['優柔寡斷', '拖延', '內心糾結', '暗算'],
    bestWith: ['鈴星'],   // 陰金遇陰火=陶熔冶煉
    worstWith: ['火星'],  // 陰金遇明火=破壞格局
  },
  '火星': {
    name: '火星',
    element: '火',
    yinYang: '陽',
    nature: '明火——瞬間爆發、可預見的衝擊',
    positive: ['膽識', '外向', '行動力', '爆發力'],
    negative: ['暴躁', '衝動', '持久力不足'],
    bestWith: ['擎羊'],
    worstWith: ['陀羅'],
  },
  '鈴星': {
    name: '鈴星',
    element: '火',
    yinYang: '陰',
    nature: '暗火——凌遲慢割、隱蔽的煎熬',
    positive: ['堅持', '盤算能力', '冷靜', '不輕易顯露'],
    negative: ['固執', '冷酷', '內在煎熬'],
    bestWith: ['陀羅'],
    worstWith: ['擎羊'],
  },
  '地空': {
    name: '地空',
    element: '火',
    yinYang: '陰',
    nature: '半空折翅——飛得越高摔得越重',
    positive: ['不畏挫折', '靈感佳', '哲學思維', '適合宗教藝術'],
    negative: ['揮霍', '不聚財', '弱化同宮吉星'],
    bestWith: [],
    worstWith: [],
  },
  '地劫': {
    name: '地劫',
    element: '火',
    yinYang: '陽',
    nature: '浪裡行舟——得意時遭逢大浪',
    positive: ['努力不懈', '獨立', '靈感'],
    negative: ['損失', '破敗', '不聚財'],
    bestWith: [],
    worstWith: [],
  },
};

// ===== 能制煞的主星（超過 2 顆煞星仍擋不住）=====
export const MALEFIC_TAMERS = ['紫微', '天府', '天同', '天梁', '破軍'];

// ===== 煞星 × 主星特殊格局 =====
export interface MaleficPattern {
  name: string;
  stars: string[];          // 需要的星
  condition?: string;       // 額外條件
  isAuspicious: boolean;
  description: string;
}

export const MALEFIC_PATTERNS: MaleficPattern[] = [
  // ----- 吉格 -----
  {
    name: '火貪格',
    stars: ['火星', '貪狼'],
    condition: '同宮坐命',
    isAuspicious: true,
    description: '暴發型格局。行動衝動迅速，看準機會就衝，短時間爆發性獲利。',
  },
  {
    name: '鈴貪格',
    stars: ['鈴星', '貪狼'],
    condition: '同宮坐命',
    isAuspicious: true,
    description: '比火貪更理性，善於規劃。先建名聲再利用名氣帶來財富。',
  },
  {
    name: '擎羊入廟格',
    stars: ['擎羊'],
    condition: '獨坐辰戌丑未命宮',
    isAuspicious: true,
    description: '四墓地節制凶性，保留威勢衝勁。執行力極強，抗壓性高。',
  },
  {
    name: '馬頭帶箭格',
    stars: ['貪狼', '擎羊'],
    condition: '午宮坐命，丙戊年生',
    isAuspicious: true,
    description: '武職貴顯。宜經商實業，遠走他方方能開運。早年辛苦，中晚年轉運。',
  },
  {
    name: '祿馬交馳格',
    stars: ['祿存', '天馬'],
    condition: '同宮或三方四正',
    isAuspicious: true,
    description: '財星遇驛馬。主財源廣進，適合商貿流通、外出求財。',
  },

  // ----- 凶格 -----
  {
    name: '羊陀夾忌格',
    stars: ['擎羊', '陀羅'],
    condition: '夾住化忌星',
    isAuspicious: false,
    description: '壓力密集的結構，容易同時面對多方面挑戰。但算計能力強，在商業環境反可轉化為優勢。',
  },
  {
    name: '羊陀夾命格',
    stars: ['擎羊', '陀羅'],
    condition: '夾住命宮',
    isAuspicious: false,
    description: '無法依靠家庭背景，須自力更生。',
  },
  {
    name: '火鈴夾命格',
    stars: ['火星', '鈴星'],
    condition: '夾住命宮',
    isAuspicious: false,
    description: '獨立性強但挑戰多，情緒容易兩極化。',
  },
  {
    name: '空劫夾命格',
    stars: ['地空', '地劫'],
    condition: '夾住命宮',
    isAuspicious: false,
    description: '挑戰型格局，物質層面波折大，但靈性層面可能有所成。',
  },
  {
    name: '刑忌夾印格',
    stars: ['天刑', '廉貞', '天相'],
    condition: '天刑+廉貞夾住天相',
    isAuspicious: false,
    description: '法律風險高，需注意官司是非。',
  },
  {
    name: '泛水桃花格',
    stars: ['貪狼'],
    condition: '亥或子宮坐命',
    isAuspicious: false,
    description: '水宮強化桃花，感情關係複雜。',
  },
  {
    name: '風流彩杖格',
    stars: ['貪狼', '擎羊'],
    condition: '子宮獨坐+擎羊或天刑同宮',
    isAuspicious: false,
    description: '感情慾望強烈，需留意因情感決策帶來的法律或人際風險。',
  },
];

// ===== 煞星 × 主星交互效果 =====
export interface MaleficInteraction {
  malefic: string;
  major: string;
  effect: string;
}

export const MALEFIC_INTERACTIONS: MaleficInteraction[] = [
  // 七殺
  { malefic: '擎羊', major: '七殺', effect: '行動力極強但衝突感重，容易正面對撞，需注意人際摩擦' },
  { malefic: '鈴星', major: '七殺', effect: '策略性強但手段偏激，表面和善內在較有算計' },
  { malefic: '火星', major: '七殺', effect: '積極進取、執行力堅強。更會擎羊尤佳' },

  // 廉貞
  { malefic: '擎羊', major: '廉貞', effect: '法律意識需特別加強，容易因衝動決策引發合規風險' },
  { malefic: '鈴星', major: '廉貞', effect: '內在壓力大，面臨抉擇時容易走極端路線' },
  { malefic: '火星', major: '廉貞', effect: '情緒波動劇烈，需特別關注心理健康和壓力管理' },

  // 破軍
  { malefic: '擎羊', major: '破軍', effect: '變動劇烈，身體和財務都需額外留意安全防護' },
  { malefic: '陀羅', major: '破軍', effect: '變動劇烈，反覆拖延中消耗資源，需設定止損點' },

  // 太陽
  { malefic: '擎羊', major: '太陽', effect: '廟旺時以光芒照射不畏煞星，落陷則大為不利' },
  { malefic: '陀羅', major: '太陽', effect: '廟旺時以光芒照射不畏煞星，落陷則大為不利' },

  // 天機
  { malefic: '擎羊', major: '天機', effect: '天機最怕煞忌交併，多學少精' },
  { malefic: '陀羅', major: '天機', effect: '天機最怕煞忌交併，多學少精' },

  // 天梁
  { malefic: '擎羊', major: '天梁', effect: '落陷時蔭星保護力減弱，容易因固執而損害自身形象' },
  { malefic: '火星', major: '天梁', effect: '火星+擎羊同會則蔭星結構被沖破，人際支持網容易瓦解' },

  // 紫微
  { malefic: '擎羊', major: '紫微', effect: '多遇困難，但帝星制煞，持之以恆可有成' },
  { malefic: '地空', major: '紫微', effect: '高瞻遠矚轉為目光短淺' },

  // 天府
  { malefic: '地空', major: '天府', effect: '精明求財轉為保守，大忌' },

  // 貪狼（吉格見 MALEFIC_PATTERNS）
  { malefic: '火星', major: '貪狼', effect: '火貪格，主橫發暴富' },
  { malefic: '鈴星', major: '貪狼', effect: '鈴貪格，主突進有名' },
];
