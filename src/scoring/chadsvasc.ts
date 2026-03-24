/**
 * What: Pure scoring function and risk factor definitions for CHA₂DS₂-VA.
 * How: 6 risk factors modeled as Questions with SelectButton options.
 * Score is the sum of all answer values (0-8 range).
 *
 * Why: Migrating legacy jQuery checkbox calculator to Vue 3 architecture.
 * Gender (Sc) removed per updated clinical guidelines.
 * Age categories combined into single 3-option question to eliminate
 * mutual exclusion logic.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

/**
 * What: Annual thromboembolic risk rates per CHA₂DS₂-VA score.
 * How: Three-level lookup per Danish cardiology guidelines (cardio.dk/af).
 */
export const CHADSVASC_ANNUAL_RISK: Record<number, string> = {
  0: '0%',
  1: '1,3%'
}

export const CHADSVASC_ANNUAL_RISK_GTE2 = '≥2,2%'

export function createChadsvascQuestions(): Question[] {
  return [
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: 'C — Kronisk hjertesvigt',
      description: 'Symptomer/tegn på hjertesvigt (uanset LVEF, dvs. inkl. HFpEF, HFmrEF og HFrEF), el. asymptomatisk LVEF ≤40%',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: 'H — Hypertension',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: 'A₂ — Alder',
      options: [
        { text: 'Under 65', value: 0 },
        { text: '65-74 år', value: 1 },
        { text: '≥75 år', value: 2 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: 'D — Diabetes mellitus',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: 'S₂ — Apopleksi/TCI/Tromboembolisme',
      description: 'Tidligere apopleksi, TCI eller perifer emboli',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 2 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: 'V — Vaskulær sygdom',
      description: 'Myokardieinfarkt, perifer arteriel sygdom, aortaplaques',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    }
  ]
}

export const chadsvascConfig: CalculatorConfig = {
  name: 'CHA₂DS₂-VA Score',
  shortName: 'CHA₂DS₂-VA',
  defaultAge: 70,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createChadsvascQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 0,
      interpretation: 'Ingen antitrombotisk behandling.',
      severity: 'normal'
    },
    {
      minScore: 1,
      maxScore: 1,
      interpretation: 'AK-behandling bør overvejes (DOAK eller VKA).',
      severity: 'moderate'
    },
    {
      minScore: 2,
      maxScore: 8,
      interpretation: 'AK-behandling anbefales (DOAK eller VKA).',
      severity: 'severe'
    }
  ]
}

export function calculateChadsvasc(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, chadsvascConfig.thresholds)
}
