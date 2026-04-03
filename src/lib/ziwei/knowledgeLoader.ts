/**
 * Server-side knowledge loader
 * Reads markdown knowledge base files and extracts relevant sections
 * This runs ONLY on the server (in API routes), not in client bundle
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/lib/ziwei/data');

let majorStarCache: string | null = null;
let patternCache: string | null = null;
let palaceCache: string | null = null;
let mutagenCache: string | null = null;
let minorStarCache: string | null = null;
let ancientBook1Cache: string | null = null;
let ancientBook2Cache: string | null = null;

function loadFile(filename: string): string {
  try {
    return fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
  } catch {
    return '';
  }
}

function getMajorStarData(): string {
  if (!majorStarCache) majorStarCache = loadFile('major-star.md');
  return majorStarCache;
}

function getPatternData(): string {
  if (!patternCache) patternCache = loadFile('pattern.md');
  return patternCache;
}

function getPalaceData(): string {
  if (!palaceCache) palaceCache = loadFile('palace.md');
  return palaceCache;
}

function getMutagenData(): string {
  if (!mutagenCache) mutagenCache = loadFile('mutagen.md');
  return mutagenCache;
}

function getMinorStarData(): string {
  if (!minorStarCache) minorStarCache = loadFile('minor-star.md');
  return minorStarCache;
}

function getAncientBook1(): string {
  if (!ancientBook1Cache) ancientBook1Cache = loadFile('ancientBook-1.md');
  return ancientBook1Cache;
}

function getAncientBook2(): string {
  if (!ancientBook2Cache) ancientBook2Cache = loadFile('ancientBook-2.md');
  return ancientBook2Cache;
}

/**
 * Extract a section about a specific star from the major-star.md
 * Sections start with "## 星名" and end at the next "## "
 */
export function extractStarSection(starName: string): string {
  const data = getMajorStarData();
  // Find section start: "## 紫微星" or "#### 紫微天府"
  const patterns = [
    new RegExp(`## ${starName}星[^#]*?(?=\\n## |$)`, 's'),
    new RegExp(`## ${starName}[^#]*?(?=\\n## |$)`, 's'),
  ];

  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match) {
      // Clean up Vue/HTML tags
      return match[0]
        .replace(/<[^>]+>/g, '')
        .replace(/:::.*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 3000); // Limit to 3000 chars per star
    }
  }
  return '';
}

/**
 * Extract double-star combination section
 */
export function extractComboSection(star1: string, star2: string): string {
  const data = getMajorStarData();
  // Try both orders
  const patterns = [
    new RegExp(`#### ${star1}${star2}[\\s\\S]*?(?=\\n#### |\\n## |$)`, 's'),
    new RegExp(`#### ${star2}${star1}[\\s\\S]*?(?=\\n#### |\\n## |$)`, 's'),
  ];

  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match) {
      return match[0]
        .replace(/<[^>]+>/g, '')
        .replace(/:::.*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 2000);
    }
  }
  return '';
}

/**
 * Extract palace meaning section
 */
export function extractPalaceSection(palaceName: string): string {
  const data = getPalaceData();
  const normalized = palaceName.replace(/宮$/, '');
  const pattern = new RegExp(`## ${normalized}宮[\\s\\S]*?(?=\\n## |$)`, 's');
  const match = data.match(pattern);
  if (match) {
    return match[0]
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 2000);
  }
  return '';
}

/**
 * Extract mutagen (四化) explanation
 */
export function extractMutagenInfo(): string {
  const data = getMutagenData();
  return data
    .replace(/<[^>]+>/g, '')
    .replace(/---[\s\S]*?---/, '')
    .replace(/:::.*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 4000);
}

/**
 * Extract minor star info
 */
export function extractMinorStarInfo(): string {
  const data = getMinorStarData();
  return data
    .replace(/<[^>]+>/g, '')
    .replace(/---[\s\S]*?---/, '')
    .replace(/:::.*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 5000);
}

/**
 * Detect patterns (格局) from chart and return matching pattern descriptions
 */
export function extractMatchingPatterns(starNames: string[]): string {
  const data = getPatternData();
  const matches: string[] = [];

  // Find pattern sections that mention any of the stars in the chart
  const sections = data.split(/\n## /).filter(Boolean);
  for (const section of sections) {
    const title = section.split('\n')[0] || '';
    // Check if this pattern mentions stars in the chart
    const mentionsStars = starNames.some(star => section.includes(star));
    if (mentionsStars && title.length > 1) {
      const cleaned = section
        .replace(/<[^>]+>/g, '')
        .replace(/:::.*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 1500);
      matches.push(cleaned);
    }
  }

  return matches.slice(0, 10).join('\n\n---\n\n'); // Top 10 matching patterns
}

/**
 * Extract relevant ancient book passages for given stars
 */
export function extractAncientPassages(starNames: string[]): string {
  const data1 = getAncientBook1();
  const data2 = getAncientBook2();
  const combined = data1 + '\n' + data2;

  const passages: string[] = [];
  const lines = combined.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (starNames.some(star => line.includes(star)) && line.trim().length > 10) {
      // Grab surrounding context (up to 5 lines)
      const start = Math.max(0, i - 1);
      const end = Math.min(lines.length, i + 4);
      const passage = lines.slice(start, end).join('\n').trim();
      if (passage.length > 20 && !passages.includes(passage)) {
        passages.push(passage);
      }
    }
  }

  return passages.slice(0, 15).join('\n\n').substring(0, 5000);
}

/**
 * Build comprehensive knowledge context for a chart
 * This is the main function called from the API route
 */
export function buildKnowledgeContext(
  majorStarNames: string[],
  comboStars: [string, string][],
  palaceNames: string[],
  allStarNames: string[],
): string {
  const sections: string[] = [];

  // 1. Major star personality descriptions
  sections.push('===== 主星特質（來自 iztro-docs 知識庫）=====');
  for (const star of majorStarNames) {
    const info = extractStarSection(star);
    if (info) {
      sections.push(info.substring(0, 2000));
    }
  }

  // 2. Double-star combinations
  if (comboStars.length > 0) {
    sections.push('\n===== 雙星組合解釋 =====');
    for (const [s1, s2] of comboStars) {
      const combo = extractComboSection(s1, s2);
      if (combo) {
        sections.push(combo);
      }
    }
  }

  // 3. Key palace explanations (命宮, 官祿, 財帛, 夫妻)
  sections.push('\n===== 重要宮位解釋 =====');
  const keyPalaces = ['命', '官祿', '財帛', '夫妻', '疾厄', '福德'];
  for (const pName of keyPalaces) {
    const info = extractPalaceSection(pName);
    if (info) {
      sections.push(info.substring(0, 1000));
    }
  }

  // 4. Mutagen info
  sections.push('\n===== 四化原理 =====');
  sections.push(extractMutagenInfo().substring(0, 2000));

  // 5. Matching patterns
  sections.push('\n===== 可能成立的格局（根據命盤星曜匹配）=====');
  sections.push(extractMatchingPatterns(allStarNames).substring(0, 5000));

  // 6. Ancient book passages
  sections.push('\n===== 古籍相關段落 =====');
  sections.push(extractAncientPassages(majorStarNames).substring(0, 3000));

  return sections.join('\n\n');
}
