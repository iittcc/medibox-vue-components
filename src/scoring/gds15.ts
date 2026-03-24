/**
 * What: Pure scoring function for GDS-15 (Geriatric Depression Scale).
 * How: 15 binary Ja/Nej questions with reverse scoring on positive items.
 * Score is simple sum (0-15) with 3 thresholds.
 *
 * Why: Screening for depression in elderly patients.
 * Reverse-scored items: questions where "Ja" = 0 (no depression indicator).
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createGds15Questions(): Question[] {
  return [
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '1. Tilfreds med livet',
      description: 'Er du stort set tilfreds med livet?',
      options: [{ text: 'Nej', value: 1 }, { text: 'Ja', value: 0 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '2. Opgivet aktiviteter',
      description: 'Har du opgivet mange af dine aktiviteter og interesser?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '3. Tomrum i livet',
      description: 'Føler du et stort tomrum i dit liv?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '4. Keder dig ofte',
      description: 'Keder du dig ofte?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '5. Godt humør',
      description: 'Er du for det meste i godt humør?',
      options: [{ text: 'Nej', value: 1 }, { text: 'Ja', value: 0 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '6. Bange for noget alvorligt',
      description: 'Er du bange for, at der skal ske dig noget alvorligt?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '7. Glad og tilfreds',
      description: 'Føler du dig glad og tilfreds?',
      options: [{ text: 'Nej', value: 1 }, { text: 'Ja', value: 0 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '8. Hjælpeløs',
      description: 'Føler du dig ofte hjælpeløs?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '9. Foretrækker at blive hjemme',
      description: 'Vil du hellere blive hjemme end ud og opleve noget nyt?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '10. Dårlig hukommelse',
      description: 'Tror du, at din hukommelse er dårligere end de fleste andres?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '11. Lykkelig ved livet',
      description: 'Er du lykkelig ved livet lige nu?',
      options: [{ text: 'Nej', value: 1 }, { text: 'Ja', value: 0 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '12. Værdiløs',
      description: 'Føler du dig værdiløs?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '13. Masser af energi',
      description: 'Har du masser af energi?',
      options: [{ text: 'Nej', value: 1 }, { text: 'Ja', value: 0 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-50',
      text: '14. Håbløs situation',
      description: 'Synes du, at din situation er håbløs?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    },
    {
      type: 'SelectButton', bg: '--p-primary-100',
      text: '15. Andre har det bedre',
      description: 'Tror du, at de fleste mennesker har det bedre end dig?',
      options: [{ text: 'Nej', value: 0 }, { text: 'Ja', value: 1 }],
      answer: null
    }
  ]
}

export const gds15Config: CalculatorConfig = {
  name: 'GDS-15',
  description: 'Geriatrisk Depressionsskala — screening for depression hos ældre',
  shortName: 'GDS-15',
  defaultAge: 70,
  defaultGender: 'Mand',
  minAge: 60,
  maxAge: 110,
  showCpr: false,
  questions: createGds15Questions(),
  thresholds: [
    { minScore: 0, maxScore: 4, interpretation: 'Normal scoring.', severity: 'normal' },
    { minScore: 5, maxScore: 7, interpretation: 'Mulig depression.', severity: 'moderate' },
    { minScore: 8, maxScore: 15, interpretation: 'Sandsynligvis depression.', severity: 'severe' }
  ]
}

export function calculateGds15(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, gds15Config.thresholds)
}
