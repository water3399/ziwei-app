export { STAR_GRADES, isRelevantStar, getStarGrade } from './starLevels';
export type { StarGrade } from './starLevels';

export { STAR_TAGS, getStarTags } from './starTags';
export type { EnergyTag } from './starTags';

export { RESONANCE_TABLE, getResonanceByMinor, getResonanceByMajor } from './starResonance';
export type { ResonancePair } from './starResonance';

export {
  MALEFIC_GROUPS, MALEFIC_PROFILES, MALEFIC_TAMERS,
  MALEFIC_PATTERNS, MALEFIC_INTERACTIONS,
} from './maleficRules';
export type { MaleficProfile, MaleficPattern, MaleficInteraction } from './maleficRules';

export { generateSignals, formatSignalsForContext } from './advancedSignals';
export type { AdvancedSignal, Confidence, SignalType } from './advancedSignals';

export {
  SIHUA_TABLE,
  calculateFlyingMutagen, calculateAllFlyingMutagens,
  traceJiChain, detectSelfTransforms,
  assessJiSeverity, getJiSeverityLabel,
  getOppositePalace, getJiClashTargets,
} from './flyingMutagen';
export type { FlyingResult, MutagenType } from './flyingMutagen';
