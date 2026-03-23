/**
 * What: Parity tests for the EPDS pure scoring function.
 * How: Tests the scoring function against JSON fixtures representing
 * expected clinical scoring results. Verifies threshold behavior,
 * question result mapping, and edge cases.
 *
 * Why: Ensures the extracted scoring function produces clinically correct
 * results. The >= 10 threshold fix is validated here (was > 10 in legacy code).
 */

import { describe, expect, test } from 'vitest'
import { calculateEpds, createEpdsQuestions, epdsConfig } from '@/scoring/epds'
import type { Question } from '@/scoring/types'
import fixtures from './fixtures/epds-legacy-results.json'

/**
 * What: Helper to set question answers from a numeric array.
 * How: Creates fresh questions and sets each answer to the fixture value.
 */
function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createEpdsQuestions()
  answers.forEach((answer, i) => {
    questions[i].answer = answer
  })
  return questions
}

describe('EPDS Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    test.each(fixtures)(
      '$description',
      ({ answers, expectedScore, expectedSeverity, expectedInterpretation }) => {
        const questions = questionsWithAnswers(answers)
        const result = calculateEpds(questions)

        expect(result.score).toBe(expectedScore)
        expect(result.severity).toBe(expectedSeverity)
        expect(result.interpretation).toBe(expectedInterpretation)
      }
    )
  })

  describe('Threshold boundary — REGRESSION FIX', () => {
    // Why: The legacy code used > 10 (score 10 = no depression).
    // The clinical standard is >= 10 (score 10 = possible depression).
    // This test locks in the correct behavior.
    test('score of exactly 10 triggers depression (>= 10, not > 10)', () => {
      const questions = questionsWithAnswers([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
      const result = calculateEpds(questions)

      expect(result.score).toBe(10)
      expect(result.severity).toBe('severe')
      expect(result.interpretation).toBe(
        'Behandlingskrævende depression kan foreligge.'
      )
    })

    test('score of 9 does not trigger depression', () => {
      const questions = questionsWithAnswers([1, 1, 1, 1, 1, 1, 1, 1, 1, 0])
      const result = calculateEpds(questions)

      expect(result.score).toBe(9)
      expect(result.severity).toBe('normal')
      expect(result.interpretation).toBe(
        'Ikke tegn til alvorlig depression.'
      )
    })
  })

  describe('Question result mapping', () => {
    test('maps question text and selected answer text correctly', () => {
      const questions = questionsWithAnswers([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      const result = calculateEpds(questions)

      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[0].questionText).toContain(
        'le og se tingene fra den humoristiske side'
      )
      expect(result.questionResults[0].answerText).toBe(
        'Afgjort ikke så meget som tidligere'
      )
      expect(result.questionResults[0].score).toBe(2)
    })

    test('returns 10 question results', () => {
      const questions = questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      const result = calculateEpds(questions)

      expect(result.questionResults).toHaveLength(10)
    })

    test('question numbers are 1-indexed strings', () => {
      const questions = questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      const result = calculateEpds(questions)

      const numbers = result.questionResults.map(qr => qr.questionNumber)
      expect(numbers).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    })
  })

  describe('Null answer handling', () => {
    test('null answers are treated as 0', () => {
      const questions = createEpdsQuestions()
      questions[0].answer = null
      questions[1].answer = null
      questions[2].answer = 3

      const result = calculateEpds(questions)
      expect(result.score).toBe(3)
    })
  })

  describe('Question factory', () => {
    test('createEpdsQuestions returns 10 questions', () => {
      const questions = createEpdsQuestions()
      expect(questions).toHaveLength(10)
    })

    test('each question has 4 options', () => {
      const questions = createEpdsQuestions()
      questions.forEach(q => {
        expect(q.options).toHaveLength(4)
      })
    })

    test('all initial answers are 0', () => {
      const questions = createEpdsQuestions()
      questions.forEach(q => {
        expect(q.answer).toBe(0)
      })
    })

    test('creates independent instances (no shared state)', () => {
      const a = createEpdsQuestions()
      const b = createEpdsQuestions()
      a[0].answer = 3
      expect(b[0].answer).toBe(0)
    })

    test('options include reverse-scored questions (3,2,1,0 pattern)', () => {
      const questions = createEpdsQuestions()
      // Question 3 has reverse scoring
      const q3values = questions[2].options.map(o => o.value)
      expect(q3values).toEqual([3, 2, 1, 0])
    })
  })

  describe('Config', () => {
    test('has correct calculator metadata', () => {
      expect(epdsConfig.name).toBe('Edinburgh Postnatal Depression Scale')
      expect(epdsConfig.shortName).toBe('EPDS')
      expect(epdsConfig.showCpr).toBe(true)
    })

    test('has two thresholds covering 0-30 range', () => {
      expect(epdsConfig.thresholds).toHaveLength(2)
      expect(epdsConfig.thresholds[0].minScore).toBe(0)
      expect(epdsConfig.thresholds[0].maxScore).toBe(9)
      expect(epdsConfig.thresholds[1].minScore).toBe(10)
      expect(epdsConfig.thresholds[1].maxScore).toBe(30)
    })
  })
})
