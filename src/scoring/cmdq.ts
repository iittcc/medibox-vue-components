/**
 * What: Pure scoring function and question definitions for CMDQ
 * (Common Mental Disorder Questionnaire).
 * How: 33 items across 5 subscales. Items 1-29 scored 0-4, items 30-33 scored 0/1.
 * Each subscale has an independent positive screening threshold.
 * Validated for Danish general practice.
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

/** Subscale definitions with question ranges and positive screening thresholds */
export const CMDQ_SUBSCALES = [
  { key: 'symptom', title: 'Symptom tjekliste', label: 'Symptom tjekliste (spm 1-12)', startIndex: 0, endIndex: 12, threshold: 6 },
  { key: 'helbredsangst', title: 'Helbredsangst', label: 'Helbredsangst (spm 13-19)', startIndex: 12, endIndex: 19, threshold: 2 },
  { key: 'angsttilstand', title: 'Angsttilstand', label: 'Angsttilstand (spm 20-23)', startIndex: 19, endIndex: 23, threshold: 2 },
  { key: 'depression', title: 'Depression', label: 'Depression (spm 24-29)', startIndex: 23, endIndex: 29, threshold: 3 },
  { key: 'alkoholproblem', title: 'Alkoholproblem', label: 'Alkoholproblem (spm 30-33)', startIndex: 29, endIndex: 33, threshold: 2 }
] as const

/** Section definitions for QuestionTabs navigation */
export const CMDQ_SECTIONS = CMDQ_SUBSCALES.map(s => ({
  title: s.title,
  startIndex: s.startIndex
}))

const CMDQ_OPTIONS_0_4 = [
  { text: 'Slet ikke', value: 0 },
  { text: 'Lidt', value: 1 },
  { text: 'Noget', value: 2 },
  { text: 'En hel del', value: 3 },
  { text: 'Virkelig meget', value: 4 }
]

const CMDQ_OPTIONS_BINARY = [
  { text: 'Nej', value: 0 },
  { text: 'Ja', value: 1 }
]

export function createCmdqQuestions(): Question[] {
  const q = (num: number, text: string, binary = false): Question => ({
    type: 'SelectButton',
    bg: num % 2 === 1 ? '--p-primary-100' : '--p-primary-50',
    text: `${num}. ${text}`,
    options: binary ? [...CMDQ_OPTIONS_BINARY] : [...CMDQ_OPTIONS_0_4],
    answer: null
  })

  return [
    // Symptom tjekliste (1-12)
    q(1, 'Hovedpine?'),
    q(2, 'Svimmelhed eller tilløb til at besvime?'),
    q(3, 'Smerter i hjerte eller bryst?'),
    q(4, 'Lavt siddende rygsmerter?'),
    q(5, 'Kvalme eller uro i maven?'),
    q(6, 'Muskelsmerter?'),
    q(7, 'At du har svært ved at få vejret?'),
    q(8, 'Anfald af varme eller kuldefornemmelser?'),
    q(9, 'Følelsesløshed eller en snurrende fornemmelse i kroppen?'),
    q(10, 'En klump i halsen?'),
    q(11, 'At du føler dig svag i kroppen?'),
    q(12, 'At dine arme eller ben føles tunge?'),
    // Helbredsangst (13-19)
    q(13, 'Bekymringer over, om der er noget alvorligt galt med din krop?'),
    q(14, 'Bekymringer over om du selv lider af en sygdom, som du har hørt eller læst om?'),
    q(15, 'Mange forskellige slags smerter'),
    q(16, 'Bekymringer over, om du lider af en alvorlig sygdom?'),
    q(17, 'Mange forskellige sygdomssymptomer?'),
    q(18, 'Tanken om at lægen måske tager fejl, hvis han siger, at der ikke er noget at bekymre sig om?'),
    q(19, 'Bekymringer om dit helbred?'),
    // Angsttilstand (20-23)
    q(20, 'At du pludselig bliver bange uden grund?'),
    q(21, 'Nervøsitet eller indre uro?'),
    q(22, 'Anfald af rædsel eller panik?'),
    q(23, 'At bekymre dig for meget?'),
    // Depression (24-29)
    q(24, 'At føle dig nedtrykt?'),
    q(25, 'En følelse af ingenting at være værd?'),
    q(26, 'Tanker om at gøre en ende på dit liv?'),
    q(27, 'En følelse af at være fanget i en fælde?'),
    q(28, 'At føle dig ensom?'),
    q(29, 'Selvbebrejdelser?'),
    // Alkoholproblem (30-33) — binary Nej/Ja
    q(30, 'Tænkt, at du skulle skære ned på dit alkoholforbrug?', true),
    q(31, 'Været irriteret over, at andre kritiserede dit alkoholforbrug?', true),
    q(32, 'Følt skyld over dit alkoholforbrug?', true),
    q(33, 'Straks fra morgenstunden taget en genstand, for at berolige nerverne eller for at komme dig over dine tømmermænd?', true)
  ]
}

export interface CmdqSubscaleResult {
  key: string
  label: string
  score: number
  threshold: number
  positive: boolean
}

/** Compute per-subscale scores and positive screening status */
export function getCmdqSubscaleScores(questions: Question[]): CmdqSubscaleResult[] {
  return CMDQ_SUBSCALES.map(sub => {
    const subscaleQuestions = questions.slice(sub.startIndex, sub.endIndex)
    const score = subscaleQuestions.reduce((sum, q) => sum + (q.answer ?? 0), 0)
    return {
      key: sub.key,
      label: sub.label,
      score,
      threshold: sub.threshold,
      positive: score >= sub.threshold
    }
  })
}

export const cmdqConfig: CalculatorConfig = {
  name: 'Common Mental Disorder Questionnaire',
  description: 'Valideret til brug i dansk almen praksis til screening for funktionel lidelse, depression, angst og alkoholproblemer',
  shortName: 'CMDQ',
  defaultAge: 30,
  defaultGender: 'Kvinde',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createCmdqQuestions(),
  // CMDQ uses subscale screening, not a single total score threshold.
  // We map the number of positive subscales to an overall severity for display.
  thresholds: [
    { minScore: 0, maxScore: 0, interpretation: 'Ingen positiv screening', severity: 'normal' },
    { minScore: 1, maxScore: 1, interpretation: '1 positiv screening', severity: 'mild' },
    { minScore: 2, maxScore: 2, interpretation: '2 positive screeninger', severity: 'moderate' },
    { minScore: 3, maxScore: 5, interpretation: 'Flere positive screeninger', severity: 'severe' }
  ]
}

export function calculateCmdq(questions: Question[]): ScoreResult {
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

  const subscaleResults = getCmdqSubscaleScores(questions)
  const positiveCount = subscaleResults.filter(s => s.positive).length

  // Build interpretation string from subscale results
  const interpretationParts = subscaleResults.map(s =>
    `${s.label}: ${s.score}${s.positive ? ' (POSITIV SCREENING)' : ''}`
  )
  const interpretation = interpretationParts.join('\n')

  const threshold = cmdqConfig.thresholds.find(
    t => positiveCount >= t.minScore && positiveCount <= t.maxScore
  )

  return {
    score: positiveCount,
    interpretation,
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}
