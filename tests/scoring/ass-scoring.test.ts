import { describe, it, expect } from 'vitest'
import { calculateAss, createAssQuestions, assConfig, getAssInterpretation, ASS_CATEGORIES } from '../../src/scoring/ass'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/ass-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createAssQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('ASS Scoring Function', () => {
  describe('Parity tests', () => {
    it.each(fixtures)('$description', (fixture) => {
      const questions = questionsWithAnswers(fixture.answers)
      const interp = getAssInterpretation(questions)
      const result = calculateAss(questions)

      expect(result.score).toBe(fixture.expectedTotalScore)
      expect(interp.hasFunctionalImpairment).toBe(fixture.expectedHasFunctionalImpairment)
      expect(interp.coreAnxietyScore).toBe(fixture.expectedCoreAnxietyScore)

      if (fixture.expectedHighestCategories) {
        expect(interp.highestCategories).toEqual(fixture.expectedHighestCategories)
      }
      if (fixture.expectedHighestScore !== undefined) {
        expect(interp.highestScore).toBe(fixture.expectedHighestScore)
      }
    })
  })

  describe('Question factory', () => {
    it('returns 10 questions', () => {
      expect(createAssQuestions()).toHaveLength(10)
    })

    it('all questions have 6 options (0-5)', () => {
      createAssQuestions().forEach(q => {
        expect(q.options).toHaveLength(6)
        expect(q.options[0].value).toBe(0)
        expect(q.options[5].value).toBe(5)
      })
    })

    it('all questions default to answer: null', () => {
      createAssQuestions().forEach(q => expect(q.answer).toBeNull())
    })

    it('creates independent instances', () => {
      const q1 = createAssQuestions()
      const q2 = createAssQuestions()
      q1[0].answer = 5
      expect(q2[0].answer).toBeNull()
    })
  })

  describe('Functional impairment threshold', () => {
    it('item 10 score 2 → no functional impairment', () => {
      const interp = getAssInterpretation(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 2]))
      expect(interp.hasFunctionalImpairment).toBe(false)
    })

    it('item 10 score 3 → functional impairment', () => {
      const interp = getAssInterpretation(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 3]))
      expect(interp.hasFunctionalImpairment).toBe(true)
    })
  })

  describe('Core anxiety score (items 1-3)', () => {
    it('computes sum of first 3 items', () => {
      const interp = getAssInterpretation(questionsWithAnswers([5, 5, 5, 0, 0, 0, 0, 0, 0, 0]))
      expect(interp.coreAnxietyScore).toBe(15)
    })
  })

  describe('Category mapping', () => {
    it('has 6 symptom categories', () => {
      expect(ASS_CATEGORIES).toHaveLength(6)
    })

    it('categories cover items 1-9', () => {
      const allItems = ASS_CATEGORIES.flatMap(c => c.items).sort((a, b) => a - b)
      expect(allItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('Interpretation text', () => {
    it('no impairment: interpretation mentions insufficient impairment', () => {
      const result = calculateAss(questionsWithAnswers([3, 3, 3, 0, 0, 0, 0, 0, 0, 2]))
      expect(result.interpretation).toContain('ikke nok påvirkning')
    })

    it('with impairment: interpretation includes all 4 parts (a-d)', () => {
      const result = calculateAss(questionsWithAnswers([3, 3, 3, 0, 0, 0, 0, 0, 0, 3]))
      expect(result.interpretation).toContain('tilstrækkelig påvirkning')
      expect(result.interpretation).toContain('højeste score')
      expect(result.interpretation).toContain('egentlige angstsymptomer')
      expect(result.interpretation).toContain('Total angstscore')
    })
  })

  describe('Config', () => {
    it('shortName is ASS', () => {
      expect(assConfig.shortName).toBe('ASS')
    })
  })
})
