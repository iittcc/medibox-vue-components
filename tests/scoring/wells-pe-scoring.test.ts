import { describe, it, expect } from 'vitest'
import { calculateWellsPe, createWellsPeQuestions, wellsPeConfig, WELLS_PE_SECTIONS, WELLS_PE_RECOMMENDATION } from '../../src/scoring/wellsPe'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/wells-pe-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createWellsPeQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('Wells PE Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateWellsPe(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundary', () => {
    it('score 0 → low probability (normal)', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 1.5 → low probability (normal)', () => {
      const result = calculateWellsPe(questionsWithAnswers([1.5, 0, 0, 0, 0, 0, 0]))
      expect(result.score).toBe(1.5)
      expect(result.severity).toBe('normal')
    })

    it('score 2 → moderate probability (moderate)', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 1, 1, 0, 0, 0]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('moderate')
    })

    it('score 5.5 → moderate probability (moderate)', () => {
      const result = calculateWellsPe(questionsWithAnswers([1.5, 1.5, 1, 0, 1.5, 0, 0]))
      expect(result.score).toBe(5.5)
      expect(result.severity).toBe('moderate')
    })

    it('score 6 → high probability (severe)', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 0, 0, 0, 3, 3]))
      expect(result.score).toBe(6)
      expect(result.severity).toBe('severe')
    })

    it('DVT signs + clinical judgment alone gives score 6 (high)', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 0, 0, 0, 3, 3]))
      expect(result.score).toBe(6)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Decimal score handling', () => {
    it('correctly sums 1.5 values', () => {
      const result = calculateWellsPe(questionsWithAnswers([1.5, 1.5, 0, 0, 1.5, 0, 0]))
      expect(result.score).toBe(4.5)
    })

    it('max score is 12.5', () => {
      const result = calculateWellsPe(questionsWithAnswers([1.5, 1.5, 1, 1, 1.5, 3, 3]))
      expect(result.score).toBe(12.5)
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateWellsPe(questionsWithAnswers([1.5, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionText).toContain('Tidligere DVT')
      expect(result.questionResults[0].answerText).toBe('Ja')
      expect(result.questionResults[0].score).toBe(1.5)
    })

    it('returns 7 question results', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults).toHaveLength(7)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateWellsPe(questionsWithAnswers([0, 0, 0, 0, 0, 0, 0]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[6].questionNumber).toBe('7')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createWellsPeQuestions()
      questions[0].answer = null
      questions[5].answer = 3
      const result = calculateWellsPe(questions)
      expect(result.score).toBe(3)
    })
  })

  describe('Question factory', () => {
    it('createWellsPeQuestions returns 7 questions', () => {
      expect(createWellsPeQuestions()).toHaveLength(7)
    })

    it('all questions have 2 options (binary)', () => {
      const questions = createWellsPeQuestions()
      questions.forEach(q => {
        expect(q.options).toHaveLength(2)
      })
    })

    it('questions 1,2,5 have Ja value of 1.5', () => {
      const questions = createWellsPeQuestions()
      expect(questions[0].options.find(o => o.text === 'Ja')?.value).toBe(1.5)
      expect(questions[1].options.find(o => o.text === 'Ja')?.value).toBe(1.5)
      expect(questions[4].options.find(o => o.text === 'Ja')?.value).toBe(1.5)
    })

    it('questions 6,7 have Ja value of 3', () => {
      const questions = createWellsPeQuestions()
      expect(questions[5].options.find(o => o.text === 'Ja')?.value).toBe(3)
      expect(questions[6].options.find(o => o.text === 'Ja')?.value).toBe(3)
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createWellsPeQuestions()
      const q2 = createWellsPeQuestions()
      q1[0].answer = 1.5
      expect(q2[0].answer).toBe(0)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(wellsPeConfig.shortName).toBe('Wells LE')
      expect(wellsPeConfig.defaultAge).toBe(50)
      expect(wellsPeConfig.defaultGender).toBe('Mand')
      expect(wellsPeConfig.minAge).toBe(18)
      expect(wellsPeConfig.maxAge).toBe(110)
      expect(wellsPeConfig.showCpr).toBe(false)
    })

    it('has three thresholds covering 0-12.5 range', () => {
      expect(wellsPeConfig.thresholds).toHaveLength(3)
      expect(wellsPeConfig.thresholds[0].minScore).toBe(0)
      expect(wellsPeConfig.thresholds[2].maxScore).toBe(12.5)
    })
  })

  describe('Sections', () => {
    it('has 4 clinical sections', () => {
      expect(WELLS_PE_SECTIONS).toHaveLength(4)
    })

    it('sections start at correct indices', () => {
      expect(WELLS_PE_SECTIONS[0]).toEqual({ title: 'Prædisponerende faktorer', startIndex: 0 })
      expect(WELLS_PE_SECTIONS[1]).toEqual({ title: 'Symptomer', startIndex: 3 })
      expect(WELLS_PE_SECTIONS[2]).toEqual({ title: 'Kliniske tegn', startIndex: 4 })
      expect(WELLS_PE_SECTIONS[3]).toEqual({ title: 'Klinisk vurdering', startIndex: 6 })
    })
  })

  describe('Recommendations', () => {
    it('has recommendations for all severity levels', () => {
      expect(WELLS_PE_RECOMMENDATION['normal']).toBeDefined()
      expect(WELLS_PE_RECOMMENDATION['moderate']).toBeDefined()
      expect(WELLS_PE_RECOMMENDATION['severe']).toBeDefined()
    })
  })
})
