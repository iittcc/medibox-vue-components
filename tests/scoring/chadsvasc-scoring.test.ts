import { describe, it, expect } from 'vitest'
import { calculateChadsvasc, createChadsvascQuestions, chadsvascConfig, CHADSVASC_ANNUAL_RISK, CHADSVASC_ANNUAL_RISK_GTE2 } from '../../src/scoring/chadsvasc'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/chadsvasc-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createChadsvascQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('CHA₂DS₂-VA Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateChadsvasc(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundary', () => {
    it('score 0 → no treatment (normal)', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 1 → consider treatment (moderate)', () => {
      const result = calculateChadsvasc(questionsWithAnswers([1, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(1)
      expect(result.severity).toBe('moderate')
    })

    it('score 2 → start treatment (severe)', () => {
      const result = calculateChadsvasc(questionsWithAnswers([1, 1, 0, 0, 0, 0]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('severe')
    })

    it('S₂ alone gives score 2 (double weight)', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 0, 0, 2, 0]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('severe')
    })

    it('age ≥75 alone gives score 2 (double weight)', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 2, 0, 0, 0]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateChadsvasc(questionsWithAnswers([1, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionText).toContain('Kronisk hjertesvigt')
      expect(result.questionResults[0].answerText).toBe('Ja')
      expect(result.questionResults[0].score).toBe(1)
    })

    it('maps age question with 3 options correctly', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 1, 0, 0, 0]))
      expect(result.questionResults[2].questionText).toContain('A₂')
      expect(result.questionResults[2].answerText).toBe('65-74 år')
      expect(result.questionResults[2].score).toBe(1)
    })

    it('returns 6 question results', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 0, 0, 0, 0]))
      expect(result.questionResults).toHaveLength(6)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateChadsvasc(questionsWithAnswers([0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[5].questionNumber).toBe('6')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createChadsvascQuestions()
      questions[0].answer = null
      questions[4].answer = 2
      const result = calculateChadsvasc(questions)
      expect(result.score).toBe(2)
    })
  })

  describe('Question factory', () => {
    it('createChadsvascQuestions returns 6 questions', () => {
      expect(createChadsvascQuestions()).toHaveLength(6)
    })

    it('binary questions have 2 options', () => {
      const questions = createChadsvascQuestions()
      expect(questions[0].options).toHaveLength(2)
      expect(questions[1].options).toHaveLength(2)
      expect(questions[3].options).toHaveLength(2)
      expect(questions[5].options).toHaveLength(2)
    })

    it('age question has 3 options', () => {
      const questions = createChadsvascQuestions()
      expect(questions[2].options).toHaveLength(3)
    })

    it('S₂ question has Ja value of 2 (double weight)', () => {
      const questions = createChadsvascQuestions()
      const jaOption = questions[4].options.find(o => o.text === 'Ja')
      expect(jaOption?.value).toBe(2)
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createChadsvascQuestions()
      const q2 = createChadsvascQuestions()
      q1[0].answer = 1
      expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(chadsvascConfig.shortName).toBe('CHA₂DS₂-VA')
      expect(chadsvascConfig.defaultAge).toBe(70)
      expect(chadsvascConfig.defaultGender).toBe('Mand')
      expect(chadsvascConfig.minAge).toBe(18)
      expect(chadsvascConfig.maxAge).toBe(110)
      expect(chadsvascConfig.showCpr).toBe(false)
    })

    it('has three thresholds covering 0-8 range', () => {
      expect(chadsvascConfig.thresholds).toHaveLength(3)
      expect(chadsvascConfig.thresholds[0].minScore).toBe(0)
      expect(chadsvascConfig.thresholds[2].maxScore).toBe(8)
    })
  })

  describe('Annual risk rate lookup', () => {
    it('has entries for scores 0 and 1', () => {
      expect(CHADSVASC_ANNUAL_RISK[0]).toBeDefined()
      expect(CHADSVASC_ANNUAL_RISK[1]).toBeDefined()
    })

    it('score 0 has 0% risk', () => {
      expect(CHADSVASC_ANNUAL_RISK[0]).toBe('0%')
    })

    it('score 1 has 1,3% risk', () => {
      expect(CHADSVASC_ANNUAL_RISK[1]).toBe('1,3%')
    })

    it('scores ≥2 use ≥2,2% rate', () => {
      expect(CHADSVASC_ANNUAL_RISK_GTE2).toBe('≥2,2%')
      expect(CHADSVASC_ANNUAL_RISK[2]).toBeUndefined()
    })
  })
})
