/**
 * What: Pure scoring function for ICD-10 Depression Criteria.
 * How: 13 boolean checklist items in 3 groups (A:3, B:3, C:7).
 * Diagnostic classification based on counts per group.
 *
 * Why: ICD-10 diagnostic criteria for unipolar depression.
 * All 3 A-criteria must be met. Then B and C counts determine severity.
 * 3A + 2B + 2C = Let depression
 * 3A + 2B + 4C = Moderat depression
 * 3A + 3B + 5C = Svær depression
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

export const ICD10_SECTIONS = [
  { title: 'A. Generelle kriterier (alle 3 skal være opfyldt)', startIndex: 0 },
  { title: 'B. Kernesymptomer', startIndex: 3 },
  { title: 'C. Ledsagesymptomer', startIndex: 6 }
]

export function createDepressionIcd10Questions(): Question[] {
  return [
    // Group A: General criteria (all 3 must be met)
    { type: 'SelectButton', bg: '--p-primary-100', text: 'A1. Varighed > 2 uger', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: 'A2. Ingen tidligere episoder', description: 'Ingen tidligere episoder med hypomani, mani eller blandingstilstand', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: 'A3. Organisk ætiologi udelukket', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },

    // Group B: Core depressive symptoms
    { type: 'SelectButton', bg: '--p-primary-50', text: 'B1. Nedtrykthed', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: 'B2. Nedsat lyst og interesse', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: 'B3. Nedsat energi eller øget trætbarhed', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },

    // Group C: Associated depressive symptoms
    { type: 'SelectButton', bg: '--p-primary-100', text: 'C1. Nedsat selvtillid og selvfølelse', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: 'C2. Selvbebrejdelser eller skyldfølelse', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: 'C3. Tanker om død eller selvmord', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: 'C4. Tænke- og koncentrationsbesvær', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: 'C5. Agitation eller hæmning', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: 'C6. Søvnforstyrrelser', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: 'C7. Appetit- og vægtændring', options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }], answer: null }
  ]
}

export const depressionIcd10Config: CalculatorConfig = {
  name: 'ICD-10 Depression',
  description: 'ICD-10 kriterier for unipolær depression',
  shortName: 'ICD-10',
  defaultAge: 40,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createDepressionIcd10Questions(),
  // Thresholds not used directly — custom diagnostic logic
  thresholds: [
    { minScore: 0, maxScore: 4, interpretation: 'Ingen depression.', severity: 'normal' },
    { minScore: 5, maxScore: 7, interpretation: 'Let depression.', severity: 'mild' },
    { minScore: 8, maxScore: 10, interpretation: 'Moderat depression.', severity: 'moderate' },
    { minScore: 11, maxScore: 13, interpretation: 'Svær depression.', severity: 'severe' }
  ]
}

/**
 * What: Custom ICD-10 diagnostic scoring.
 * How: Counts checked items per group. Uses diagnostic rules for classification.
 * Score = total checked (for display), interpretation from diagnostic logic.
 */
export function calculateDepressionIcd10(questions: Question[]): ScoreResult {
  const answers = questions.map(q => q.answer ?? 0)

  const a = answers[0] + answers[1] + answers[2]
  const b = answers[3] + answers[4] + answers[5]
  const c = answers[6] + answers[7] + answers[8] + answers[9] + answers[10] + answers[11] + answers[12]

  let interpretation: string
  let severity: 'normal' | 'mild' | 'moderate' | 'severe'
  let treatment: string

  if (a === 3 && b >= 3 && c >= 5) {
    interpretation = 'Svær depression.'
    severity = 'severe'
    treatment = 'Medicinsk behandling.'
  } else if (a === 3 && b >= 2 && c >= 4) {
    interpretation = 'Moderat depression.'
    severity = 'moderate'
    treatment = 'Samtaleterapi, evt. medicin.'
  } else if (a === 3 && b >= 2 && c >= 2) {
    interpretation = 'Let depression.'
    severity = 'mild'
    treatment = 'Samtaleterapi.'
  } else {
    interpretation = 'Ingen depression.'
    severity = 'normal'
    treatment = ''
  }

  const questionResults: QuestionResult[] = questions.map((q, i) => {
    const score = q.answer ?? 0
    return {
      questionNumber: `${i + 1}`,
      questionText: q.text,
      answerText: score === 1 ? 'Ja' : 'Nej',
      score
    }
  })

  return {
    score: a + b + c,
    interpretation: `${interpretation}${treatment ? ' Behandlingsoplæg: ' + treatment : ''} (${a}A + ${b}B + ${c}C)`,
    severity,
    questionResults
  }
}

/**
 * What: Get group counts for display.
 */
export function getIcd10GroupCounts(questions: Question[]): { a: number; b: number; c: number } {
  const answers = questions.map(q => q.answer ?? 0)
  return {
    a: answers[0] + answers[1] + answers[2],
    b: answers[3] + answers[4] + answers[5],
    c: answers[6] + answers[7] + answers[8] + answers[9] + answers[10] + answers[11] + answers[12]
  }
}
