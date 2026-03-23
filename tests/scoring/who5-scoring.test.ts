import { describe, it, expect } from 'vitest'
import { calculateWho5, createWho5Questions, who5Config } from '../../src/scoring/who5'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/who5-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createWho5Questions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('WHO-5 Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateWho5(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('×4 multiplier', () => {
    it('applies ×4 multiplier to raw sum', () => {
      // Raw sum: 5+5+5+5+5 = 25, final = 100
      const result = calculateWho5(questionsWithAnswers([5, 5, 5, 5, 5]))
      expect(result.score).toBe(100)
    })

    it('all zeros gives score 0', () => {
      const result = calculateWho5(questionsWithAnswers([0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
    })
  })

  describe('Threshold boundaries', () => {
    it('score 51 is normal (no risk)', () => {
      // Need raw sum of 13 → 52 (closest achievable above 51)
      const result = calculateWho5(questionsWithAnswers([3, 3, 3, 2, 2]))
      expect(result.score).toBe(52)
      expect(result.severity).toBe('normal')
    })

    it('score 36 is moderate', () => {
      const result = calculateWho5(questionsWithAnswers([2, 2, 2, 2, 1]))
      expect(result.score).toBe(36)
      expect(result.severity).toBe('moderate')
    })

    it('score 32 is severe', () => {
      const result = calculateWho5(questionsWithAnswers([2, 2, 2, 1, 1]))
      expect(result.score).toBe(32)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Question factory', () => {
    it('createWho5Questions returns 5 questions', () => {
      expect(createWho5Questions()).toHaveLength(5)
    })

    it('each question has 6 options', () => {
      createWho5Questions().forEach(q => {
        expect(q.options).toHaveLength(6)
      })
    })

    it('all initial answers are 5 (highest)', () => {
      createWho5Questions().forEach(q => {
        expect(q.answer).toBe(5)
      })
    })

    it('creates independent instances', () => {
      const q1 = createWho5Questions()
      const q2 = createWho5Questions()
      q1[0].answer = 0
      expect(q2[0].answer).toBe(5)
    })
  })

  describe('Config', () => {
    it('has correct metadata', () => {
      expect(who5Config.shortName).toBe('WHO-5')
      expect(who5Config.defaultAge).toBe(50)
    })

    it('has three thresholds covering 0-100 range', () => {
      expect(who5Config.thresholds).toHaveLength(3)
      expect(who5Config.thresholds[0].minScore).toBe(0)
      expect(who5Config.thresholds[2].maxScore).toBe(100)
    })
  })
})
