import { describe, it, expect } from 'vitest'
import { calculateHama, createHamaQuestions, hamaConfig, HAMA_TOOLTIPS } from '../../src/scoring/hama'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/hama-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createHamaQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('HAMA Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateHama(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Question factory', () => {
    it('returns 14 questions', () => {
      expect(createHamaQuestions()).toHaveLength(14)
    })

    it('all questions have descriptions (tooltips)', () => {
      createHamaQuestions().forEach(q => expect(q.description).toBeTruthy())
    })

    it('all questions have 5 options (0-4)', () => {
      createHamaQuestions().forEach(q => {
        expect(q.options).toHaveLength(5)
        expect(q.options[0].value).toBe(0)
        expect(q.options[4].value).toBe(4)
      })
    })

    it('all questions default to answer: null', () => {
      createHamaQuestions().forEach(q => expect(q.answer).toBeNull())
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createHamaQuestions()
      const q2 = createHamaQuestions()
      q1[0].answer = 4
      expect(q2[0].answer).toBeNull()
    })
  })

  describe('Tooltips', () => {
    it('has 14 tooltip entries', () => {
      expect(Object.keys(HAMA_TOOLTIPS)).toHaveLength(14)
    })
  })

  describe('Config', () => {
    it('has 5 thresholds covering 0-56 range', () => {
      expect(hamaConfig.thresholds).toHaveLength(5)
      expect(hamaConfig.thresholds[0].minScore).toBe(0)
      expect(hamaConfig.thresholds[4].maxScore).toBe(56)
    })

    it('shortName is HAMA', () => {
      expect(hamaConfig.shortName).toBe('HAMA')
    })
  })

  describe('Question results', () => {
    it('maps question numbers and texts correctly', () => {
      const result = calculateHama(questionsWithAnswers([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[0].questionText).toBe('1. Angst')
      expect(result.questionResults[0].answerText).toBe('Let grad')
      expect(result.questionResults[0].score).toBe(1)
    })
  })
})
