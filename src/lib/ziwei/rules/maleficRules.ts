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
  // ===== 紫微 =====
  { malefic: '擎羊', major: '紫微', effect: '多遇困難，但帝星制煞，持之以恆可有成' },
  { malefic: '陀羅', major: '紫微', effect: '內心糾結但外表穩重，做事容易繞遠路' },
  { malefic: '火星', major: '紫微', effect: '帝星遇明火，行動力增強但脾氣加大' },
  { malefic: '鈴星', major: '紫微', effect: '內在焦慮感增加，外表不易察覺' },
  { malefic: '地空', major: '紫微', effect: '高瞻遠矚轉為目光短淺' },
  { malefic: '地劫', major: '紫微', effect: '權威感受損，容易在關鍵時刻失去資源支持' },

  // ===== 天機 =====
  { malefic: '擎羊', major: '天機', effect: '天機最怕煞忌交併，思緒混亂、多學少精' },
  { malefic: '陀羅', major: '天機', effect: '思慮過度、鑽牛角尖，決策困難' },
  { malefic: '火星', major: '天機', effect: '聰明但急躁，容易因衝動判斷失誤' },
  { malefic: '鈴星', major: '天機', effect: '內心計較但不表露，容易積壓焦慮' },

  // ===== 太陽 =====
  { malefic: '擎羊', major: '太陽', effect: '廟旺時光芒照射不畏煞星；落陷則付出無回報' },
  { malefic: '陀羅', major: '太陽', effect: '廟旺時尚可，落陷則做事拖延、光芒受阻' },
  { malefic: '火星', major: '太陽', effect: '熱情加倍但消耗也加倍，容易過度燃燒自己' },

  // ===== 武曲 =====
  { malefic: '擎羊', major: '武曲', effect: '財星遇刀，理財果斷但容易因衝動導致金錢糾紛' },
  { malefic: '陀羅', major: '武曲', effect: '賺錢辛苦、進展緩慢，但毅力強' },
  { malefic: '火星', major: '武曲', effect: '快速決斷的財務能力，但風險意識不足' },
  { malefic: '地空', major: '武曲', effect: '財星落空，理財能力打折' },
  { malefic: '地劫', major: '武曲', effect: '財來財去、難以積累' },

  // ===== 天同 =====
  { malefic: '擎羊', major: '天同', effect: '福星遇煞，安逸被打破，反而激發上進心' },
  { malefic: '火星', major: '天同', effect: '懶散性格被火星激活，行動力提升但內心矛盾' },

  // ===== 廉貞 =====
  { malefic: '擎羊', major: '廉貞', effect: '法律意識需特別加強，容易因衝動決策引發合規風險' },
  { malefic: '陀羅', major: '廉貞', effect: '內心糾結感情問題，容易陷入不健康的關係循環' },
  { malefic: '鈴星', major: '廉貞', effect: '內在壓力大，面臨抉擇時容易走極端路線' },
  { malefic: '火星', major: '廉貞', effect: '情緒波動劇烈，需特別關注心理健康和壓力管理' },

  // ===== 天府 =====
  { malefic: '地空', major: '天府', effect: '財庫落空，精明求財轉為保守，穩定感下降' },
  { malefic: '地劫', major: '天府', effect: '財庫被劫，積蓄難守，需多元配置資產' },

  // ===== 太陰 =====
  { malefic: '擎羊', major: '太陰', effect: '感性與剛硬衝突，情緒容易兩極化' },
  { malefic: '陀羅', major: '太陰', effect: '多愁善感加重，容易反覆糾結於感情問題' },
  { malefic: '火星', major: '太陰', effect: '內在焦慮外化，情緒爆發點低' },
  { malefic: '地空', major: '太陰', effect: '田產、母親緣分受影響，置產需謹慎' },

  // ===== 貪狼 =====
  { malefic: '火星', major: '貪狼', effect: '火貪格，主橫發暴富（需同宮才算正格）' },
  { malefic: '鈴星', major: '貪狼', effect: '鈴貪格，先有名再有利（需同宮才算正格）' },
  { malefic: '擎羊', major: '貪狼', effect: '慾望加衝動，感情和投資都容易衝過頭' },
  { malefic: '陀羅', major: '貪狼', effect: '慾望被壓抑但不會消失，容易暗中發展' },

  // ===== 巨門 =====
  { malefic: '擎羊', major: '巨門', effect: '口舌加刀鋒，言辭犀利但容易傷人傷己' },
  { malefic: '陀羅', major: '巨門', effect: '暗星遇阻滯，猜疑心加重，人際關係更吃力' },
  { malefic: '火星', major: '巨門', effect: '急躁+口舌，容易因衝動發言引發衝突' },

  // ===== 天相 =====
  { malefic: '擎羊', major: '天相', effect: '印星受損，輔佐能力打折，容易被人利用' },
  { malefic: '地空', major: '天相', effect: '印星落空，得到的承諾容易落空' },

  // ===== 天梁 =====
  { malefic: '擎羊', major: '天梁', effect: '落陷時蔭星保護力減弱，容易因固執而損害自身形象' },
  { malefic: '陀羅', major: '天梁', effect: '逢凶化吉的過程更加曲折漫長' },
  { malefic: '火星', major: '天梁', effect: '火星+擎羊同會則蔭星結構被沖破，人際支持網容易瓦解' },

  // ===== 七殺 =====
  { malefic: '擎羊', major: '七殺', effect: '行動力極強但衝突感重，容易正面對撞，需注意人際摩擦' },
  { malefic: '陀羅', major: '七殺', effect: '殺氣被壓抑，決斷力下降但心機加重' },
  { malefic: '鈴星', major: '七殺', effect: '策略性強但手段偏激，表面和善內在較有算計' },
  { malefic: '火星', major: '七殺', effect: '積極進取、執行力堅強，行動派中的行動派' },

  // ===== 破軍 =====
  { malefic: '擎羊', major: '破軍', effect: '變動劇烈，身體和財務都需額外留意安全防護' },
  { malefic: '陀羅', major: '破軍', effect: '變動劇烈，反覆拖延中消耗資源，需設定止損點' },
  { malefic: '火星', major: '破軍', effect: '破壞力加爆發力，改革徹底但善後困難' },
  { malefic: '鈴星', major: '破軍', effect: '暗中醞釀的變革，表面平靜底下暗流洶湧' },
];
