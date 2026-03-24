import { describe, it, expect } from 'vitest'
import { useDanpssForm } from '../../src/composables/useDanpssForm'
import { danpssConfig, createDanpssQuestions, calculateDanpss } from '../../src/scoring/danpss'

describe('useDanpssForm', () => {
  function create() {
    return useDanpssForm(danpssConfig, createDanpssQuestions, calculateDanpss)
  }

  it('initializes with default patient info', () => {
    const { patient } = create()
    expect(patient.value.age).toBe(55)
    expect(patient.value.gender).toBe('Mand')
  })

  it('creates 15 questions', () => {
    const { questions } = create()
    expect(questions.value).toHaveLength(15)
  })

  it('hasResults is false initially', () => {
    const { hasResults } = create()
    expect(hasResults.value).toBe(false)
  })

  it('creates independent question copies', () => {
    const { questions } = create()
    questions.value[0].answerA = 3
    const fresh = create()
    expect(fresh.questions.value[0].answerA).toBeNull()
  })

  describe('mainQuestions / sexualQuestions', () => {
    it('mainQuestions has 12 questions (sections 1-3)', () => {
      const { mainQuestions } = create()
      expect(mainQuestions.value).toHaveLength(12)
    })

    it('sexualQuestions has 3 questions (section 4)', () => {
      const { sexualQuestions } = create()
      expect(sexualQuestions.value).toHaveLength(3)
    })
  })

  describe('validateMain', () => {
    it('fails when main questions unanswered', () => {
      const { validateMain, validationMessage } = create()
      expect(validateMain()).toBe(false)
      expect(validationMessage.value).toBeTruthy()
    })

    it('passes when all main questions answered', () => {
      const { questions, validateMain } = create()
      questions.value.forEach(q => {
        if (q.section !== 'Seksualfunktion') {
          q.answerA = 0
          q.answerB = 0
        }
      })
      expect(validateMain()).toBe(true)
    })
  })

  describe('validateSexual', () => {
    it('fails when no sexual questions answered', () => {
      const { validateSexual, validationMessageSexual } = create()
      expect(validateSexual()).toBe(false)
      expect(validationMessageSexual.value).toContain('ikke udfyldt')
    })

    it('fails with partial message when some sexual questions answered', () => {
      const { questions, validateSexual, validationMessageSexual } = create()
      questions.value[12].answerA = 1
      questions.value[12].answerB = 1
      expect(validateSexual()).toBe(false)
      expect(validationMessageSexual.value).toContain('ikke komplet')
    })

    it('passes when all sexual questions answered', () => {
      const { questions, validateSexual } = create()
      for (let i = 12; i < 15; i++) {
        questions.value[i].answerA = 0
        questions.value[i].answerB = 0
      }
      expect(validateSexual()).toBe(true)
    })
  })

  describe('calculate', () => {
    it('produces result with sections', () => {
      const { questions, calculate, result, hasResults } = create()
      questions.value.forEach(q => { q.answerA = 0; q.answerB = 0 })
      calculate()
      expect(hasResults.value).toBe(true)
      expect(result.value!.sections).toHaveLength(3)
    })
  })

  describe('reset', () => {
    it('clears all answers and results', () => {
      const { questions, calculate, reset, hasResults, formSubmitted } = create()
      questions.value.forEach(q => { q.answerA = 2; q.answerB = 2 })
      formSubmitted.value = true
      calculate()
      reset()
      expect(hasResults.value).toBe(false)
      expect(formSubmitted.value).toBe(false)
      expect(questions.value[0].answerA).toBeNull()
      expect(questions.value[0].answerB).toBeNull()
    })
  })

  describe('isUnanswered', () => {
    it('returns true when answerA is null', () => {
      const { questions, isUnanswered } = create()
      expect(isUnanswered(questions.value[0])).toBe(true)
    })

    it('returns false when both answers set', () => {
      const { questions, isUnanswered } = create()
      questions.value[0].answerA = 0
      questions.value[0].answerB = 0
      expect(isUnanswered(questions.value[0])).toBe(false)
    })
  })
})
