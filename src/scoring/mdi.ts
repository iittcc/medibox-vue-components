/**
 * What: Pure scoring function for MDI (Major Depression Inventory).
 * How: 10 questions on 0-5 Likert scale. Questions 8 and 10 each have
 * two sub-items (a/b) where the max value is used for scoring.
 * Dual scoring: sum rating + ICD-10 diagnostic algorithm.
 *
 * Why: Danish MDI instrument for depression assessment.
 * Items 1-3 are "B" core symptoms (threshold ≥4 for ICD-10).
 * Items 4-10 are "C" associated symptoms (threshold ≥3 for ICD-10).
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

const MDI_OPTIONS = [
  { text: 'Hele tiden', value: 5 },
  { text: 'Det meste af tiden', value: 4 },
  { text: 'Lidt over halvdelen af tiden', value: 3 },
  { text: 'Lidt under halvdelen af tiden', value: 2 },
  { text: 'Lidt af tiden', value: 1 },
  { text: 'På intet tidspunkt', value: 0 }
]

/**
 * What: MDI uses 12 questions internally (8a, 8b, 10a, 10b separate).
 * The scoring combines 8a/8b → max and 10a/10b → max for the final 10 items.
 */
export function createMdiQuestions(): Question[] {
  return [
    { type: 'Listbox', bg: '--p-primary-100', text: '1. Trist til mode', description: 'Har du følt dig trist til mode, ked af det?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '2. Manglende interesse', description: 'Har du manglet interesse for dine daglige gøremål?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-100', text: '3. Manglende energi', description: 'Har du følt at du manglede energi og kræfter?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '4. Mindre selvtillid', description: 'Har du haft mindre selvtillid?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-100', text: '5. Dårlig samvittighed', description: 'Har du haft dårlig samvittighed eller skyldfølelse?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '6. Livet ikke værd at leve', description: 'Har du følt, at livet ikke var værd at leve?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-100', text: '7. Koncentrationsbesvær', description: 'Har du haft besvær med at koncentrere dig, f.eks. at læse avis eller følge med i fjernsyn?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '8a. Rastløs', description: 'Har du følt dig rastløs?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-100', text: '8b. Mere stille', description: 'Har du følt dig mere stille?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '9. Søvnbesvær', description: 'Har du haft besvær med at sove om natten?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-100', text: '10a. Nedsat appetit', description: 'Har du haft nedsat appetit?', options: [...MDI_OPTIONS], answer: null },
    { type: 'Listbox', bg: '--p-primary-50', text: '10b. Øget appetit', description: 'Har du haft øget appetit?', options: [...MDI_OPTIONS], answer: null }
  ]
}

/**
 * What: Group assignments — B = core symptoms, C = associated symptoms.
 * Items 8a/8b and 10a/10b are paired; group applies to the pair.
 */
const _MDI_GROUPS: ('b' | 'c' | 'pair8' | 'pair10')[] = [
  'b', 'b', 'b',       // items 1-3 (core)
  'c', 'c', 'c', 'c',  // items 4-7 (associated)
  'pair8', 'pair8',     // items 8a, 8b (associated pair)
  'c',                  // item 9 (associated)
  'pair10', 'pair10'    // items 10a, 10b (associated pair)
]

export const MDI_SECTIONS = [
  { title: 'Kernesymptomer (B)', startIndex: 0 },
  { title: 'Ledsagesymptomer (C)', startIndex: 3 }
]

export const mdiConfig: CalculatorConfig = {
  name: 'MDI',
  description: 'Major Depression Inventory — de sidste 2 uger',
  shortName: 'MDI',
  defaultAge: 40,
  defaultGender: 'Mand',
  minAge: 18,
  maxAge: 110,
  showCpr: false,
  questions: createMdiQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 19, interpretation: 'Ingen tegn på depression.', severity: 'normal' },
    { minScore: 20, maxScore: 24, interpretation: 'Tyder på let depression.', severity: 'mild' },
    { minScore: 25, maxScore: 29, interpretation: 'Tyder på moderat depression.', severity: 'moderate' },
    { minScore: 30, maxScore: 50, interpretation: 'Tyder på svær depression.', severity: 'severe' }
  ]
}

/**
 * What: Custom MDI scoring with paired sub-questions and dual output.
 * How: Sum uses max(8a,8b) and max(10a,10b). ICD-10 counts B≥4 and C≥3.
 */
export function calculateMdi(questions: Question[]): ScoreResult {
  const answers = questions.map(q => q.answer ?? 0)

  // Compute effective 10-item scores (max of paired items)
  const item8 = Math.max(answers[7], answers[8])   // max(8a, 8b)
  const item10 = Math.max(answers[10], answers[11]) // max(10a, 10b)

  // Sum rating: items 1-7 + max(8a,8b) + item 9 + max(10a,10b)
  const sum = answers[0] + answers[1] + answers[2] + answers[3] +
    answers[4] + answers[5] + answers[6] + item8 + answers[9] + item10

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

  const threshold = mdiConfig.thresholds.find(
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
 * What: Compute ICD-10 diagnostic classification from MDI answers.
 * How: B items (1-3) count if ≥4. C items (4-7, max(8a/8b), 9, max(10a/10b)) count if ≥3.
 */
export function getMdiIcd10(questions: Question[]): {
  bCount: number
  cCount: number
  diagnosis: string
  treatment: string
} {
  const answers = questions.map(q => q.answer ?? 0)
  const item8 = Math.max(answers[7], answers[8])
  const item10 = Math.max(answers[10], answers[11])

  // B: core symptoms (items 1-3), positive if ≥4
  let bCount = 0
  for (let i = 0; i < 3; i++) {
    if (answers[i] >= 4) bCount++
  }

  // C: associated symptoms (items 4-7, max(8a/8b), 9, max(10a/10b)), positive if ≥3
  let cCount = 0
  for (let i = 3; i < 7; i++) {
    if (answers[i] >= 3) cCount++
  }
  if (item8 >= 3) cCount++
  if (answers[9] >= 3) cCount++
  if (item10 >= 3) cCount++

  let diagnosis: string
  let treatment: string

  if (bCount >= 3 && cCount >= 5) {
    diagnosis = 'Svær depression'
    treatment = 'Medicinsk behandling.'
  } else if (bCount >= 2 && cCount >= 4) {
    diagnosis = 'Moderat depression'
    treatment = 'Samtaleterapi, evt. medicin.'
  } else if (bCount >= 2 && cCount >= 2) {
    diagnosis = 'Let depression'
    treatment = 'Samtaleterapi.'
  } else {
    diagnosis = 'Ingen tegn til depression'
    treatment = ''
  }

  return { bCount, cCount, diagnosis, treatment }
}
