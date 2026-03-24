/**
 * What: Pure scoring function and question definitions for the WHO-5
 * (WHO-5 Well-Being Index / Trivselsindex).
 * How: Exports config, question factory, and scoring function.
 * Score is raw sum × 4 (range 0-100).
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createWho5Questions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. I de sidste 2 uger har jeg været glad og i godt humør',
      options: [
        { text: 'Hele tiden', value: 5 },
        { text: 'Det mest af tiden', value: 4 },
        { text: 'Lidt mere end halvdelen af tiden', value: 3 },
        { text: 'Lidt mindre end halvdelen af tiden', value: 2 },
        { text: 'Lidt af tiden', value: 1 },
        { text: 'På intet tidspunkt', value: 0 }
      ],
      answer: 5
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. I de sidste 2 uger har jeg følt mig rolig of afslappet',
      options: [
        { text: 'Hele tiden', value: 5 },
        { text: 'Det mest af tiden', value: 4 },
        { text: 'Lidt mere end halvdelen af tiden', value: 3 },
        { text: 'Lidt mindre end halvdelen af tiden', value: 2 },
        { text: 'Lidt af tiden', value: 1 },
        { text: 'På intet tidspunkt', value: 0 }
      ],
      answer: 5
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. I de sidste 2 uger har jeg følt mig aktiv og energisk',
      options: [
        { text: 'Hele tiden', value: 5 },
        { text: 'Det mest af tiden', value: 4 },
        { text: 'Lidt mere end halvdelen af tiden', value: 3 },
        { text: 'Lidt mindre end halvdelen af tiden', value: 2 },
        { text: 'Lidt af tiden', value: 1 },
        { text: 'På intet tidspunkt', value: 0 }
      ],
      answer: 5
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '4. I de sidste 2 uger har jeg er vågnet frisk og udhvilet',
      options: [
        { text: 'Hele tiden', value: 5 },
        { text: 'Det mest af tiden', value: 4 },
        { text: 'Lidt mere end halvdelen af tiden', value: 3 },
        { text: 'Lidt mindre end halvdelen af tiden', value: 2 },
        { text: 'Lidt af tiden', value: 1 },
        { text: 'På intet tidspunkt', value: 0 }
      ],
      answer: 5
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '5. I de sidste 2 uger har min daglig været fyldt med ting der interesserer mig',
      options: [
        { text: 'Hele tiden', value: 5 },
        { text: 'Det mest af tiden', value: 4 },
        { text: 'Lidt mere end halvdelen af tiden', value: 3 },
        { text: 'Lidt mindre end halvdelen af tiden', value: 2 },
        { text: 'Lidt af tiden', value: 1 },
        { text: 'På intet tidspunkt', value: 0 }
      ],
      answer: 5
    }
  ]
}

// Why: WHO-5 final score = raw sum × 4. Thresholds are on the final 0-100 score.
export const who5Config: CalculatorConfig = {
  name: 'WHO-5 Trivselsindex',
  description: '',
  shortName: 'WHO-5',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 16,
  maxAge: 110,
  showCpr: false,
  questions: createWho5Questions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 35,
      interpretation: 'Der kan være stor risiko for depression eller stressbelastning.',
      severity: 'severe'
    },
    {
      minScore: 36,
      maxScore: 50,
      interpretation: 'Der kan være risiko for depression eller stressbelastning.',
      severity: 'moderate'
    },
    {
      minScore: 51,
      maxScore: 100,
      interpretation: 'Der er ikke umiddelbart risiko for depression eller stressbelastning.',
      severity: 'normal'
    }
  ]
}

// Why: The 3rd parameter (4) is the multiplier — WHO-5 raw sum × 4
export function calculateWho5(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, who5Config.thresholds, 4)
}
