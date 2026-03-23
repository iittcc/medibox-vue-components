import { describe, it, expect } from 'vitest'
import { calculateAudit, createAuditQuestions, auditConfig } from '../../src/scoring/audit'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/audit-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createAuditQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('AUDIT Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateAudit(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundary', () => {
    it('score of exactly 8 triggers alcohol dependence (>= 8)', () => {
      const result = calculateAudit(questionsWithAnswers([2, 2, 2, 2, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(8)
      expect(result.severity).toBe('severe')
    })

    it('score of 7 does not trigger alcohol dependence', () => {
      const result = calculateAudit(questionsWithAnswers([2, 2, 2, 1, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(7)
      expect(result.severity).toBe('normal')
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateAudit(questionsWithAnswers([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionText).toContain('Hvor tit drikker du alkohol')
      expect(result.questionResults[0].answerText).toBe('Månedligt eller sjældnere')
      expect(result.questionResults[0].score).toBe(1)
    })

    it('returns 10 question results', () => {
      const result = calculateAudit(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults).toHaveLength(10)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateAudit(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[9].questionNumber).toBe('10')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createAuditQuestions()
      questions[0].answer = null
      questions[1].answer = 4
      const result = calculateAudit(questions)
      expect(result.score).toBe(4)
    })
  })

  describe('Question factory', () => {
    it('createAuditQuestions returns 10 questions', () => {
      expect(createAuditQuestions()).toHaveLength(10)
    })

    it('questions 9 and 10 have 3 options (not 5)', () => {
      const questions = createAuditQuestions()
      expect(questions[8].options).toHaveLength(3)
      expect(questions[9].options).toHaveLength(3)
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createAuditQuestions()
      const q2 = createAuditQuestions()
      q1[0].answer = 4
      expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(auditConfig.shortName).toBe('AUDIT')
      expect(auditConfig.defaultAge).toBe(50)
      expect(auditConfig.defaultGender).toBe('Mand')
    })

    it('has two thresholds covering 0-40 range', () => {
      expect(auditConfig.thresholds).toHaveLength(2)
      expect(auditConfig.thresholds[0].minScore).toBe(0)
      expect(auditConfig.thresholds[1].maxScore).toBe(40)
    })
  })
})
