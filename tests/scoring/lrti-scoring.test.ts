import { describe, it, expect } from 'vitest'
import { calculateLrti, createLrtiQuestions, lrtiConfig } from '../../src/scoring/lrti'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/lrti-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createLrtiQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('LRTI Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateLrti(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Binary options', () => {
    it('each question has exactly 2 options (Nej=0, Ja=1)', () => {
      createLrtiQuestions().forEach(q => {
        expect(q.options).toHaveLength(2)
        expect(q.options[0].value).toBe(0)
        expect(q.options[1].value).toBe(1)
      })
    })

    it('all questions use Toggle type', () => {
      createLrtiQuestions().forEach(q => expect(q.type).toBe('Toggle'))
    })
  })

  describe('Question factory', () => {
    it('returns 8 symptom questions', () => {
      expect(createLrtiQuestions()).toHaveLength(8)
    })

    it('all default to 0 (Nej)', () => {
      createLrtiQuestions().forEach(q => expect(q.answer).toBe(0))
    })

    it('creates independent instances', () => {
      const q1 = createLrtiQuestions(); const q2 = createLrtiQuestions()
      q1[0].answer = 1; expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('is a child calculator', () => {
      expect(lrtiConfig.maxAge).toBe(12)
      expect(lrtiConfig.defaultGender).toBe('Dreng')
    })
    it('has 4 thresholds covering 0-8', () => {
      expect(lrtiConfig.thresholds).toHaveLength(4)
      expect(lrtiConfig.thresholds[0].minScore).toBe(0)
      expect(lrtiConfig.thresholds[3].maxScore).toBe(8)
    })
  })
})
