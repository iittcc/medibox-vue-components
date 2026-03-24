import { describe, it, expect } from 'vitest'
import { calculateYbocs, createYbocsQuestions, ybocsConfig, YBOCS_SECTIONS } from '../../src/scoring/ybocs'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/ybocs-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createYbocsQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('Y-BOCS Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateYbocs(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundary', () => {
    it('score 0 → insignificant (normal)', () => {
      const result = calculateYbocs(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 14 → still normal', () => {
      const result = calculateYbocs(questionsWithAnswers([2, 2, 2, 2, 2, 1, 1, 1, 1, 0]))
      expect(result.score).toBe(14)
      expect(result.severity).toBe('normal')
    })

    it('score 15 → mild to moderate', () => {
      const result = calculateYbocs(questionsWithAnswers([2, 2, 2, 2, 2, 1, 1, 1, 1, 1]))
      expect(result.score).toBe(15)
      expect(result.severity).toBe('mild')
    })

    it('score 22 → still mild', () => {
      const result = calculateYbocs(questionsWithAnswers([3, 3, 3, 3, 2, 2, 2, 2, 1, 1]))
      expect(result.score).toBe(22)
      expect(result.severity).toBe('mild')
    })

    it('score 23 → moderate to severe', () => {
      const result = calculateYbocs(questionsWithAnswers([3, 3, 3, 3, 2, 2, 2, 2, 2, 1]))
      expect(result.score).toBe(23)
      expect(result.severity).toBe('moderate')
    })

    it('score 29 → still moderate', () => {
      const result = calculateYbocs(questionsWithAnswers([3, 3, 3, 3, 3, 3, 3, 3, 3, 2]))
      expect(result.score).toBe(29)
      expect(result.severity).toBe('moderate')
    })

    it('score 30 → severe to disabling', () => {
      const result = calculateYbocs(questionsWithAnswers([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]))
      expect(result.score).toBe(30)
      expect(result.severity).toBe('severe')
    })

    it('score 40 → max severe', () => {
      const result = calculateYbocs(questionsWithAnswers([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]))
      expect(result.score).toBe(40)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Subscore validation', () => {
    it('obsessions only (Q1-5 maxed) gives score 20', () => {
      const result = calculateYbocs(questionsWithAnswers([4, 4, 4, 4, 4, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(20)
    })

    it('compulsions only (Q6-10 maxed) gives score 20', () => {
      const result = calculateYbocs(questionsWithAnswers([0, 0, 0, 0, 0, 4, 4, 4, 4, 4]))
      expect(result.score).toBe(20)
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateYbocs(questionsWithAnswers([2, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionText).toContain('Tid optaget af tvangstanker')
      expect(result.questionResults[0].answerText).toContain('En til tre timer')
      expect(result.questionResults[0].score).toBe(2)
    })

    it('returns 10 question results', () => {
      const result = calculateYbocs(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults).toHaveLength(10)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateYbocs(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[9].questionNumber).toBe('10')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createYbocsQuestions()
      questions[0].answer = null
      questions[1].answer = 3
      const result = calculateYbocs(questions)
      expect(result.score).toBe(3)
    })
  })

  describe('Question factory', () => {
    it('createYbocsQuestions returns 10 questions', () => {
      expect(createYbocsQuestions()).toHaveLength(10)
    })

    it('all questions have 5 options (0-4)', () => {
      const questions = createYbocsQuestions()
      questions.forEach(q => {
        expect(q.options).toHaveLength(5)
        expect(q.options[0].value).toBe(0)
        expect(q.options[4].value).toBe(4)
      })
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createYbocsQuestions()
      const q2 = createYbocsQuestions()
      q1[0].answer = 4
      expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(ybocsConfig.shortName).toBe('Y-BOCS')
      expect(ybocsConfig.defaultAge).toBe(30)
      expect(ybocsConfig.showCpr).toBe(false)
    })

    it('has four thresholds covering 0-40 range', () => {
      expect(ybocsConfig.thresholds).toHaveLength(4)
      expect(ybocsConfig.thresholds[0].minScore).toBe(0)
      expect(ybocsConfig.thresholds[3].maxScore).toBe(40)
    })
  })

  describe('Sections', () => {
    it('has 2 clinical sections', () => {
      expect(YBOCS_SECTIONS).toHaveLength(2)
    })

    it('sections start at correct indices', () => {
      expect(YBOCS_SECTIONS[0]).toEqual({ title: 'Tvangstanker', startIndex: 0 })
      expect(YBOCS_SECTIONS[1]).toEqual({ title: 'Tvangsadfærd', startIndex: 5 })
    })
  })
})
