import { describe, it, expect } from 'vitest'
import { calculateCmdq, createCmdqQuestions, cmdqConfig, getCmdqSubscaleScores, CMDQ_SUBSCALES } from '../../src/scoring/cmdq'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/cmdq-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createCmdqQuestions()
  answers.forEach((a, i) => { if (i < questions.length) questions[i].answer = a })
  return questions
}

describe('CMDQ Scoring Function', () => {
  describe('Parity tests — subscale scores', () => {
    it.each(fixtures)('$description', (fixture) => {
      const questions = questionsWithAnswers(fixture.answers)
      const subscales = getCmdqSubscaleScores(questions)
      const result = calculateCmdq(questions)

      expect(result.score).toBe(fixture.expectedPositiveCount)

      for (const sub of subscales) {
        const expected = (fixture.expectedSubscales as Record<string, { score: number, positive: boolean }>)[sub.key]
        expect(sub.score).toBe(expected.score)
        expect(sub.positive).toBe(expected.positive)
      }
    })
  })

  describe('Question factory', () => {
    it('returns 33 questions', () => {
      expect(createCmdqQuestions()).toHaveLength(33)
    })

    it('items 1-29 have 5 options (0-4)', () => {
      const questions = createCmdqQuestions()
      for (let i = 0; i < 29; i++) {
        expect(questions[i].options).toHaveLength(5)
        expect(questions[i].options[0].value).toBe(0)
        expect(questions[i].options[4].value).toBe(4)
      }
    })

    it('items 30-33 have 2 binary options (Nej/Ja)', () => {
      const questions = createCmdqQuestions()
      for (let i = 29; i < 33; i++) {
        expect(questions[i].options).toHaveLength(2)
        expect(questions[i].options[0].text).toBe('Nej')
        expect(questions[i].options[0].value).toBe(0)
        expect(questions[i].options[1].text).toBe('Ja')
        expect(questions[i].options[1].value).toBe(1)
      }
    })

    it('all questions default to answer: null', () => {
      createCmdqQuestions().forEach(q => expect(q.answer).toBeNull())
    })

    it('creates independent instances', () => {
      const q1 = createCmdqQuestions()
      const q2 = createCmdqQuestions()
      q1[0].answer = 4
      expect(q2[0].answer).toBeNull()
    })
  })

  describe('Subscale definitions', () => {
    it('has 5 subscales', () => {
      expect(CMDQ_SUBSCALES).toHaveLength(5)
    })

    it('subscale ranges cover all 33 questions without gaps', () => {
      expect(CMDQ_SUBSCALES[0].startIndex).toBe(0)
      for (let i = 1; i < CMDQ_SUBSCALES.length; i++) {
        expect(CMDQ_SUBSCALES[i].startIndex).toBe(CMDQ_SUBSCALES[i - 1].endIndex)
      }
      expect(CMDQ_SUBSCALES[CMDQ_SUBSCALES.length - 1].endIndex).toBe(33)
    })

    it('screening thresholds match clinical guidelines', () => {
      const thresholds = CMDQ_SUBSCALES.map(s => ({ key: s.key, threshold: s.threshold }))
      expect(thresholds).toEqual([
        { key: 'symptom', threshold: 6 },
        { key: 'helbredsangst', threshold: 2 },
        { key: 'angsttilstand', threshold: 2 },
        { key: 'depression', threshold: 3 },
        { key: 'alkoholproblem', threshold: 2 }
      ])
    })
  })

  describe('Config', () => {
    it('shortName is CMDQ', () => {
      expect(cmdqConfig.shortName).toBe('CMDQ')
    })
  })

  describe('Interpretation includes subscale results', () => {
    it('interpretation contains all 5 subscale labels', () => {
      const result = calculateCmdq(questionsWithAnswers(new Array(33).fill(0)))
      for (const sub of CMDQ_SUBSCALES) {
        expect(result.interpretation).toContain(sub.label)
      }
    })

    it('marks positive screenings in interpretation', () => {
      const answers = new Array(33).fill(0)
      // Set symptom scores to 6 (positive threshold)
      for (let i = 0; i < 6; i++) answers[i] = 1
      const result = calculateCmdq(questionsWithAnswers(answers))
      expect(result.interpretation).toContain('POSITIV SCREENING')
    })
  })
})
