/**
 * What: Shared scoring utilities for simple-sum medical calculators.
 * How: Provides a generic scoring function that maps question answers to
 * a total score and applies threshold-based clinical interpretation.
 *
 * Why: All simple-sum calculators (EPDS, AUDIT, WHO-5, PUQE, Westley Croup,
 * GCS, IPSS) share the same scoring pattern — extracting this avoids
 * duplicating 20 lines of identical logic in each scoring file.
 */

import type { Question, ScoreResult, QuestionResult, ScoringThreshold } from './types'

/**
 * What: Pure scoring function for simple-sum calculators.
 * How: Sums all question answer values, applies an optional multiplier,
 * and finds the matching threshold for clinical interpretation.
 *
 * @param questions - Array of questions with user-selected answers
 * @param thresholds - Scoring thresholds for interpretation
 * @param scoreMultiplier - Optional multiplier applied to the total (e.g., ×4 for WHO-5)
 * @returns ScoreResult with total score, interpretation, severity, and per-question results
 */
export function calculateSimpleSum(
  questions: Question[],
  thresholds: ScoringThreshold[],
  scoreMultiplier: number = 1
): ScoreResult {
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

  const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0) * scoreMultiplier

  const threshold = thresholds.find(
    t => totalScore >= t.minScore && totalScore <= t.maxScore
  )

  return {
    score: totalScore,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}
