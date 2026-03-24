import { describe, it, expect } from 'vitest'
import { calculateAsrs, createAsrsQuestions, asrsConfig, getPositiveB, ASRS_POSITIVE_THRESHOLDS, ASRS_GROUPS } from '../../src/scoring/asrs'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/asrs-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createAsrsQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('ASRS V1.1 Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateAsrs(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Positive threshold boundaries', () => {
    it('A1 at threshold 2 → positive', () => {
      const result = calculateAsrs(questionsWithAnswers([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(1)
    })

    it('A1 below threshold (1) → not positive', () => {
      const result = calculateAsrs(questionsWithAnswers([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
    })

    it('A4 at threshold 3 → positive', () => {
      const result = calculateAsrs(questionsWithAnswers([0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(1)
    })

    it('A4 below threshold (2) → not positive', () => {
      const result = calculateAsrs(questionsWithAnswers([0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
    })

    it('exactly 4 positive A → recommend evaluation', () => {
      const result = calculateAsrs(questionsWithAnswers([2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(4)
      expect(result.severity).toBe('severe')
    })

    it('3 positive A → no ADHD signs', () => {
      const result = calculateAsrs(questionsWithAnswers([2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(3)
      expect(result.severity).toBe('normal')
    })
  })

  describe('Part B positive counting', () => {
    it('B1 at threshold 3 → 1 positive B', () => {
      const questions = questionsWithAnswers([0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      expect(getPositiveB(questions)).toBe(1)
    })

    it('B3 at threshold 2 → 1 positive B', () => {
      const questions = questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      expect(getPositiveB(questions)).toBe(1)
    })

    it('all Part B maxed → 12 positive B', () => {
      const questions = questionsWithAnswers([0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4])
      expect(getPositiveB(questions)).toBe(12)
    })

    it('Part B does not affect score (Part A count)', () => {
      const result = calculateAsrs(questionsWithAnswers([0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]))
      expect(result.score).toBe(0)
    })
  })

  describe('Question factory', () => {
    it('creates 18 questions', () => {
      expect(createAsrsQuestions()).toHaveLength(18)
    })

    it('all questions have 5 options (0-4)', () => {
      createAsrsQuestions().forEach(q => {
        expect(q.options).toHaveLength(5)
        expect(q.options[0].value).toBe(0)
        expect(q.options[4].value).toBe(4)
      })
    })

    it('creates independent instances', () => {
      const q1 = createAsrsQuestions()
      const q2 = createAsrsQuestions()
      q1[0].answer = 4
      expect(q2[0].answer).toBeNull()
    })
  })

  describe('Config', () => {
    it('has correct metadata', () => {
      expect(asrsConfig.shortName).toBe('ASRS')
      expect(asrsConfig.minAge).toBe(18)
    })

    it('has 18 thresholds in lookup arrays', () => {
      expect(ASRS_POSITIVE_THRESHOLDS).toHaveLength(18)
      expect(ASRS_GROUPS).toHaveLength(18)
    })

    it('Part A is first 6 questions', () => {
      expect(ASRS_GROUPS.filter(g => g === 'a')).toHaveLength(6)
      expect(ASRS_GROUPS.filter(g => g === 'b')).toHaveLength(12)
    })
  })

  describe('Question result mapping', () => {
    it('returns 18 question results', () => {
      const result = calculateAsrs(questionsWithAnswers(Array(18).fill(0)))
      expect(result.questionResults).toHaveLength(18)
    })

    it('maps answer text correctly', () => {
      const result = calculateAsrs(questionsWithAnswers([3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].answerText).toBe('Ofte')
      expect(result.questionResults[0].score).toBe(3)
    })
  })
})
