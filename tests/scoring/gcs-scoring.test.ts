import { describe, it, expect } from 'vitest'
import { calculateGcs, createGcsQuestions, gcsConfig } from '../../src/scoring/gcs'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/gcs-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createGcsQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('GCS Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateGcs(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Question factory', () => {
    it('returns 3 questions', () => { expect(createGcsQuestions()).toHaveLength(3) })
    it('defaults to best response (highest values)', () => {
      const q = createGcsQuestions()
      expect(q[0].answer).toBe(4)
      expect(q[1].answer).toBe(5)
      expect(q[2].answer).toBe(6)
    })
    it('questions have different option counts (4, 5, 6)', () => {
      const q = createGcsQuestions()
      expect(q[0].options).toHaveLength(4)
      expect(q[1].options).toHaveLength(5)
      expect(q[2].options).toHaveLength(6)
    })
    it('creates independent instances', () => {
      const q1 = createGcsQuestions(); const q2 = createGcsQuestions()
      q1[0].answer = 1; expect(q2[0].answer).toBe(4)
    })
  })

  describe('Config', () => {
    it('has 4 thresholds covering 3-15 range', () => {
      expect(gcsConfig.thresholds).toHaveLength(4)
      expect(gcsConfig.thresholds[0].minScore).toBe(3)
      expect(gcsConfig.thresholds[3].maxScore).toBe(15)
    })
  })
})
