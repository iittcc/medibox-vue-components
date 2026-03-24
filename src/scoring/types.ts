/**
 * What: Shared type definitions for the calculator scoring platform.
 * How: Defines interfaces for questions, options, score results, and form state
 * used by all medical calculators.
 */

/**
 * What: A single answer option for a calculator question.
 * How: Maps display text to a numeric score value.
 */
export interface Option {
  text: string
  value: number
}

/**
 * What: A single question in a medical calculator.
 * How: Includes the question text, display type, available options,
 * and the user's selected answer.
 */
export interface Question {
  type: string
  bg?: string
  text: string
  description?: string
  options: Option[]
  answer: number | null
}

/**
 * What: The result for a single question after calculation.
 * How: Maps a question number to the selected answer text and score.
 */
export interface QuestionResult {
  questionNumber: string
  questionText: string
  answerText: string
  score: number
}

/**
 * What: The overall score result from a calculator.
 * How: Contains the total score, clinical interpretation, severity level,
 * and individual question results for display and printing.
 */
export interface ScoreResult {
  score: number
  interpretation: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
  questionResults: QuestionResult[]
}

/**
 * What: Patient information captured by the calculator form.
 * How: Includes name, age, gender, and optional CPR (Danish personal ID).
 */
export interface PatientInfo {
  name: string
  age: number
  gender: string
  cpr: string
}

/**
 * What: Configuration for a calculator's question set.
 * How: Defines the calculator name, default patient settings,
 * and all questions with their options.
 */
export interface CalculatorConfig {
  name: string
  description: string
  shortName: string
  defaultAge: number
  defaultGender: string
  minAge: number
  maxAge: number
  showCpr: boolean
  questions: Question[]
  thresholds: ScoringThreshold[]
}

/**
 * What: A scoring threshold that maps a score range to a clinical interpretation.
 * How: Used by the scoring function to determine the severity and interpretation
 * based on the total score.
 */
export interface ScoringThreshold {
  minScore: number
  maxScore: number
  interpretation: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
}
