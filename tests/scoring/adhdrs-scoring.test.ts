import { describe, it, expect } from 'vitest'
import { calculateAdhdrs, createAdhdrsQuestions, adhdrsConfig, getAdhdrsSubscores, ADHDRS_SECTIONS } from '../../src/scoring/adhdrs'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/adhdrs-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createAdhdrsQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('ADHD-RS Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateAdhdrs(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundaries', () => {
    it('score 0 → normal', () => {
      const result = calculateAdhdrs(questionsWithAnswers(Array(26).fill(0)))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 60 → still normal', () => {
      const answers = Array(26).fill(0)
      // 20 questions × 3 = 60
      for (let i = 0; i < 20; i++) answers[i] = 3
      const result = calculateAdhdrs(questionsWithAnswers(answers))
      expect(result.score).toBe(60)
      expect(result.severity).toBe('normal')
    })

    it('score 61 → borderline', () => {
      const answers = Array(26).fill(0)
      for (let i = 0; i < 20; i++) answers[i] = 3
      answers[20] = 1
      const result = calculateAdhdrs(questionsWithAnswers(answers))
      expect(result.score).toBe(61)
      expect(result.severity).toBe('moderate')
    })

    it('score 69 → still borderline', () => {
      const answers = Array(26).fill(0)
      for (let i = 0; i < 23; i++) answers[i] = 3
      const result = calculateAdhdrs(questionsWithAnswers(answers))
      expect(result.score).toBe(69)
      expect(result.severity).toBe('moderate')
    })

    it('score 70 → severe', () => {
      const answers = Array(26).fill(0)
      for (let i = 0; i < 23; i++) answers[i] = 3
      answers[23] = 1
      const result = calculateAdhdrs(questionsWithAnswers(answers))
      expect(result.score).toBe(70)
      expect(result.severity).toBe('severe')
    })

    it('score 78 → max severe', () => {
      const result = calculateAdhdrs(questionsWithAnswers(Array(26).fill(3)))
      expect(result.score).toBe(78)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Domain subscores', () => {
    it('computes inattention subscore (items 1-9)', () => {
      const answers = Array(26).fill(0)
      for (let i = 0; i < 9; i++) answers[i] = 2
      const subscores = getAdhdrsSubscores(questionsWithAnswers(answers))
      expect(subscores.inattention).toBe(18)
      expect(subscores.hyperactivityImpulsivity).toBe(0)
      expect(subscores.oppositional).toBe(0)
    })

    it('computes hyperactivity+impulsivity subscore (items 10-18)', () => {
      const answers = Array(26).fill(0)
      for (let i = 9; i < 18; i++) answers[i] = 2
      const subscores = getAdhdrsSubscores(questionsWithAnswers(answers))
      expect(subscores.inattention).toBe(0)
      expect(subscores.hyperactivityImpulsivity).toBe(18)
      expect(subscores.oppositional).toBe(0)
    })

    it('computes oppositional subscore (items 19-26)', () => {
      const answers = Array(26).fill(0)
      for (let i = 18; i < 26; i++) answers[i] = 2
      const subscores = getAdhdrsSubscores(questionsWithAnswers(answers))
      expect(subscores.inattention).toBe(0)
      expect(subscores.hyperactivityImpulsivity).toBe(0)
      expect(subscores.oppositional).toBe(16)
    })

    it('total matches sum of all subscores', () => {
      const answers = Array(26).fill(2)
      const subscores = getAdhdrsSubscores(questionsWithAnswers(answers))
      expect(subscores.total).toBe(subscores.inattention + subscores.hyperactivityImpulsivity + subscores.oppositional)
      expect(subscores.total).toBe(52)
    })
  })

  describe('Question factory', () => {
    it('creates 26 questions', () => {
      expect(createAdhdrsQuestions()).toHaveLength(26)
    })

    it('all questions have 4 options (0-3)', () => {
      createAdhdrsQuestions().forEach(q => {
        expect(q.options).toHaveLength(4)
        expect(q.options[0].value).toBe(0)
        expect(q.options[3].value).toBe(3)
      })
    })

    it('creates independent instances', () => {
      const q1 = createAdhdrsQuestions()
      const q2 = createAdhdrsQuestions()
      q1[0].answer = 3
      expect(q2[0].answer).toBeNull()
    })
  })

  describe('Config', () => {
    it('has correct metadata', () => {
      expect(adhdrsConfig.shortName).toBe('ADHD-RS')
      expect(adhdrsConfig.minAge).toBe(4)
      expect(adhdrsConfig.maxAge).toBe(18)
    })

    it('has three thresholds covering 0-78', () => {
      expect(adhdrsConfig.thresholds).toHaveLength(3)
      expect(adhdrsConfig.thresholds[0].minScore).toBe(0)
      expect(adhdrsConfig.thresholds[2].maxScore).toBe(78)
    })
  })

  describe('Sections', () => {
    it('has 4 domain sections', () => {
      expect(ADHDRS_SECTIONS).toHaveLength(4)
    })
  })
})
