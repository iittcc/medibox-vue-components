import { describe, it, expect } from 'vitest'
import { useCalculatorForm } from '../../src/composables/useCalculatorForm'
import type { CalculatorConfig, Question, ScoreResult } from '../../src/scoring/types'

const testConfig: CalculatorConfig = {
  name: 'Test Calculator',
  shortName: 'TEST',
  defaultAge: 30,
  defaultGender: 'Mand',
  minAge: 0,
  maxAge: 100,
  showCpr: false,
  questions: [
    { type: 'Listbox', text: 'Q1', options: [{ text: 'A', value: 0 }, { text: 'B', value: 1 }], answer: 0 },
    { type: 'Listbox', text: 'Q2', options: [{ text: 'A', value: 0 }, { text: 'B', value: 1 }], answer: 0 }
  ],
  thresholds: [
    { minScore: 0, maxScore: 0, interpretation: 'Normal', severity: 'normal' },
    { minScore: 1, maxScore: 2, interpretation: 'Elevated', severity: 'severe' }
  ]
}

function mockScoring(questions: Question[]): ScoreResult {
  const score = questions.reduce((s, q) => s + (q.answer ?? 0), 0)
  return {
    score,
    interpretation: score > 0 ? 'Elevated' : 'Normal',
    severity: score > 0 ? 'severe' : 'normal',
    questionResults: questions.map((q, i) => ({
      questionNumber: `${i + 1}`,
      questionText: q.text,
      answerText: q.options.find(o => o.value === q.answer)?.text ?? '',
      score: q.answer ?? 0
    }))
  }
}

describe('useCalculatorForm', () => {
  it('initializes with default patient info from config', () => {
    const { patient } = useCalculatorForm(testConfig, mockScoring)
    expect(patient.value.age).toBe(30)
    expect(patient.value.gender).toBe('Mand')
    expect(patient.value.name).toBe('')
    expect(patient.value.cpr).toBe('')
  })

  it('creates independent question copies from config', () => {
    const { questions } = useCalculatorForm(testConfig, mockScoring)
    questions.value[0].answer = 1
    expect(testConfig.questions[0].answer).toBe(0)
  })

  it('hasResults is false initially', () => {
    const { hasResults } = useCalculatorForm(testConfig, mockScoring)
    expect(hasResults.value).toBe(false)
  })

  describe('validate', () => {
    it('returns true when all questions answered', () => {
      const { validate } = useCalculatorForm(testConfig, mockScoring)
      expect(validate()).toBe(true)
    })

    it('returns false when a question has null answer', () => {
      const { questions, validate, validationMessage } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = null
      expect(validate()).toBe(false)
      expect(validationMessage.value).toBeTruthy()
    })

    it('clears validation message on successful validation', () => {
      const { questions, validate, validationMessage } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = null
      validate()
      expect(validationMessage.value).toBeTruthy()
      questions.value[0].answer = 0
      validate()
      expect(validationMessage.value).toBe('')
    })
  })

  describe('calculate', () => {
    it('sets result from scoring function', () => {
      const { calculate, result, hasResults } = useCalculatorForm(testConfig, mockScoring)
      calculate()
      expect(hasResults.value).toBe(true)
      expect(result.value!.score).toBe(0)
    })

    it('returns the score result', () => {
      const { questions, calculate } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = 1
      const scoreResult = calculate()
      expect(scoreResult.score).toBe(1)
    })
  })

  describe('reset', () => {
    it('resets answers to their configured initial values', () => {
      const { questions, calculate, reset, hasResults } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = 1
      calculate()
      expect(hasResults.value).toBe(true)
      reset()
      expect(questions.value[0].answer).toBe(0)
      expect(hasResults.value).toBe(false)
    })

    it('preserves non-first initial answers on reset', () => {
      const reverseScoredConfig: CalculatorConfig = {
        ...testConfig,
        questions: [
          {
            type: 'Listbox',
            text: 'Reverse',
            options: [
              { text: 'High', value: 3 },
              { text: 'Low', value: 0 }
            ],
            answer: 0
          }
        ]
      }

      const { questions, reset } = useCalculatorForm(reverseScoredConfig, mockScoring)
      questions.value[0].answer = 3

      reset()

      expect(questions.value[0].answer).toBe(0)
    })

    it('clears validation state', () => {
      const { questions, validate, reset, validationMessage, formSubmitted } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = null
      formSubmitted.value = true
      validate()
      reset()
      expect(validationMessage.value).toBe('')
      expect(formSubmitted.value).toBe(false)
    })
  })

  describe('isUnanswered', () => {
    it('returns true for null answer', () => {
      const { questions, isUnanswered } = useCalculatorForm(testConfig, mockScoring)
      questions.value[0].answer = null
      expect(isUnanswered(questions.value[0])).toBe(true)
    })

    it('returns false for answered question', () => {
      const { questions, isUnanswered } = useCalculatorForm(testConfig, mockScoring)
      expect(isUnanswered(questions.value[0])).toBe(false)
    })
  })
})
