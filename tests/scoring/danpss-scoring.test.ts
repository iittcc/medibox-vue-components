import { describe, it, expect } from 'vitest'
import { calculateDanpss, createDanpssQuestions, danpssConfig } from '../../src/scoring/danpss'
import type { DanpssQuestion } from '../../src/scoring/danpss'
import fixtures from './fixtures/danpss-legacy-results.json'

function questionsWithAnswers(answers: [number | null, number | null][]): DanpssQuestion[] {
  const questions = createDanpssQuestions()
  answers.forEach(([a, b], i) => {
    if (i < questions.length) {
      questions[i].answerA = a
      questions[i].answerB = b
    }
  })
  return questions
}

describe('DANPSS Scoring Function', () => {
  describe('Parity tests against fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateDanpss(questionsWithAnswers(fixture.answers as [number | null, number | null][]))
      expect(result.totalAB).toBe(fixture.expectedTotalAB)
      expect(result.severity).toBe(fixture.expectedSeverity)
      if (fixture.expectedSexualTotalAB !== undefined) {
        expect(result.sexualSection).not.toBeNull()
        expect(result.sexualSection!.totalAB).toBe(fixture.expectedSexualTotalAB)
      }
    })
  })

  describe('Product scoring (A × B)', () => {
    it('score per question is A × B, not A + B', () => {
      const q = createDanpssQuestions()
      q[0].answerA = 2
      q[0].answerB = 3
      const result = calculateDanpss(q)
      expect(result.questionResults[0].scoreAB).toBe(6)
    })

    it('A=0 makes product 0 regardless of B', () => {
      const q = createDanpssQuestions()
      q[0].answerA = 0
      q[0].answerB = 3
      const result = calculateDanpss(q)
      expect(result.questionResults[0].scoreAB).toBe(0)
    })
  })

  describe('Section totals', () => {
    it('has 3 main sections (Tømning, Fyldning, Andre symptomer)', () => {
      const result = calculateDanpss(createDanpssQuestions())
      expect(result.sections).toHaveLength(3)
      expect(result.sections.map(s => s.name)).toEqual(['Tømning', 'Fyldning', 'Andre symptomer'])
    })

    it('total excludes section 4 (sexual function)', () => {
      const q = createDanpssQuestions()
      // Set all to 0, then add a sexual function score
      q[12].answerA = 3; q[12].answerB = 3
      q[13].answerA = 3; q[13].answerB = 3
      q[14].answerA = 3; q[14].answerB = 3
      const result = calculateDanpss(q)
      expect(result.totalAB).toBe(0) // Only sections 1-3
      expect(result.sexualSection!.totalAB).toBe(27)
    })
  })

  describe('Optional sexual function', () => {
    it('sexual section is null when not all questions answered', () => {
      const result = calculateDanpss(createDanpssQuestions())
      expect(result.sexualSection).toBeNull()
      expect(result.allSexualAnswered).toBe(false)
    })

    it('sexual section is populated when all 3 questions answered', () => {
      const q = createDanpssQuestions()
      q[12].answerA = 0; q[12].answerB = 0
      q[13].answerA = 0; q[13].answerB = 0
      q[14].answerA = 0; q[14].answerB = 0
      const result = calculateDanpss(q)
      expect(result.sexualSection).not.toBeNull()
      expect(result.allSexualAnswered).toBe(true)
    })
  })

  describe('Question factory', () => {
    it('creates 15 questions (4+4+4+3)', () => {
      expect(createDanpssQuestions()).toHaveLength(15)
    })

    it('sections have correct question counts', () => {
      const q = createDanpssQuestions()
      expect(q.filter(x => x.section === 'Tømning')).toHaveLength(4)
      expect(q.filter(x => x.section === 'Fyldning')).toHaveLength(4)
      expect(q.filter(x => x.section === 'Andre symptomer')).toHaveLength(4)
      expect(q.filter(x => x.section === 'Seksualfunktion')).toHaveLength(3)
    })

    it('creates independent instances', () => {
      const q1 = createDanpssQuestions(); const q2 = createDanpssQuestions()
      q1[0].answerA = 3; expect(q2[0].answerA).toBeNull()
    })
  })

  describe('Config', () => {
    it('has 3 thresholds covering 0-108', () => {
      expect(danpssConfig.thresholds).toHaveLength(3)
      expect(danpssConfig.thresholds[0].minScore).toBe(0)
      expect(danpssConfig.thresholds[2].maxScore).toBe(108)
    })
  })
})
