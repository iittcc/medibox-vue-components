import { describe, it, expect } from 'vitest'
import { calculateWellsDvt, createWellsDvtQuestions, wellsDvtConfig, WELLS_DVT_SECTIONS, WELLS_DVT_RECOMMENDATION } from '../../src/scoring/wellsDvt'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/wells-dvt-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createWellsDvtQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('Wells DVT Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateWellsDvt(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundary', () => {
    it('score -2 → low probability (normal)', () => {
      const result = calculateWellsDvt(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, -2]))
      expect(result.score).toBe(-2)
      expect(result.severity).toBe('normal')
    })

    it('score 0 → low probability (normal)', () => {
      const result = calculateWellsDvt(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 1 → intermediate probability (moderate)', () => {
      const result = calculateWellsDvt(questionsWithAnswers([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(1)
      expect(result.severity).toBe('moderate')
    })

    it('score 2 → intermediate probability (moderate)', () => {
      const result = calculateWellsDvt(questionsWithAnswers([1, 1, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('moderate')
    })

    it('score 3 → high probability (severe)', () => {
      const result = calculateWellsDvt(questionsWithAnswers([1, 1, 1, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(3)
      expect(result.severity).toBe('severe')
    })

    it('alternative diagnosis reduces score by 2', () => {
      const result = calculateWellsDvt(questionsWithAnswers([1, 1, 1, 0, 0, 0, 0, 0, 0, -2]))
      expect(result.score).toBe(1)
      expect(result.severity).toBe('moderate')
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateWellsDvt(questionsWithAnswers([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionText).toContain('Paralyse')
      expect(result.questionResults[0].answerText).toBe('Ja')
      expect(result.questionResults[0].score).toBe(1)
    })

    it('maps alternative diagnosis question with -2 value', () => {
      const result = calculateWellsDvt(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, -2]))
      expect(result.questionResults[9].questionText).toContain('Alternativ diagnose')
      expect(result.questionResults[9].answerText).toBe('Ja')
      expect(result.questionResults[9].score).toBe(-2)
    })

    it('returns 10 question results', () => {
      const result = calculateWellsDvt(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults).toHaveLength(10)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateWellsDvt(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[9].questionNumber).toBe('10')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createWellsDvtQuestions()
      questions[0].answer = null
      questions[1].answer = 1
      const result = calculateWellsDvt(questions)
      expect(result.score).toBe(1)
    })
  })

  describe('Question factory', () => {
    it('createWellsDvtQuestions returns 10 questions', () => {
      expect(createWellsDvtQuestions()).toHaveLength(10)
    })

    it('all questions have 2 options (binary)', () => {
      const questions = createWellsDvtQuestions()
      questions.forEach(q => {
        expect(q.options).toHaveLength(2)
      })
    })

    it('last question has Ja value of -2 (alternative diagnosis)', () => {
      const questions = createWellsDvtQuestions()
      const jaOption = questions[9].options.find(o => o.text === 'Ja')
      expect(jaOption?.value).toBe(-2)
    })

    it('first 9 questions have Ja value of +1', () => {
      const questions = createWellsDvtQuestions()
      for (let i = 0; i < 9; i++) {
        const jaOption = questions[i].options.find(o => o.text === 'Ja')
        expect(jaOption?.value).toBe(1)
      }
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createWellsDvtQuestions()
      const q2 = createWellsDvtQuestions()
      q1[0].answer = 1
      expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(wellsDvtConfig.shortName).toBe('Wells DVT')
      expect(wellsDvtConfig.defaultAge).toBe(50)
      expect(wellsDvtConfig.defaultGender).toBe('Mand')
      expect(wellsDvtConfig.minAge).toBe(18)
      expect(wellsDvtConfig.maxAge).toBe(110)
      expect(wellsDvtConfig.showCpr).toBe(false)
    })

    it('has three thresholds covering -2 to 9 range', () => {
      expect(wellsDvtConfig.thresholds).toHaveLength(3)
      expect(wellsDvtConfig.thresholds[0].minScore).toBe(-2)
      expect(wellsDvtConfig.thresholds[2].maxScore).toBe(9)
    })
  })

  describe('Sections', () => {
    it('has 4 clinical sections', () => {
      expect(WELLS_DVT_SECTIONS).toHaveLength(4)
    })

    it('sections start at correct indices', () => {
      expect(WELLS_DVT_SECTIONS[0]).toEqual({ title: 'Disponerende faktorer', startIndex: 0 })
      expect(WELLS_DVT_SECTIONS[1]).toEqual({ title: 'Symptomer', startIndex: 4 })
      expect(WELLS_DVT_SECTIONS[2]).toEqual({ title: 'Kliniske tegn', startIndex: 5 })
      expect(WELLS_DVT_SECTIONS[3]).toEqual({ title: 'Klinisk vurdering', startIndex: 9 })
    })
  })

  describe('Recommendations', () => {
    it('has recommendations for all severity levels', () => {
      expect(WELLS_DVT_RECOMMENDATION['normal']).toBeDefined()
      expect(WELLS_DVT_RECOMMENDATION['moderate']).toBeDefined()
      expect(WELLS_DVT_RECOMMENDATION['severe']).toBeDefined()
    })
  })
})
