/**
 * What: Pure scoring function and question definitions for Westley Croup Score.
 * How: Child calculator with 5 questions and different option ranges per question.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createWestleyCroupQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: 'Bevidsthedsniveau',
      options: [
        { text: 'Vågen (eller sovende)', value: 0 },
        { text: 'Desorienteret/forvirret', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: 'Cyanose',
      options: [
        { text: 'Ingen', value: 0 },
        { text: 'Ved ophidselse', value: 4 },
        { text: 'I hvile', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: 'Stridor',
      options: [
        { text: 'Ingen', value: 0 },
        { text: 'Ved ophidselse', value: 4 },
        { text: 'I hvile', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: 'Luftskifte (st.p.)',
      options: [
        { text: 'Normal', value: 0 },
        { text: 'Nedsat', value: 1 },
        { text: 'Udtalt nedsat', value: 2 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: 'Indtrækninger',
      options: [
        { text: 'Ingen', value: 0 },
        { text: 'Milde', value: 1 },
        { text: 'Moderate', value: 2 },
        { text: 'Svære', value: 3 }
      ],
      answer: 0
    }
  ]
}

export const westleyCroupConfig: CalculatorConfig = {
  name: 'Westley Croup Score',
  shortName: 'Westley Croup',
  defaultAge: 6,
  defaultGender: 'Dreng',
  minAge: 0,
  maxAge: 12,
  showCpr: false,
  questions: createWestleyCroupQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 2, interpretation: 'Mild pseudocroup ≤ 2', severity: 'normal' },
    { minScore: 3, maxScore: 7, interpretation: 'Moderat pseudocroup 3-7', severity: 'moderate' },
    { minScore: 8, maxScore: 20, interpretation: 'Svær pseudocroup ≥ 8', severity: 'severe' }
  ]
}

export function calculateWestleyCroup(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, westleyCroupConfig.thresholds)
}
