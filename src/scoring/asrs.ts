/**
 * What: Pure scoring function and question definitions for ASRS V1.1
 * (Adult ADHD Self-Report Scale).
 * How: 18 questions (6 Part A + 12 Part B), scale 0-4.
 * Scoring counts "positive" answers that meet per-question thresholds.
 * ≥4 positive Part A answers → ADHD evaluation recommended.
 *
 * Why: The ASRS uses a shaded threshold system where each question has
 * a different cutoff for what counts as a "positive" (clinically significant)
 * answer. This implements the WHO ASRS V1.1 Danish version.
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

/**
 * What: Per-question thresholds for counting positive answers.
 * How: If answer >= threshold, the answer counts as positive.
 * Values derived from the ASRS V1.1 shaded cells (blur class in legacy).
 */
export const ASRS_POSITIVE_THRESHOLDS: number[] = [
  // Part A (A1-A6)
  2, 2, 2, 3, 3, 3,
  // Part B (B1-B12)
  3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 2
]

/**
 * What: Group assignment per question index.
 */
export const ASRS_GROUPS: ('a' | 'b')[] = [
  'a', 'a', 'a', 'a', 'a', 'a',
  'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'
]

export const ASRS_SECTIONS = [
  { title: 'Afsnit A', startIndex: 0 },
  { title: 'Afsnit B', startIndex: 6 }
]

const ASRS_OPTIONS = [
  { text: 'Aldrig', value: 0 },
  { text: 'Sjældent', value: 1 },
  { text: 'Nogle gange', value: 2 },
  { text: 'Ofte', value: 3 },
  { text: 'Meget ofte', value: 4 }
]

export function createAsrsQuestions(): Question[] {
  return [
    // Part A (A1-A6)
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'A1. Afslutte projekter',
      description: 'Hvor ofte har du svært ved at afslutte et projekt og få de sidste detaljer på plads, når den udfordrende del af arbejdet er overstået?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'A2. Opgaver der kræver planlægning',
      description: 'Hvor ofte har du svært ved at klare en opgave, der kræver planlægning?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'A3. Huske aftaler',
      description: 'Hvor ofte har du problemer med at huske aftaler eller andet, du burde huske?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'A4. Udsætte opgaver',
      description: 'Hvor ofte undgår eller udsætter du en opgave, som kræver mange overvejelser?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'A5. Uro i hænder/fødder',
      description: 'Hvor ofte sidder du uroligt med hænder eller fødder, når du skal sidde ned i længere tid?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'A6. Overaktiv / indre motor',
      description: 'Hvor ofte føler du dig overaktiv og nødt til at gøre ting, som var du drevet af en indre motor?',
      options: [...ASRS_OPTIONS], answer: null
    },
    // Part B (B1-B12)
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B1. Sjuskefejl',
      description: 'Hvor ofte laver du sjuskefejl, når du skal arbejde på et kedeligt eller vanskeligt projekt?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B2. Fastholde opmærksomhed',
      description: 'Hvor ofte har du svært ved at fastholde opmærksomheden, når du udfører kedeligt eller ensformigt arbejde?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B3. Koncentrere dig om samtale',
      description: 'Hvor ofte har du svært ved at koncentrere dig om, hvad folk siger til dig, selv når de taler direkte til dig?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B4. Ting bliver væk',
      description: 'Hvor ofte bliver ting væk for dig, hjemme eller på arbejdet?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B5. Distraheret af omgivelser',
      description: 'Hvor ofte bliver du distraheret af aktivitet eller støj omkring dig?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B6. Forlader plads ved møder',
      description: 'Hvor ofte forlader du din plads ved møder eller i andre situationer, hvor det forventes, at du bliver siddende?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B7. Rastløs / indre uro',
      description: 'Hvor ofte føler du dig rastløs eller har indre uro?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B8. Svært ved at slappe af',
      description: 'Hvor ofte har du svært ved at koble fra og slappe af, når du har tid til dig selv?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B9. Taler for meget',
      description: 'Hvor ofte har du fornemmelsen af, at du taler for meget?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B10. Afslutter andres sætninger',
      description: 'Når du taler med andre, hvor ofte kommer du så til at afslutte deres sætninger, før de selv gør det?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: 'B11. Svært ved at vente',
      description: 'Hvor ofte har du svært ved at vente til det bliver din tur?',
      options: [...ASRS_OPTIONS], answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: 'B12. Afbryder andre',
      description: 'Hvor ofte afbryder du andre, når de er optaget af noget andet?',
      options: [...ASRS_OPTIONS], answer: null
    }
  ]
}

export const asrsConfig: CalculatorConfig = {
  name: 'ASRS V1.1',
  description: 'Adult ADHD Self-Report Scale — screening for ADHD hos voksne',
  shortName: 'ASRS',
  defaultAge: 30,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createAsrsQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 3,
      interpretation: 'Ikke tegn på ADHD (under 4 positive A-spørgsmål).',
      severity: 'normal'
    },
    {
      minScore: 4,
      maxScore: 6,
      interpretation: 'Yderligere udredning for ADHD anbefales (≥4 positive A-spørgsmål).',
      severity: 'severe'
    }
  ]
}

/**
 * What: Custom ASRS scoring that counts positive answers per section.
 * How: An answer is "positive" if answer >= the per-question threshold.
 * Score = count of positive Part A answers. Interpretation based on ≥4.
 *
 * Why: ASRS uses shaded thresholds, not simple sum scoring.
 * Different questions have different cutoffs for clinical significance.
 */
export function calculateAsrs(questions: Question[]): ScoreResult {
  let positiveA = 0
  let _positiveB = 0

  const questionResults: QuestionResult[] = questions.map((q, index) => {
    const score = q.answer ?? 0
    const selectedOption = q.options.find(opt => opt.value === score)
    const isPositive = score >= ASRS_POSITIVE_THRESHOLDS[index]

    if (ASRS_GROUPS[index] === 'a' && isPositive) positiveA++
    if (ASRS_GROUPS[index] === 'b' && isPositive) _positiveB++

    return {
      questionNumber: `${index + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const threshold = asrsConfig.thresholds.find(
    t => positiveA >= t.minScore && positiveA <= t.maxScore
  )

  return {
    score: positiveA,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}

/**
 * What: Compute the Part B positive count from scored results.
 * How: Helper for display — counts positive answers in Part B questions.
 */
export function getPositiveB(questions: Question[]): number {
  let count = 0
  questions.forEach((q, index) => {
    if (ASRS_GROUPS[index] === 'b' && (q.answer ?? 0) >= ASRS_POSITIVE_THRESHOLDS[index]) {
      count++
    }
  })
  return count
}
