/**
 * What: Pure scoring function and symptom definitions for LRTI
 * (Lower Respiratory Tract Infection) symptom checklist.
 * How: 8 boolean symptoms modeled as Questions with binary options (Ja=1, Nej=0).
 * Score is the count of symptoms present.
 *
 * Why: The legacy LRTIScore.vue was broken (scoring never executed, results
 * displayed "Westley Croup Score" due to copy-paste error). This implementation
 * provides correct scoring with the standard architecture.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createLrtiQuestions(): Question[] {
  return [
    {
      type: 'Toggle',
      bg: '--p-primary-100',
      text: 'Hoste (Tør eller produktiv)',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-50',
      text: 'Træthed',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-100',
      text: 'Kulderystelser',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-50',
      text: 'Vejrtrækningsbesvær',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-100',
      text: 'Smerter ved inspiration',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-50',
      text: 'Konfusion',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-100',
      text: 'Alment påvirket',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    },
    {
      type: 'Toggle',
      bg: '--p-primary-50',
      text: 'Dæmpning ved perkussion',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: 0
    }
  ]
}

export const lrtiConfig: CalculatorConfig = {
  name: 'LRTI Symptomtjekliste',
  shortName: 'LRTI',
  defaultAge: 6,
  defaultGender: 'Dreng',
  minAge: 0,
  maxAge: 12,
  showCpr: false,
  questions: createLrtiQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 0, interpretation: 'Ingen symptomer identificeret.', severity: 'normal' },
    { minScore: 1, maxScore: 3, interpretation: 'Få symptomer identificeret.', severity: 'mild' },
    { minScore: 4, maxScore: 6, interpretation: 'Flere symptomer identificeret.', severity: 'moderate' },
    { minScore: 7, maxScore: 8, interpretation: 'Mange symptomer identificeret.', severity: 'severe' }
  ]
}

export function calculateLrti(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, lrtiConfig.thresholds)
}
