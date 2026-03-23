/**
 * What: Pure scoring function and question definitions for Glasgow Coma Scale (GCS).
 * How: 3 questions with different option counts. Minimum score is 3 (each starts at 1).
 * Defaults to best response (highest values).
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createGcsQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: 'Øjenåbning',
      options: [
        { text: 'Spontant', value: 4 },
        { text: 'På tiltale', value: 3 },
        { text: 'På smertestimulation', value: 2 },
        { text: 'Ingen', value: 1 }
      ],
      answer: 4
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: 'Verbalt responds',
      options: [
        { text: 'Orienteret', value: 5 },
        { text: 'Forvirret', value: 4 },
        { text: 'Usammenhængede ord', value: 3 },
        { text: 'Uforståelige lyde', value: 2 },
        { text: 'Ingen', value: 1 }
      ],
      answer: 5
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: 'Bedste motoriske responds',
      options: [
        { text: 'Følger opfordringer', value: 6 },
        { text: 'Målrettet reaktion', value: 5 },
        { text: 'Afværger', value: 4 },
        { text: 'Normal fleksion', value: 3 },
        { text: 'Abnorm fleksion', value: 2 },
        { text: 'Ekstension', value: 1 }
      ],
      answer: 6
    }
  ]
}

export const gcsConfig: CalculatorConfig = {
  name: 'Glasgow Coma Scale',
  shortName: 'GCS',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 5,
  maxAge: 110,
  showCpr: false,
  questions: createGcsQuestions(),
  thresholds: [
    { minScore: 3, maxScore: 8, interpretation: 'Svær bevidsthedssvækkelse (Coma)', severity: 'severe' },
    { minScore: 9, maxScore: 12, interpretation: 'Middelsvær bevidsthedssvækkelse', severity: 'moderate' },
    { minScore: 13, maxScore: 14, interpretation: 'Lettere bevidsthedssvækkelse', severity: 'mild' },
    { minScore: 15, maxScore: 15, interpretation: 'Fuld bevidsthed', severity: 'normal' }
  ]
}

export function calculateGcs(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, gcsConfig.thresholds)
}
