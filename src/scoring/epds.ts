/**
 * What: Pure scoring function and question definitions for the
 * Edinburgh Postnatal Depression Scale (EPDS).
 * How: Exports the calculator configuration (questions, options, thresholds)
 * and a pure scoring function that computes the total score and interpretation.
 *
 * Why: Extracted from EPDSScore.vue so scoring logic is testable in isolation,
 * and question definitions are shared between the interactive form and print view
 * (single source of truth for clinical content).
 */

import type {
  CalculatorConfig,
  Question,
  ScoreResult,
  QuestionResult
} from './types'

// Why: The EPDS clinical threshold is >= 10 for screening cutoff (Danish guidelines).
// The previous code used > 10 which was inconsistent with the display text and clinical standards.
const EPDS_DEPRESSION_THRESHOLD = 10

/**
 * What: Creates the default EPDS question set with initial answers.
 * How: Returns a fresh array of 10 EPDS questions, each with their
 * Danish text and scoring options. Initial answers are set to the
 * first option value (score 0).
 *
 * Why: Factory function ensures each calculator instance gets its own
 * mutable question array (no shared state between instances).
 */
export function createEpdsQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?',
      options: [
        { text: 'Lige så meget som jeg altid har kunnet', value: 0 },
        { text: 'Ikke helt så meget som tidligere', value: 1 },
        { text: 'Afgjort ikke så meget som tidligere', value: 2 },
        { text: 'Overhovedet ikke', value: 3 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. Har du de sidste 7 dage kunnet se frem til ting med glæde?',
      options: [
        { text: 'Lige så meget som jeg tidligere har gjort', value: 0 },
        { text: 'En del mindre end jeg tidligere har gjort', value: 1 },
        { text: 'Afgjort mindre end jeg tidligere har gjort', value: 2 },
        { text: 'Næsten ikke', value: 3 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. Har du de sidste 7 dage unødvendigt bebrejdet dig selv, når ting ikke gik som de skulle?',
      options: [
        { text: 'Ja, det meste af tiden', value: 3 },
        { text: 'Ja, af og til', value: 2 },
        { text: 'Ikke så tit', value: 1 },
        { text: 'Nej, slet ikke', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '4. Har du de sidste 7 dage været anspændt og bekymret uden nogen særlig grund?',
      options: [
        { text: 'Nej, overhovedet ikke', value: 0 },
        { text: 'Meget sjældent', value: 1 },
        { text: 'Ja, nogle gange', value: 2 },
        { text: 'Ja, meget ofte', value: 3 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '5. Har du de sidste 7 dage følt dig angst eller panikslagen uden nogen særlig grund?',
      options: [
        { text: 'Ja, en hel del', value: 3 },
        { text: 'Ja, nogle gange', value: 2 },
        { text: 'Nej, ikke meget', value: 1 },
        { text: 'Nej, overhovedet ikke', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '6. Har du de sidste 7 dage følt, at tingene voksede dig over hovedet?',
      options: [
        { text: 'Ja, det meste af tiden', value: 3 },
        { text: 'Ja, nogle gange', value: 2 },
        { text: 'Nej, det meste af tiden har jeg kunne overskue min situation', value: 1 },
        { text: 'Nej, jeg har kunne overskue min situation lige så godt, som jeg plejer', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '7. Har du de sidste 7 dage været så ked af det, at du har haft svært ved at sove?',
      options: [
        { text: 'Ja, det meste af tiden', value: 3 },
        { text: 'Ja, nogle gange', value: 2 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nej, aldrig', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '8. Har du de sidste 7 dage følt dig trist eller elendigt til mode?',
      options: [
        { text: 'Ja, det meste af tiden', value: 3 },
        { text: 'Ja, ret tit', value: 2 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nej, aldrig', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '9. Har du de sidste 7 dage været så ulykkelig, at du har grædt?',
      options: [
        { text: 'Ja, det meste af tiden', value: 3 },
        { text: 'Ja, ret tit', value: 2 },
        { text: 'Ja, ved enkelte lejligheder', value: 1 },
        { text: 'Nej, aldrig', value: 0 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '10. Har tanken om at gøre skade på dig selv strejfet dig de sidste 7 dage?',
      options: [
        { text: 'Ja, ganske ofte', value: 3 },
        { text: 'Nogle gange', value: 2 },
        { text: 'Sjældent', value: 1 },
        { text: 'Aldrig', value: 0 }
      ],
      answer: 0
    }
  ]
}

/**
 * What: EPDS calculator configuration.
 * How: Combines calculator metadata, default patient settings,
 * question definitions, and scoring thresholds into one config object.
 */
export const epdsConfig: CalculatorConfig = {
  name: 'Edinburgh Postnatal Depression Scale',
  shortName: 'EPDS',
  defaultAge: 35,
  defaultGender: 'Kvinde',
  minAge: 12,
  maxAge: 70,
  showCpr: true,
  questions: createEpdsQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: EPDS_DEPRESSION_THRESHOLD - 1,
      interpretation: 'Ikke tegn til alvorlig depression.',
      severity: 'normal'
    },
    {
      minScore: EPDS_DEPRESSION_THRESHOLD,
      maxScore: 30,
      interpretation: 'Behandlingskrævende depression kan foreligge.',
      severity: 'severe'
    }
  ]
}

/**
 * What: Pure scoring function for the EPDS calculator.
 * How: Sums all question answers and applies the clinical threshold
 * to determine the interpretation and severity.
 *
 * @param questions - Array of questions with user-selected answers
 * @returns ScoreResult with total score, interpretation, severity, and per-question results
 */
export function calculateEpds(questions: Question[]): ScoreResult {
  const questionResults: QuestionResult[] = questions.map((q, index) => {
    const score = q.answer ?? 0
    const selectedOption = q.options.find(opt => opt.value === score)

    return {
      questionNumber: `${index + 1}`,
      questionText: q.text,
      answerText: selectedOption?.text ?? '',
      score
    }
  })

  const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0)

  // Why: Using >= for threshold comparison per Danish clinical guidelines.
  // Score of exactly 10 should trigger clinical concern.
  const threshold = epdsConfig.thresholds.find(
    t => totalScore >= t.minScore && totalScore <= t.maxScore
  )

  return {
    score: totalScore,
    interpretation: threshold?.interpretation ?? '',
    severity: threshold?.severity ?? 'normal',
    questionResults
  }
}
