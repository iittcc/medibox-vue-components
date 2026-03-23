import { describe, it, expect } from 'vitest'
import { calculateSimpleSum } from '../../src/scoring/utils'
import type { Question, ScoringThreshold } from '../../src/scoring/types'

const testThresholds: ScoringThreshold[] = [
  { minScore: 0, maxScore: 7, interpretation: 'Normal', severity: 'normal' },
  { minScore: 8, maxScore: 15, interpretation: 'Moderate', severity: 'moderate' },
  { minScore: 16, maxScore: 30, interpretation: 'Severe', severity: 'severe' }
]

function makeQuestions(answers: number[]): Question[] {
  return answers.map((answer, i) => ({
    type: 'Listbox',
    text: `Question ${i + 1}`,
    options: [
      { text: 'None', value: 0 },
      { text: 'Mild', value: 1 },
      { text: 'Moderate', value: 2 },
      { text: 'Severe', value: 3 }
    ],
    answer
  }))
}

describe('calculateSimpleSum', () => {
  it('sums all question answers correctly', () => {
    const result = calculateSimpleSum(makeQuestions([1, 2, 3]), testThresholds)
    expect(result.score).toBe(6)
  })

  it('applies threshold interpretation correctly', () => {
    const normal = calculateSimpleSum(makeQuestions([1, 2, 3]), testThresholds)
    expect(normal.severity).toBe('normal')
    expect(normal.interpretation).toBe('Normal')

    const moderate = calculateSimpleSum(makeQuestions([3, 3, 3]), testThresholds)
    expect(moderate.severity).toBe('moderate')
    expect(moderate.interpretation).toBe('Moderate')
  })

  it('handles threshold boundary correctly (>= minScore)', () => {
    // Score exactly 8 should be moderate
    const atBoundary = calculateSimpleSum(makeQuestions([3, 3, 2]), testThresholds)
    expect(atBoundary.score).toBe(8)
    expect(atBoundary.severity).toBe('moderate')

    // Score exactly 7 should be normal
    const belowBoundary = calculateSimpleSum(makeQuestions([3, 3, 1]), testThresholds)
    expect(belowBoundary.score).toBe(7)
    expect(belowBoundary.severity).toBe('normal')
  })

  it('treats null answers as 0', () => {
    const questions = makeQuestions([1, 2, 3])
    questions[1].answer = null
    const result = calculateSimpleSum(questions, testThresholds)
    expect(result.score).toBe(4)
  })

  it('returns empty interpretation when no threshold matches', () => {
    const noMatch: ScoringThreshold[] = [
      { minScore: 10, maxScore: 20, interpretation: 'Only range', severity: 'normal' }
    ]
    const result = calculateSimpleSum(makeQuestions([0, 0, 0]), noMatch)
    expect(result.interpretation).toBe('')
    expect(result.severity).toBe('normal')
  })

  it('applies scoreMultiplier correctly', () => {
    const result = calculateSimpleSum(
      makeQuestions([1, 2, 3]),
      [{ minScore: 0, maxScore: 100, interpretation: 'OK', severity: 'normal' }],
      4
    )
    expect(result.score).toBe(24) // (1+2+3) × 4
  })

  it('maps question results with correct text and numbers', () => {
    const result = calculateSimpleSum(makeQuestions([0, 2]), testThresholds)
    expect(result.questionResults).toHaveLength(2)
    expect(result.questionResults[0].questionNumber).toBe('1')
    expect(result.questionResults[0].answerText).toBe('None')
    expect(result.questionResults[0].score).toBe(0)
    expect(result.questionResults[1].questionNumber).toBe('2')
    expect(result.questionResults[1].answerText).toBe('Moderate')
    expect(result.questionResults[1].score).toBe(2)
  })

  it('handles empty questions array', () => {
    const result = calculateSimpleSum([], testThresholds)
    expect(result.score).toBe(0)
    expect(result.questionResults).toHaveLength(0)
  })
})
