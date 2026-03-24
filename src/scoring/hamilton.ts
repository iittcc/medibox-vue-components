/**
 * What: Pure scoring function for Hamilton Depression Rating Scale.
 * How: 17 items with varying scales (0-2 or 0-4). Supports HAM-17 (full)
 * and HAM-6 (6-item subset: items 1,2,7,8,10,13).
 *
 * Why: Semi-structured clinical interview scale for depression severity.
 * Source: Sundhedsstyrelsen 2007, Per Bech & Niels-Anton Rasmussen 1998.
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

/**
 * What: HAM-6 subset indices (0-indexed into the 17-item array).
 * Items: 1 (idx 0), 2 (idx 1), 7 (idx 6), 8 (idx 7), 10 (idx 9), 13 (idx 12).
 */
export const HAM6_INDICES = [0, 1, 6, 7, 9, 12]

export function createHamiltonQuestions(): Question[] {
  return [
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '1. Nedsat stemningsleje',
      description: 'Tristhed, nedtrykthed, modløshed, hjælpeløshed, håbløshed',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Altdominerende', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '2. Skyldfølelse og selvbebrejdelser',
      description: 'Nedsat selvvurdering, manglende selvtillid, skyldfølelse',
      options: [
        { text: 'Vage', value: 1 },
        { text: 'Tydelige', value: 2 },
        { text: 'Plagsomme', value: 3 },
        { text: 'Med vrangforestillinger', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '3. Suicidale impulser',
      options: [
        { text: 'Livslede', value: 1 },
        { text: 'Dødsønsker', value: 2 },
        { text: 'Usikre planer', value: 3 },
        { text: 'Sikre planer', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '4. Indsovningsbesvær',
      options: [
        { text: 'Lejlighedsvist', value: 1 },
        { text: 'Regelmæssigt', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '5. Afbrudt søvn',
      options: [
        { text: 'Lejlighedsvist', value: 1 },
        { text: 'Regelmæssigt', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '6. Tidlig morgenopvågning',
      options: [
        { text: 'Lejlighedsvist', value: 1 },
        { text: 'Regelmæssigt', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '7. Arbejde og interesser',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Inaktivitet', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '8. Psykomotorisk hæmning',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Tydelig', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Stuporlignende', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '9. Psykomotorisk agitation',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Svær, konstant uro', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '10. Angst, psykiske komponenter',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Altdominerende', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '11. Angst, somatiske komponenter',
      description: 'Hjertebanken, sved, tremor, mundtørhed, åndedrætsbesvær mv.',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Udtalt', value: 3 },
        { text: 'Altdominerende', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '12. Gastrointestinale symptomer',
      options: [
        { text: 'Lettere', value: 1 },
        { text: 'Sværere', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '13. Generelle somatiske symptomer',
      description: 'Træthed, udmattelse, muskelsmerter',
      options: [
        { text: 'Lettere', value: 1 },
        { text: 'Sværere', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '14. Seksuelle forstyrrelser',
      options: [
        { text: 'Lettere nedsat', value: 1 },
        { text: 'Sværere nedsat', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '15. Hypokondri (somatisering)',
      options: [
        { text: 'Let', value: 1 },
        { text: 'Moderat', value: 2 },
        { text: 'Svær', value: 3 },
        { text: 'Med vrangforestillinger', value: 4 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '16. Sygdomsindsigt',
      options: [
        { text: 'Delvis', value: 1 },
        { text: 'Nægter depression', value: 2 }
      ],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '17. Vægttab',
      options: [
        { text: 'Under 2 kg', value: 1 },
        { text: '2 kg eller mere', value: 2 }
      ],
      answer: null
    }
  ]
}

export const hamiltonConfig: CalculatorConfig = {
  name: 'Hamilton Depressionsskala',
  description: 'Semistruktureret interview — kvantitativ bedømmelse af sværhedsgrad',
  shortName: 'Hamilton',
  defaultAge: 40,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createHamiltonQuestions(),
  thresholds: [
    // HAM-17 thresholds (used as default)
    { minScore: 0, maxScore: 7, interpretation: 'Ingen tegn på depression.', severity: 'normal' },
    { minScore: 8, maxScore: 12, interpretation: 'Tvivlsom depression.', severity: 'mild' },
    { minScore: 13, maxScore: 17, interpretation: 'Lettere depression.', severity: 'moderate' },
    { minScore: 18, maxScore: 24, interpretation: 'Moderat depression.', severity: 'moderate' },
    { minScore: 25, maxScore: 52, interpretation: 'Middelsvær til svær depression.', severity: 'severe' }
  ]
}

const HAM6_THRESHOLDS = [
  { minScore: 0, maxScore: 4, interpretation: 'Ingen tegn på depression.', severity: 'normal' as const },
  { minScore: 5, maxScore: 6, interpretation: 'Tvivlsom depression.', severity: 'mild' as const },
  { minScore: 7, maxScore: 8, interpretation: 'Lettere depression.', severity: 'moderate' as const },
  { minScore: 9, maxScore: 11, interpretation: 'Moderat depression.', severity: 'moderate' as const },
  { minScore: 12, maxScore: 22, interpretation: 'Middelsvær til svær depression.', severity: 'severe' as const }
]

/**
 * What: Score HAM-17 (all 17 items).
 */
export function calculateHamilton17(questions: Question[]): ScoreResult {
  const questionResults: QuestionResult[] = questions.map((q, i) => {
    const score = q.answer ?? 0
    const selectedOption = q.options.find(opt => opt.value === score)
    return {
      questionNumber: `${i + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const sum = questionResults.reduce((acc, r) => acc + r.score, 0)

  const threshold = hamiltonConfig.thresholds.find(
    t => sum >= t.minScore && sum <= t.maxScore
  )

  return {
    score: sum,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}

/**
 * What: Score HAM-6 (6-item subset: items 1,2,7,8,10,13).
 */
export function calculateHamilton6(questions: Question[]): ScoreResult {
  const questionResults: QuestionResult[] = questions.map((q, i) => {
    const score = q.answer ?? 0
    const selectedOption = q.options.find(opt => opt.value === score)
    return {
      questionNumber: `${i + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const sum = HAM6_INDICES.reduce((acc, idx) => acc + (questions[idx].answer ?? 0), 0)

  const threshold = HAM6_THRESHOLDS.find(
    t => sum >= t.minScore && sum <= t.maxScore
  )

  return {
    score: sum,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}

/**
 * What: Default scoring function using HAM-17.
 * How: Used by useCalculatorForm as the default scoring function.
 */
export function calculateHamilton(questions: Question[]): ScoreResult {
  return calculateHamilton17(questions)
}
