/**
 * What: Pure scoring function and question definitions for ASS
 * (Angst-Symptom-Spørgeskemaet / Anxiety Symptom Questionnaire).
 * How: 10 items scored 0-5. Diagnostic interpretation based on
 * functional impairment (item 10 >= 3), highest symptom category,
 * and core anxiety score (items 1-3).
 * Not yet validated for general practice — interpretation must be
 * compared with diagnostic criteria.
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

const ASS_OPTIONS = [
  { text: 'På intet tidspunkt', value: 0 },
  { text: 'Lidt af tiden', value: 1 },
  { text: 'Lidt under halvdelen af tiden', value: 2 },
  { text: 'Lidt over halvdelen af tiden', value: 3 },
  { text: 'Det meste af tiden', value: 4 },
  { text: 'Hele tiden', value: 5 }
]

/** Symptom category mapping: item indices (1-based) → category label */
export const ASS_CATEGORIES: { items: number[], label: string }[] = [
  { items: [1, 2], label: 'Generel angst/GAD' },
  { items: [3], label: 'Undvigeadfærd/agorafobi' },
  { items: [4, 5], label: 'Panikangst' },
  { items: [6, 7], label: 'OCD' },
  { items: [8], label: 'Socialfobi' },
  { items: [9], label: 'PTSD' }
]

export function createAssQuestions(): Question[] {
  return [
    { type: 'SelectButton', bg: '--p-primary-100', text: '1. Været nervøs, anspændt eller følt indre uro?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '2. Været meget bekymret over selv de mindste ting i din dagligdag?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '3. Været nødt til at undgå visse ting, steder eller aktiviteter, fordi de er angstprovokerende?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '4. Haft tilløb til angstanfald (panik)?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '5. Haft egentlige angstanfald (panikangst)?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '6. Haft gentagne ubehagelige tvangstanker, du ikke kan få ud af hovedet?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '7. Været nødt til at kontrollere alt, hvad du gør, eller gentage de samme handlinger igen og igen?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '8. Været meget genert over for andre, f.eks. når du spiser eller taler, mens andre ser på dig?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '9. Haft tilbagevendende tanker eller erindringer om en meget voldsom oplevelse?', options: [...ASS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '10. Haft svært ved at udføre dine daglige aktiviteter pga. disse symptomer?', options: [...ASS_OPTIONS], answer: null }
  ]
}

export interface AssInterpretation {
  /** Whether item 10 >= 3 (sufficient functional impairment) */
  hasFunctionalImpairment: boolean
  /** Score on item 10 (functional impairment) */
  functionalImpairmentScore: number
  /** Symptom categories with the highest score (items 1-9) */
  highestCategories: string[]
  /** The highest symptom score (items 1-9) */
  highestScore: number
  /** Core anxiety score (items 1-3, max 15) */
  coreAnxietyScore: number
  /** Total score (all 10 items, max 50) */
  totalScore: number
}

/** Compute the detailed ASS interpretation */
export function getAssInterpretation(questions: Question[]): AssInterpretation {
  const scores = questions.map(q => q.answer ?? 0)
  const functionalImpairmentScore = scores[9] // item 10 (0-indexed: 9)
  const hasFunctionalImpairment = functionalImpairmentScore >= 3
  const coreAnxietyScore = scores[0] + scores[1] + scores[2] // items 1-3
  const totalScore = scores.reduce((sum, v) => sum + v, 0)

  // Find highest score among items 1-9
  const symptomScores = scores.slice(0, 9)
  const highestScore = Math.max(...symptomScores)

  // Find which categories match the highest score
  const highestCategories: string[] = []
  // Check if all symptom scores are equal
  const allEqual = symptomScores.every(s => s === symptomScores[0])

  if (allEqual && highestScore > 0) {
    // Special case: all equal
    return {
      hasFunctionalImpairment,
      functionalImpairmentScore,
      highestCategories: ['Alle angstsymptomer scorer ens'],
      highestScore,
      coreAnxietyScore,
      totalScore
    }
  }

  for (const cat of ASS_CATEGORIES) {
    if (cat.items.some(itemNum => scores[itemNum - 1] === highestScore)) {
      highestCategories.push(cat.label)
    }
  }

  return {
    hasFunctionalImpairment,
    functionalImpairmentScore,
    highestCategories,
    highestScore,
    coreAnxietyScore,
    totalScore
  }
}

export const assConfig: CalculatorConfig = {
  name: 'Angst-Symptom-Spørgeskemaet',
  description: 'Diagnostisk udredning og monitorering af angstlidelser. Endnu ikke valideret til almen praksis.',
  shortName: 'ASS',
  defaultAge: 30,
  defaultGender: 'Kvinde',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createAssQuestions(),
  // ASS uses diagnostic interpretation, not simple thresholds.
  // These thresholds are used for severity display color coding.
  thresholds: [
    { minScore: 0, maxScore: 10, interpretation: '', severity: 'normal' },
    { minScore: 11, maxScore: 25, interpretation: '', severity: 'mild' },
    { minScore: 26, maxScore: 40, interpretation: '', severity: 'moderate' },
    { minScore: 41, maxScore: 50, interpretation: '', severity: 'severe' }
  ]
}

export function calculateAss(questions: Question[]): ScoreResult {
  const questionResults: QuestionResult[] = questions.map((q, index) => {
    const score = q.answer ?? 0
    const selectedOption = q.options.find(opt => opt.value === score)
    return {
      questionNumber: `${index + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const interp = getAssInterpretation(questions)
  const totalScore = interp.totalScore

  // Build interpretation text matching legacy behavior
  let interpretation: string
  if (!interp.hasFunctionalImpairment) {
    interpretation = `a) Der er ikke nok påvirkning af de daglige funktioner til positiv angstscore (som er 3 eller flere point i spm 10)\nd) Total angstscore: ${totalScore} (ud af 50 point)`
  } else {
    const catText = interp.highestCategories.length === 1 && interp.highestCategories[0] === 'Alle angstsymptomer scorer ens'
      ? interp.highestCategories[0]
      : interp.highestCategories.join(', ')
    interpretation = [
      `a) Der er tilstrækkelig påvirkning af de daglige funktioner til positiv angstscore (3 eller flere point i spm 10)`,
      `b) Angstsymptomer med højeste score: ${catText} (${interp.highestScore} point)`,
      `c) Score på egentlige angstsymptomer: ${interp.coreAnxietyScore} (ud af 15 point spm 1-3)`,
      `d) Total angstscore: ${totalScore} (ud af 50 point)`
    ].join('\n')
  }

  const threshold = assConfig.thresholds.find(
    t => totalScore >= t.minScore && totalScore <= t.maxScore
  )

  return {
    score: totalScore,
    interpretation,
    severity: interp.hasFunctionalImpairment ? (threshold?.severity ?? 'moderate') : 'normal',
    questionResults
  }
}
