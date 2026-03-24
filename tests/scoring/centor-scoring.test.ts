import { describe, it, expect } from 'vitest'
import {
  calculateCentor,
  createCentorQuestions,
  centorConfig,
  CENTOR_AGE_SCORE_MAP,
  AGE_QUESTION_INDEX
} from '../../src/scoring/centor'
import type { Question } from '../../src/scoring/types'
import fixtures from './fixtures/centor-legacy-results.json'

function questionsWithAnswers(answers: number[]): Question[] {
  const questions = createCentorQuestions()
  answers.forEach((answer, i) => {
    if (i < questions.length) questions[i].answer = answer
  })
  return questions
}

describe('Modified Centor Criteria Scoring Function', () => {
  describe('Parity tests against clinical fixtures', () => {
    it.each(fixtures)('$description', (fixture) => {
      const result = calculateCentor(questionsWithAnswers(fixture.answers))
      expect(result.score).toBe(fixture.expectedScore)
      expect(result.severity).toBe(fixture.expectedSeverity)
      expect(result.interpretation).toBe(fixture.expectedInterpretation)
    })
  })

  describe('Threshold boundaries', () => {
    it('score -1 → low probability (normal)', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 0]))
      expect(result.score).toBe(-1)
      expect(result.severity).toBe('normal')
    })

    it('score 0 → low probability (normal)', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 2]))
      expect(result.score).toBe(0)
      expect(result.severity).toBe('normal')
    })

    it('score 1 → low probability (normal)', () => {
      const result = calculateCentor(questionsWithAnswers([1, 0, 0, 0, 2]))
      expect(result.score).toBe(1)
      expect(result.severity).toBe('normal')
    })

    it('score 2 → moderate probability (moderate)', () => {
      const result = calculateCentor(questionsWithAnswers([1, 1, 0, 0, 2]))
      expect(result.score).toBe(2)
      expect(result.severity).toBe('moderate')
    })

    it('score 3 → moderate probability (moderate)', () => {
      const result = calculateCentor(questionsWithAnswers([1, 1, 1, 0, 2]))
      expect(result.score).toBe(3)
      expect(result.severity).toBe('moderate')
    })

    it('score 4 → high probability (severe)', () => {
      const result = calculateCentor(questionsWithAnswers([1, 1, 1, 1, 2]))
      expect(result.score).toBe(4)
      expect(result.severity).toBe('severe')
    })

    it('score 5 → high probability (severe)', () => {
      const result = calculateCentor(questionsWithAnswers([1, 1, 1, 1, 1]))
      expect(result.score).toBe(5)
      expect(result.severity).toBe('severe')
    })
  })

  describe('Age scoring', () => {
    it('age under 3 scores -1', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 0]))
      expect(result.questionResults[AGE_QUESTION_INDEX].score).toBe(-1)
      expect(result.questionResults[AGE_QUESTION_INDEX].answerText).toBe('Under 3 år')
    })

    it('age 3-14 scores +1', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 1]))
      expect(result.questionResults[AGE_QUESTION_INDEX].score).toBe(1)
      expect(result.questionResults[AGE_QUESTION_INDEX].answerText).toBe('3-14 år')
    })

    it('age 15-44 scores 0', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 2]))
      expect(result.questionResults[AGE_QUESTION_INDEX].score).toBe(0)
      expect(result.questionResults[AGE_QUESTION_INDEX].answerText).toBe('15-44 år')
    })

    it('age over 45 scores -1', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 3]))
      expect(result.questionResults[AGE_QUESTION_INDEX].score).toBe(-1)
      expect(result.questionResults[AGE_QUESTION_INDEX].answerText).toBe('Over 45 år')
    })

    it('age over 45 and under 3 both score -1 but have different answer text', () => {
      const resultUnder3 = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 0]))
      const resultOver45 = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 3]))
      expect(resultUnder3.questionResults[AGE_QUESTION_INDEX].score).toBe(-1)
      expect(resultOver45.questionResults[AGE_QUESTION_INDEX].score).toBe(-1)
      expect(resultUnder3.questionResults[AGE_QUESTION_INDEX].answerText).toBe('Under 3 år')
      expect(resultOver45.questionResults[AGE_QUESTION_INDEX].answerText).toBe('Over 45 år')
    })
  })

  describe('Question result mapping', () => {
    it('maps question text and selected answer text correctly', () => {
      const result = calculateCentor(questionsWithAnswers([1, 0, 0, 0, 2]))
      expect(result.questionResults[0].questionText).toContain('Feber')
      expect(result.questionResults[0].answerText).toBe('Ja')
      expect(result.questionResults[0].score).toBe(1)
    })

    it('returns 5 question results', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 2]))
      expect(result.questionResults).toHaveLength(5)
    })

    it('question numbers are 1-indexed strings', () => {
      const result = calculateCentor(questionsWithAnswers([0, 0, 0, 0, 2]))
      expect(result.questionResults[0].questionNumber).toBe('1')
      expect(result.questionResults[4].questionNumber).toBe('5')
    })
  })

  describe('Null answer handling', () => {
    it('null answers are treated as 0', () => {
      const questions = createCentorQuestions()
      questions[0].answer = null
      questions[1].answer = 1
      const result = calculateCentor(questions)
      expect(result.questionResults[0].score).toBe(0)
      expect(result.questionResults[1].score).toBe(1)
    })

    it('null age answer maps to score via CENTOR_AGE_SCORE_MAP[0]', () => {
      const questions = createCentorQuestions()
      questions[AGE_QUESTION_INDEX].answer = null
      const result = calculateCentor(questions)
      expect(result.questionResults[AGE_QUESTION_INDEX].score).toBe(CENTOR_AGE_SCORE_MAP[0])
    })
  })

  describe('Question factory', () => {
    it('createCentorQuestions returns 5 questions', () => {
      expect(createCentorQuestions()).toHaveLength(5)
    })

    it('binary questions have 2 options', () => {
      const questions = createCentorQuestions()
      expect(questions[0].options).toHaveLength(2)
      expect(questions[1].options).toHaveLength(2)
      expect(questions[2].options).toHaveLength(2)
      expect(questions[3].options).toHaveLength(2)
    })

    it('age question has 4 options', () => {
      const questions = createCentorQuestions()
      expect(questions[AGE_QUESTION_INDEX].options).toHaveLength(4)
    })

    it('age options have unique values (0, 1, 2, 3)', () => {
      const questions = createCentorQuestions()
      const values = questions[AGE_QUESTION_INDEX].options.map(o => o.value)
      expect(values).toEqual([0, 1, 2, 3])
    })

    it('creates independent instances (no shared state)', () => {
      const q1 = createCentorQuestions()
      const q2 = createCentorQuestions()
      q1[0].answer = 1
      expect(q2[0].answer).toBe(0)
    })

    it('default age answer is 2 (15-44 år)', () => {
      const questions = createCentorQuestions()
      expect(questions[AGE_QUESTION_INDEX].answer).toBe(2)
    })
  })

  describe('Config', () => {
    it('has correct calculator metadata', () => {
      expect(centorConfig.shortName).toBe('Centor')
      expect(centorConfig.defaultAge).toBe(25)
      expect(centorConfig.defaultGender).toBe('Mand')
      expect(centorConfig.minAge).toBe(1)
      expect(centorConfig.maxAge).toBe(110)
      expect(centorConfig.showCpr).toBe(false)
    })

    it('has three thresholds covering -1 to 5 range', () => {
      expect(centorConfig.thresholds).toHaveLength(3)
      expect(centorConfig.thresholds[0].minScore).toBe(-1)
      expect(centorConfig.thresholds[2].maxScore).toBe(5)
    })
  })

  describe('Age score map', () => {
    it('maps ordinal values to clinical scores', () => {
      expect(CENTOR_AGE_SCORE_MAP[0]).toBe(-1)
      expect(CENTOR_AGE_SCORE_MAP[1]).toBe(1)
      expect(CENTOR_AGE_SCORE_MAP[2]).toBe(0)
      expect(CENTOR_AGE_SCORE_MAP[3]).toBe(-1)
    })
  })
})
