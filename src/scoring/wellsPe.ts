/**
 * What: Pure scoring function and risk factor definitions for Wells Score PE (lungeemboli).
 * How: 7 risk factors modeled as Questions with SelectButton options.
 * Score is the sum of all answer values (0 to 12.5 range).
 * Some factors have decimal point values (1.5, 3).
 *
 * Why: Migrating legacy jQuery checkbox calculator to Vue 3 architecture.
 * Clinical content preserved exactly from legacy implementation.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

/**
 * What: Section groupings for clinical display.
 * How: Each section marks the starting question index for rendering section headers.
 */
export const WELLS_PE_SECTIONS = [
  { title: 'Prædisponerende faktorer', startIndex: 0 },
  { title: 'Symptomer', startIndex: 3 },
  { title: 'Kliniske tegn', startIndex: 4 },
  { title: 'Klinisk vurdering', startIndex: 6 }
]

/**
 * What: Clinical recommendations keyed by severity level.
 * How: Lookup by ScoreResult.severity to get the diagnostic action.
 */
export const WELLS_PE_RECOMMENDATION: Record<string, string> = {
  'normal': 'Ved mistanke om lungeemboli måles D-dimer. Ved positiv D-dimer henvises til billeddiagnostisk undersøgelse.',
  'moderate': 'D-dimer måling nødvendig. Ved positiv D-dimer henvises til billeddiagnostisk undersøgelse.',
  'severe': 'Henvis til billeddiagnostisk undersøgelse. D-dimer måling ikke nødvendig.'
}

export function createWellsPeQuestions(): Question[] {
  return [
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '1 — Tidligere DVT eller LE',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1.5 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '2 — Sengeleje > 3 dage eller kirurgisk indgreb sidste 4 uger',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1.5 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '3 — Aktiv malignitet (behandling sidste 6 mdr.)',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '4 — Hæmoptyse',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '5 — Hjertefrekvens > 100/min',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1.5 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '6 — Kliniske tegn på DVT',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 3 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '7 — LE mere sandsynlig end alternative diagnoser',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 3 }
      ],
      answer: 0
    }
  ]
}

export const wellsPeConfig: CalculatorConfig = {
  name: 'Wells Score Lungeemboli',
  description: 'Klinisk vurdering af sandsynlighed for lungeemboli',
  shortName: 'Wells LE',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createWellsPeQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 1.5,
      interpretation: 'Klinisk sandsynlighed for lungeemboli er lav.',
      severity: 'normal'
    },
    {
      minScore: 2,
      maxScore: 5.5,
      interpretation: 'Klinisk sandsynlighed for lungeemboli er moderat.',
      severity: 'moderate'
    },
    {
      minScore: 6,
      maxScore: 12.5,
      interpretation: 'Klinisk sandsynlighed for lungeemboli er høj.',
      severity: 'severe'
    }
  ]
}

export function calculateWellsPe(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, wellsPeConfig.thresholds)
}
