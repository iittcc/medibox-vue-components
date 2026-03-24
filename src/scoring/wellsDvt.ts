/**
 * What: Pure scoring function and risk factor definitions for Wells Score DVT.
 * How: 10 binary risk factors modeled as Questions with SelectButton options.
 * Score is the sum of all answer values (-2 to +9 range).
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
export const WELLS_DVT_SECTIONS = [
  { title: 'Disponerende faktorer', startIndex: 0 },
  { title: 'Symptomer', startIndex: 4 },
  { title: 'Kliniske tegn', startIndex: 5 },
  { title: 'Klinisk vurdering', startIndex: 9 }
]

/**
 * What: Clinical recommendations keyed by severity level.
 * How: Lookup by ScoreResult.severity to get the diagnostic action.
 */
export const WELLS_DVT_RECOMMENDATION: Record<string, string> = {
  'normal': 'Ved mistanke om DVT måles D-dimer. Ved positiv D-dimer henvises til ultralyd af vener.',
  'moderate': 'D-dimer måling nødvendig. Ved positiv D-dimer henvises til ultralyd af vener.',
  'severe': 'Henvis til ultralyd af vener. D-dimer måling ikke nødvendig.'
}

/**
 * What: Clinical disclaimers for Wells DVT interpretation.
 */
export const WELLS_DVT_CLINICAL_NOTES = [
  'Er Wells score lav, og er d-dimer negativ, kan DVT udelukkes.',
  'Der opfordres til forsigtighed ved graviditet eller klinisk mistanke om lungeemboli.',
  'Ved kendt kræftsygdom kan Wells score og neg. D-dimer IKKE udelukke DVT.'
]

export function createWellsDvtQuestions(): Question[] {
  return [
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '1 — Paralyse, parese eller immobilisation af underekstremitet',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '2 — Nyligt sengeleje >3 dage eller major kirurgi < 12 uger',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '3 — Aktiv cancersygdom (aktiv/palliativ behandling sidste 6 mdr.)',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '4 — Tidligere dokumenteret DVT',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '5 — Smerter langs dybe vener',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '6 — Ensidig hævelse i hele underekstremiteten',
      description: 'Omfang skal måles',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '7 — Ensidig hævelse i læggen > 3 cm',
      description: 'Sammenlignet med asymptomatisk side (måles 10 cm under tuberositas tibiae)',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '8 — Pittingødem i den aktuelle underekstremitet',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '9 — Dilatation af overfladiske vener (ikke varikøse)',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '10 — Alternativ diagnose mindst lige så sandsynlig',
      description: 'Erysipelas mv.',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: -2 }
      ],
      answer: 0
    }
  ]
}

export const wellsDvtConfig: CalculatorConfig = {
  name: 'Wells Score DVT',
  description: 'Klinisk vurdering af sandsynlighed for dyb venetrombose',
  shortName: 'Wells DVT',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createWellsDvtQuestions(),
  thresholds: [
    {
      minScore: -2,
      maxScore: 0,
      interpretation: 'Klinisk sandsynlighed for DVT er lav (3-5%).',
      severity: 'normal'
    },
    {
      minScore: 1,
      maxScore: 2,
      interpretation: 'Klinisk sandsynlighed for DVT er intermediær (15-20%).',
      severity: 'moderate'
    },
    {
      minScore: 3,
      maxScore: 9,
      interpretation: 'Klinisk sandsynlighed for DVT er høj (50-75%).',
      severity: 'severe'
    }
  ]
}

export function calculateWellsDvt(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, wellsDvtConfig.thresholds)
}
