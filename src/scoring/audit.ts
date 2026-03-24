/**
 * What: Pure scoring function and question definitions for the AUDIT
 * (Alcohol Use Disorders Identification Test).
 * How: Exports calculator configuration, question factory, and a scoring
 * function that delegates to the shared calculateSimpleSum utility.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

/**
 * What: Creates the AUDIT question set with initial answers.
 * How: Returns 10 questions with embedded options (no optionsType lookup).
 */
export function createAuditQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Hvor tit drikker du alkohol?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Månedligt eller sjældnere', value: 1 },
        { text: 'To til fire gange om måneden', value: 2 },
        { text: 'To til tre gange om ugen', value: 3 },
        { text: 'Fire gange om ugen eller oftere', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. Hvor mange genstande drikker du almindeligvis, når du drikker noget?',
      options: [
        { text: '1-2', value: 0 },
        { text: '3-4', value: 1 },
        { text: '5-6', value: 2 },
        { text: '7-9', value: 3 },
        { text: '10 eller flere', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. Hvor tit drikker du fem genstande eller flere ved samme lejlighed?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Månedligt', value: 2 },
        { text: 'Ugentligt', value: 3 },
        { text: 'Dagligt eller næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '4. Har du inden for det seneste år oplevet, at du ikke kunne stoppe, når du først var begyndt at drikke?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Månedligt', value: 2 },
        { text: 'Ugentligt', value: 3 },
        { text: 'Dagligt eller næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '5. Har du inden for det seneste år oplevet, at du ikke kunne gøre det, du skulle, fordi du havde drukket?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nogle gange om måneden', value: 2 },
        { text: 'Nogle gange om ugen', value: 3 },
        { text: 'Næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '6. Har du inden for det seneste år måttet have en lille én om morgenen, efter at du havde drukket meget dagen før?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nogle gange om måneden', value: 2 },
        { text: 'Nogle gange om ugen', value: 3 },
        { text: 'Næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '7. Har du inden for det seneste år haft dårlig samvittighed eller fortrudt, efter du har drukket?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nogle gange om måneden', value: 2 },
        { text: 'Nogle gange om ugen', value: 3 },
        { text: 'Næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '8. Har du inden for det seneste år oplevet, at du ikke kunne huske, hvad der skete aftenen før, fordi du havde drukket?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Sjældent', value: 1 },
        { text: 'Nogle gange om måneden', value: 2 },
        { text: 'Nogle gange om ugen', value: 3 },
        { text: 'Næsten dagligt', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '9. Er du selv eller andre nogensinde kommet til skade ved en ulykke, fordi du havde drukket?',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja, men ikke inden for det seneste år', value: 2 },
        { text: 'Ja, inden for det seneste år', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '10. Har nogen i familien, en ven, en læge eller andre været bekymret over dine alkoholvaner eller foreslået dig at sætte forbruget ned?',
      options: [
        { text: 'Nej', value: 0 },
        { text: 'Ja, men ikke inden for det seneste år', value: 2 },
        { text: 'Ja, inden for det seneste år', value: 4 }
      ],
      answer: 0
    }
  ]
}

export const auditConfig: CalculatorConfig = {
  name: 'AUDIT Alkoholafhængighedstest',
  description: 'Klinisk vurdering af sandsynlighed for alkoholafhængighed',
  shortName: 'AUDIT',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createAuditQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 7,
      interpretation: 'Ikke tegn på alkoholafhængighed (AUDIT Score < 8)',
      severity: 'normal'
    },
    {
      minScore: 8,
      maxScore: 40,
      interpretation: 'Tegn på alkoholafhængighed (AUDIT Score ≥ 8)',
      severity: 'severe'
    }
  ]
}

export function calculateAudit(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, auditConfig.thresholds)
}
