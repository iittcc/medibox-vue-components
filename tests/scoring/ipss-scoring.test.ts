import { describe, it, expect } from 'vitest'
import { calculateIpss, createIpssQuestions, ipssConfig } from '../../src/scoring/ipss'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/ipss-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createIpssQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('IPSS Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateIpss(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Question factory', () => {
    it('returns 7 questions', () => { expect(createIpssQuestions()).toHaveLength(7) })
    it('all questions have descriptions', () => {
      createIpssQuestions().forEach(q => expect(q.description).toBeTruthy())
    })
    it('question 7 (Nykturi) has different options', () => {
      const q = createIpssQuestions()
      expect(q[6].options[0].text).toBe('Ingen')
    })
    it('creates independent instances', () => {
      const q1 = createIpssQuestions(); const q2 = createIpssQuestions()
      q1[0].answer = 5; expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has 4 thresholds covering 0-35 range', () => {
      expect(ipssConfig.thresholds).toHaveLength(4)
      expect(ipssConfig.thresholds[0].minScore).toBe(0)
      expect(ipssConfig.thresholds[3].maxScore).toBe(35)
    })
  })
})
