/**
 * What: Pure scoring function and criteria definitions for Modified Centor Score.
 * How: 5 criteria modeled as Questions with SelectButton options.
 * Score range is -1 to 5. Age question uses ordinal option values
 * mapped to clinical scores via CENTOR_AGE_SCORE_MAP.
 *
 * Why: The Modified Centor Criteria assess clinical probability of Group A
 * Streptococcal (GAS) pharyngitis to guide testing and treatment decisions.
 * Age has two categories mapping to -1 (under 3 and over 45), requiring
 * unique option values with a score lookup instead of direct value summing.
 */

import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

/**
 * What: Maps age question option values to clinical scores.
 * How: Ordinal values 0-3 map to the clinical point values per Modified Centor.
 * Why: SelectButton needs unique option values, but "Under 3 år" and "Over 45 år"
 * both score -1 clinically. Using ordinal values avoids SelectButton ambiguity.
 */
export const CENTOR_AGE_SCORE_MAP: Record<number, number> = {
  0: -1,  // Under 3 år
  1: 1,   // 3-14 år
  2: 0,   // 15-44 år
  3: -1   // Over 45 år
}

export const AGE_QUESTION_INDEX = 4

/**
 * What: GAS probability descriptions per score range.
 * How: Three-level lookup for display in the results section.
 */
export const CENTOR_GAS_PROBABILITY: Record<string, string> = {
  low: 'Meget lav sandsynlighed for GAS-infektion',
  moderate: 'Moderat til høj sandsynlighed for GAS-infektion',
  high: 'Stor sandsynlighed for GAS-infektion'
}

export function createCentorQuestions(): Question[] {
  return [
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '1 — Feber over 38,5°C',
      description: 'Ondt i halsen med feber over 38,5°C',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '2 — Tonsilhypertropi med ekssudat',
      description: 'Højrøde tonsiller, ofte med ekssudat/belægninger',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '3 — Hævede cervikale lymfeknuder',
      description: 'Hævede, ømme forreste cervikale lymfeknuder',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-50',
      text: '4 — Fravær af hoste',
      description: 'Patienten har ikke hoste',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja', value: 1 }
      ],
      answer: 0
    },
    {
      type: 'SelectButton',
      bg: '--p-primary-100',
      text: '5 — Alder',
      options: [
        { text: 'Under 3 år', value: 0 },
        { text: '3-14 år', value: 1 },
        { text: '15-44 år', value: 2 },
        { text: 'Over 45 år', value: 3 }
      ],
      answer: 2
    }
  ]
}

export const centorConfig: CalculatorConfig = {
  name: 'Modificerede Centor-kriterier',
  shortName: 'Centor',
  defaultAge: 25,
  defaultGender: 'Mand',
  minAge: 1,
  maxAge: 110,
  showCpr: false,
  questions: createCentorQuestions(),
  thresholds: [
    {
      minScore: -1,
      maxScore: 1,
      interpretation: 'Lav sandsynlighed for GAS. Ingen test nødvendig. Symptomatisk behandling.',
      severity: 'normal'
    },
    {
      minScore: 2,
      maxScore: 3,
      interpretation: 'Moderat sandsynlighed for GAS. Streptokok hurtigtest anbefales.',
      severity: 'moderate'
    },
    {
      minScore: 4,
      maxScore: 5,
      interpretation: 'Høj sandsynlighed for GAS. Overvej antibiotikabehandling eller udfør hurtigtest.',
      severity: 'severe'
    }
  ]
}

/**
 * What: Custom scoring function for Modified Centor Criteria.
 * How: Sums all question answers, but maps the age question through
 * CENTOR_AGE_SCORE_MAP to convert ordinal option values to clinical scores.
 * Why: The age question has two categories that both score -1 (under 3, over 45),
 * so we can't use direct option values as scores like calculateSimpleSum does.
 */
export function calculateCentor(questions: Question[]): ScoreResult {
  const questionResults: QuestionResult[] = questions.map((q, index) => {
    const rawAnswer = q.answer ?? 0
    const score = index === AGE_QUESTION_INDEX
      ? (CENTOR_AGE_SCORE_MAP[rawAnswer] ?? 0)
      : rawAnswer
    const selectedOption = q.options.find(opt => opt.value === rawAnswer)

    return {
      questionNumber: `${index + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0)

  const threshold = centorConfig.thresholds.find(
    t => totalScore >= t.minScore && totalScore <= t.maxScore
  )

  return {
    score: totalScore,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}
