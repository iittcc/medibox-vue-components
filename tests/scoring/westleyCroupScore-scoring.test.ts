import { describe, it, expect } from 'vitest'
import { calculateWestleyCroup, createWestleyCroupQuestions, westleyCroupConfig } from '../../src/scoring/westleyCroupScore'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/westleyCroupScore-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createWestleyCroupQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('Westley Croup Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateWestleyCroup(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Question factory', () => {
    it('returns 5 questions', () => { expect(createWestleyCroupQuestions()).toHaveLength(5) })
    it('questions have different option counts', () => {
      const q = createWestleyCroupQuestions()
      expect(q[0].options).toHaveLength(2)
      expect(q[1].options).toHaveLength(3)
      expect(q[3].options).toHaveLength(3)
      expect(q[4].options).toHaveLength(4)
    })
    it('creates independent instances', () => {
      const q1 = createWestleyCroupQuestions(); const q2 = createWestleyCroupQuestions()
      q1[0].answer = 5; expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('is a child calculator', () => {
      expect(westleyCroupConfig.maxAge).toBe(12)
      expect(westleyCroupConfig.defaultAge).toBe(6)
      expect(westleyCroupConfig.defaultGender).toBe('Dreng')
    })
  })
})
