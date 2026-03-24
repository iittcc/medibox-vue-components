/**
 * What: Pure scoring function and question definitions for PUQE
 * (Pregnancy-Unique Quantification of Emesis and Nausea).
 * How: Note that PUQE option values start at 1 (not 0), so minimum score is 3.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createPuqeQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Hvor lang tid har du følt dig forkvalmet, i løbet af de sidste 24 timer?',
      options: [
        { text: 'Slet ikke', value: 1 },
        { text: '≤ 1 time', value: 2 },
        { text: '2-3 timer', value: 3 },
        { text: '4-6 timer', value: 4 },
        { text: '> 6 timer', value: 5 }
      ],
      answer: 1
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. Hvor mange gange har du kastet op, i løbet af de sidste 24 timer?',
      options: [
        { text: 'Ingen opkastninger', value: 1 },
        { text: '1-2 gange', value: 2 },
        { text: '3-4 gange', value: 3 },
        { text: '5-6 gange', value: 4 },
        { text: '≥ 7 gange', value: 5 }
      ],
      answer: 1
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. Har du haft opkastningsbevægelser (uden der kommer noget med op), i løbet af de sidste 24 timer?',
      options: [
        { text: 'Nej', value: 1 },
        { text: '1-2 gange', value: 2 },
        { text: '3-4 gange', value: 3 },
        { text: '5-6 gange', value: 4 },
        { text: '≥ 7 gange', value: 5 }
      ],
      answer: 1
    }
  ]
}

export const puqeConfig: CalculatorConfig = {
  name: 'PUQE Scoringsskema',
  description: '',
  shortName: 'PUQE',
  defaultAge: 28,
  defaultGender: 'Kvinde',
  minAge: 12,
  maxAge: 60,
  showCpr: false,
  questions: createPuqeQuestions(),
  thresholds: [
    { minScore: 3, maxScore: 6, interpretation: 'Mild graviditetskvalme (PUQE ≤ 6)', severity: 'normal' },
    { minScore: 7, maxScore: 12, interpretation: 'Moderat graviditetskvalme (PUQE 7-12)', severity: 'moderate' },
    { minScore: 13, maxScore: 15, interpretation: 'Svær graviditetskvalme (Hyperemesis Gravidarum) (PUQE ≥ 13)', severity: 'severe' }
  ]
}

export function calculatePuqe(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, puqeConfig.thresholds)
}
