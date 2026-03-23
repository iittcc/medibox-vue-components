import { describe, it, expect } from 'vitest'
import { calculatePuqe, createPuqeQuestions, puqeConfig } from '../../src/scoring/puqe'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/puqe-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createPuqeQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('PUQE Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculatePuqe(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Question factory', () => {
    it('returns 3 questions', () => { expect(createPuqeQuestions()).toHaveLength(3) })
    it('all initial answers are 1 (minimum)', () => {
      createPuqeQuestions().forEach(q => expect(q.answer).toBe(1))
    })
    it('creates independent instances', () => {
      const q1 = createPuqeQuestions(); const q2 = createPuqeQuestions()
      q1[0].answer = 5; expect(q2[0].answer).toBe(1)
    })
  })

  describe('Config', () => {
    it('has correct metadata', () => {
      expect(puqeConfig.shortName).toBe('PUQE')
      expect(puqeConfig.defaultGender).toBe('Kvinde')
    })
    it('has three thresholds covering 3-15 range', () => {
      expect(puqeConfig.thresholds).toHaveLength(3)
      expect(puqeConfig.thresholds[0].minScore).toBe(3)
      expect(puqeConfig.thresholds[2].maxScore).toBe(15)
    })
  })
})
