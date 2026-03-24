/**
 * What: Shared composable for medical calculator form state management.
 * How: Provides reactive state for patient info, questions, results, and
 * validation. Acts as the single source of truth consumed by both the
 * interactive form and the print view.
 *
 * Why: Extracted so that the interactive and print views share the same
 * clinical content and state — preventing content drift between views.
 */

import { ref, computed, watch } from 'vue'
import type {
  Question,
  ScoreResult,
  PatientInfo,
  CalculatorConfig
} from '../scoring/types'

/**
 * What: Factory composable for calculator form state.
 * How: Takes a calculator config and scoring function, returns reactive
 * state and methods for the calculator lifecycle (fill → validate →
 * calculate → print/copy → reset).
 *
 * @param config - Calculator configuration with questions and thresholds
 * @param scoringFn - Pure function that computes the score from questions
 */
export function useCalculatorForm(
  config: CalculatorConfig,
  scoringFn: (questions: Question[]) => ScoreResult
) {
  // Why: Factory function creates fresh questions per instance to avoid shared mutable state
  const questions = ref<Question[]>(
    config.questions.map(q => ({
      ...q,
      options: [...q.options],
      answer: q.answer
    }))
  )
  const initialAnswers = questions.value.map(question => question.answer)

  const patient = ref<PatientInfo>({
    name: '',
    age: config.defaultAge,
    gender: config.defaultGender,
    cpr: ''
  })

  const result = ref<ScoreResult | null>(null)
  const formSubmitted = ref(false)
  const validationMessage = ref('')

  const hasResults = computed(() => result.value !== null)

  // Why: When a user changes any input after calculating, the displayed result
  // becomes stale and potentially misleading. Clear it so they must recalculate.
  watch(questions, () => {
    if (result.value !== null) {
      result.value = null
      formSubmitted.value = false
    }
  }, { deep: true })

  /**
   * What: Validates that all questions have been answered.
   * How: Checks each question's answer for null values.
   * @returns true if all questions are answered
   */
  function validate(): boolean {
    const unanswered = questions.value.filter(q => q.answer === null)
    if (unanswered.length > 0) {
      validationMessage.value = 'Alle spørgsmål skal udfyldes.'
      return false
    }
    validationMessage.value = ''
    return true
  }

  /**
   * What: Runs the scoring function on current question state.
   * How: Delegates to the pure scoring function passed at construction.
   */
  function calculate(): ScoreResult {
    const scoreResult = scoringFn(questions.value)
    result.value = scoreResult
    return scoreResult
  }

  /**
   * What: Resets the form to its initial state.
   * How: Resets each question answer to the first option value,
   * clears results and validation state.
   */
  function reset(): void {
    questions.value.forEach((q, index) => {
      q.answer = initialAnswers[index] ?? null
    })
    result.value = null
    formSubmitted.value = false
    validationMessage.value = ''
  }

  /**
   * What: Checks if a specific question is unanswered.
   * How: Returns true if the question's answer is null.
   */
  function isUnanswered(question: Question): boolean {
    return question.answer === null
  }

  return {
    // State
    questions,
    patient,
    result,
    formSubmitted,
    validationMessage,
    hasResults,

    // Methods
    validate,
    calculate,
    reset,
    isUnanswered
  }
}
