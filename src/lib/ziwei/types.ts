// ====== Birth Input ======
export type Gender = '男' | '女';
export type CalendarType = 'solar' | 'lunar';

export const SHICHEN_LIST = [
  { label: '子時（早子）', value: 0, range: '00:00–01:00' },
  { label: '丑時', value: 1, range: '01:00–03:00' },
  { label: '寅時', value: 2, range: '03:00–05:00' },
  { label: '卯時', value: 3, range: '05:00–07:00' },
  { label: '辰時', value: 4, range: '07:00–09:00' },
  { label: '巳時', value: 5, range: '09:00–11:00' },
  { label: '午時', value: 6, range: '11:00–13:00' },
  { label: '未時', value: 7, range: '13:00–15:00' },
  { label: '申時', value: 8, range: '15:00–17:00' },
  { label: '酉時', value: 9, range: '17:00–19:00' },
  { label: '戌時', value: 10, range: '19:00–21:00' },
  { label: '亥時', value: 11, range: '21:00–23:00' },
  { label: '子時（晚子）', value: 12, range: '23:00–00:00' },
] as const;

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number; // 0-12, maps to SHICHEN_LIST.value
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth: boolean;
}

// ====== Star & Palace ======
export type StarBrightness = '廟' | '旺' | '得' | '利' | '平' | '不' | '陷';
export type Mutagen = '祿' | '權' | '科' | '忌';

export interface StarInfo {
  name: string;
  type: 'major' | 'soft' | 'adjective'; // iztro uses 'soft' for minor
  brightness?: string;
  mutagen?: string;
}

export type PalaceName =
  | '命宮' | '兄弟' | '夫妻' | '子女'
  | '財帛' | '疾厄' | '遷移' | '僕役'
  | '官祿' | '田宅' | '福德' | '父母';

export interface DecadalRange {
  range: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
}

export interface PalaceData {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: StarInfo[];
  minorStars: StarInfo[];
  adjectiveStars: StarInfo[];
  changsheng12: string;   // 長生十二宮
  boshi12: string;        // 博士十二神
  jiangqian12: string;    // 將前十二神
  suiqian12: string;      // 歲前十二神
  isBodyPalace: boolean;  // 身宮
  decadal: DecadalRange | null;  // 大限年齡範圍
  ages: number[];         // 小限年齡
  index: number;
}

// ====== Chart Data ======
export interface PeriodInfo {
  index: number;
  heavenlyStem: string;
  earthlyBranch: string;
}

export interface ChartData {
  birthData: BirthData;
  fiveElementsClass: string;
  soul: string;       // 命主
  body: string;       // 身主
  sign: string;       // 星座
  zodiac: string;     // 生肖
  chineseDate: string; // 四柱
  lunarDate: string;   // 農曆日期
  time: string;        // 時辰
  timeRange: string;   // 時間範圍
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  palaces: PalaceData[];
  // 四化 summary
  mutagenStars: { starName: string; mutagen: string; palaceName: string }[];
  // 大限/流年
  currentDecadal: PeriodInfo | null;
  currentYearly: PeriodInfo | null;
}

// ====== Analysis State (wizard) ======
export interface AnalysisState {
  step: 1 | 2 | 3;
  birthData: BirthData;
  chartData: ChartData | null;
  chartError: string | null;
  generating: boolean;
  analyzing: boolean;
  reportMarkdown: string | null;
  reportId: string | null;
  analysisError: string | null;
}

export type AnalysisAction =
  | { type: 'UPDATE_BIRTH'; data: Partial<BirthData> }
  | { type: 'GENERATE_CHART_START' }
  | { type: 'GENERATE_CHART_SUCCESS'; chartData: ChartData }
  | { type: 'GENERATE_CHART_ERROR'; error: string }
  | { type: 'SET_STEP'; step: 1 | 2 | 3 }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_SUCCESS'; markdown: string; id: string }
  | { type: 'ANALYZE_ERROR'; error: string }
  | { type: 'RESET' };

// ====== Stored Report ======
export interface StoredReport {
  id: string;
  createdAt: string;
  birthData: BirthData;
  chartData: ChartData;
  markdown: string;
}
