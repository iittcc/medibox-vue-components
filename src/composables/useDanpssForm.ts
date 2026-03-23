/**
 * What: Custom form state composable for the DANPSS calculator.
 * How: Handles dual A/B answers per question, section grouping,
 * optional section 4 validation, and product-based scoring.
 *
 * Why: DANPSS's dual scoring (A × B) and sectioned validation don't fit
 * the standard useCalculatorForm composable.
 */

import { ref, computed } from 'vue'
import type { PatientInfo } from '../scoring/types'
import type { DanpssQuestion, DanpssScoreResult, DanpssConfig } from '../scoring/danpss'

export function useDanpssForm(
  config: DanpssConfig,
  createQuestions: () => DanpssQuestion[],
  scoringFn: (questions: DanpssQuestion[]) => DanpssScoreResult
) {
  const questions = ref<DanpssQuestion[]>(
    createQuestions().map(q => ({
      ...q,
      optionsA: [...q.optionsA],
      optionsB: [...q.optionsB]
    }))
  )

  const patient = ref<PatientInfo>({
    name: '',
    age: config.defaultAge,
    gender: config.defaultGender,
    cpr: ''
  })

  const result = ref<DanpssScoreResult | null>(null)
  const formSubmitted = ref(false)
  const validationMessage = ref('')
  const validationMessageSexual = ref('')

  const hasResults = computed(() => result.value !== null)

  const mainQuestions = computed(() =>
    questions.value.filter(q => q.section !== 'Seksualfunktion')
  )

  const sexualQuestions = computed(() =>
    questions.value.filter(q => q.section === 'Seksualfunktion')
  )

  function validateMain(): boolean {
    const unanswered = mainQuestions.value.filter(
      q => q.answerA === null || q.answerB === null
    )
    if (unanswered.length > 0) {
      validationMessage.value = 'Alle spørgsmål om vandladningsproblemer skal udfyldes.'
      return false
    }
    validationMessage.value = ''
    return true
  }

  function validateSexual(): boolean {
    const unanswered = sexualQuestions.value.filter(
      q => q.answerA === null || q.answerB === null
    )
    if (unanswered.length > 0) {
      if (unanswered.length === sexualQuestions.value.length) {
        validationMessageSexual.value = 'Seksual funktion ikke udfyldt.'
      } else {
        validationMessageSexual.value = 'Seksual funktion ikke komplet.'
      }
      return false
    }
    validationMessageSexual.value = ''
    return true
  }

  function calculate(): DanpssScoreResult {
    const scoreResult = scoringFn(questions.value)
    result.value = scoreResult
    return scoreResult
  }

  function reset(): void {
    questions.value.forEach(q => {
      q.answerA = null
      q.answerB = null
    })
    result.value = null
    formSubmitted.value = false
    validationMessage.value = ''
    validationMessageSexual.value = ''
  }

  function isUnanswered(question: DanpssQuestion): boolean {
    return question.answerA === null || question.answerB === null
  }

  return {
    questions,
    patient,
    result,
    formSubmitted,
    validationMessage,
    validationMessageSexual,
    hasResults,
    mainQuestions,
    sexualQuestions,
    validateMain,
    validateSexual,
    calculate,
    reset,
    isUnanswered
  }
}
