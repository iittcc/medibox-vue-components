/**
 * What: Pure scoring function and question definitions for Y-BOCS
 * (Yale-Brown Obsessive Compulsive Scale).
 * How: 10 questions (5 obsessions + 5 compulsions), each scored 0-4.
 * Total score range 0-40 with 4 severity thresholds.
 *
 * Why: Danish version (Y-BOCS-DK) for clinical assessment of OCD severity.
 * Source: Goodman et al., Arch Gen Psychiatry 1989;46:1006-1011.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

/**
 * What: Section groupings for clinical display.
 * How: Obsessions (Q1-5) and Compulsions (Q6-10).
 */
export const YBOCS_SECTIONS = [
  { title: 'Tvangstanker', startIndex: 0 },
  { title: 'Tvangsadfærd', startIndex: 5 }
]

export function createYbocsQuestions(): Question[] {
  return [
    // === Tvangstanker (Obsessions) Q1-5 ===
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Tid optaget af tvangstanker',
      description: 'Hvor meget tid bruger du på tvangstanker?',
      options: [
        { text: 'Ingen', value: 0 },
        { text: 'Under en time om dagen eller af og til', value: 1 },
        { text: 'En til tre timer om dagen eller ofte', value: 2 },
        { text: 'Over tre timer og op til otte timer om dagen eller meget ofte', value: 3 },
        { text: 'Over otte timer om dagen eller næsten konstant', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. Tvangstankernes indgriben',
      description: 'Hvor belastende er dine tvangstanker for dit arbejde, din skolegang/uddannelse, dit sociale liv eller andre vigtige områder?',
      options: [
        { text: 'Ingen belastning', value: 0 },
        { text: 'Griber lidt ind, men går ikke ud over min generelle adfærd', value: 1 },
        { text: 'Griber afgjort ind i mit sociale liv eller arbejdsindsats, men er stadig håndterlige', value: 2 },
        { text: 'Er en betydelig belastning for mit sociale liv eller min arbejdsindsats', value: 3 },
        { text: 'Invaliderende', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. Ubehag forbundet med tvangstanker',
      description: 'Hvor stort ubehag giver dine tvangstanker anledning til?',
      options: [
        { text: 'Intet', value: 0 },
        { text: 'Lidt, men går ikke ud over min generelle adfærd', value: 1 },
        { text: 'Belastende, men stadig håndterligt', value: 2 },
        { text: 'Meget belastende', value: 3 },
        { text: 'Næsten konstant og invaliderende ubehag', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '4. Modstand mod tvangstanker',
      description: 'Hvor meget prøver du at modstå tvangstankerne? Hvor ofte forsøger du at ignorere eller vende opmærksomheden bort fra disse tanker?',
      options: [
        { text: 'Forsøger at modstå dem hele tiden', value: 0 },
        { text: 'Forsøger at modstå dem det meste af tiden', value: 1 },
        { text: 'Gør et vist forsøg på at modstå dem', value: 2 },
        { text: 'Giver modstræbende efter uden at forsøge at styre dem', value: 3 },
        { text: 'Giver fuldstændig og villigt efter for alle tvangstanker', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '5. Grad af kontrol over tvangstanker',
      description: 'Hvor stor kontrol har du over dine tvangstanker? Hvor god er du til at stoppe dem eller aflede opmærksomheden?',
      options: [
        { text: 'Fuld kontrol', value: 0 },
        { text: 'Kan i reglen stoppe eller aflede, hvis jeg anstrenger mig', value: 1 },
        { text: 'Kan nogle gange stoppe eller aflede opmærksomheden', value: 2 },
        { text: 'Kan sjældent stoppe, og kan kun med stort besvær aflede opmærksomheden', value: 3 },
        { text: 'Fuldstændig ufrivillige, kan sjældent ændre tvangstankerne', value: 4 }
      ],
      answer: 0
    },

    // === Tvangsadfærd (Compulsions) Q6-10 ===
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '6. Tid optaget af tvangsadfærd',
      description: 'Hvor meget tid bruger du på tvangshandlinger? Hvor ofte udfører du ritualerne?',
      options: [
        { text: 'Ingen', value: 0 },
        { text: 'Under en time om dagen eller lejlighedsvise tvangshandlinger', value: 1 },
        { text: 'En til tre timer om dagen eller hyppige tvangshandlinger', value: 2 },
        { text: 'Over tre timer og op til otte timer om dagen eller meget hyppige tvangshandlinger', value: 3 },
        { text: 'Over otte timer om dagen eller næsten konstante tvangshandlinger', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '7. Tvangsadfærdens indgriben',
      description: 'Hvor meget belaster din tvangsadfærd dit arbejde, skolegang, uddannelse eller sociale liv?',
      options: [
        { text: 'Ingen belastning', value: 0 },
        { text: 'Griber lidt ind, men generelt er min indsats ikke belastet', value: 1 },
        { text: 'Er en klar belastning, men stadig håndterlig', value: 2 },
        { text: 'Er en stor belastning for mit sociale liv eller arbejdsindsats', value: 3 },
        { text: 'Invaliderende', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '8. Ubehag forbundet med tvangsadfærd',
      description: 'Hvordan ville du have det, hvis du blev forhindret i at udføre din(e) tvangshandling(er)? Hvor angst ville du blive?',
      options: [
        { text: 'Ingen angst, hvis tvangshandlingerne forhindres', value: 0 },
        { text: 'Kun en smule angst, hvis tvangshandlingerne forhindres', value: 1 },
        { text: 'Angsten vil stige, men vil stadig være håndterlig', value: 2 },
        { text: 'Markant og meget belastende øgning af angst', value: 3 },
        { text: 'Invaliderende angst, hvis tvangshandlingerne på nogen måde ændres', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '9. Modstand mod tvangshandlinger',
      description: 'Hvor meget gør du for at modstå tvangshandlingerne?',
      options: [
        { text: 'Forsøger at modstå dem hele tiden', value: 0 },
        { text: 'Forsøger at modstå dem det meste af tiden', value: 1 },
        { text: 'Gør et vist forsøg på at modstå dem', value: 2 },
        { text: 'Giver modstræbende efter uden at forsøge at styre dem', value: 3 },
        { text: 'Giver helt og villigt efter for alle tvangshandlinger', value: 4 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '10. Grad af kontrol over tvangsadfærd',
      description: 'Hvor stærk er trangen til at udføre tvangshandlinger? Hvor stor kontrol har du over tvangshandlingerne?',
      options: [
        { text: 'Fuld kontrol', value: 0 },
        { text: 'Trang til tvangshandlinger, men kan i reglen styre den', value: 1 },
        { text: 'Stærk trang, kan kun med besvær kontrollere den', value: 2 },
        { text: 'Meget stærk trang, bliver nødt til at udføre dem, kan kun udsætte med besvær', value: 3 },
        { text: 'Trangen er helt ufrivillig og overvældende', value: 4 }
      ],
      answer: 0
    }
  ]
}

export const ybocsConfig: CalculatorConfig = {
  name: 'Y-BOCS',
  description: 'Yale-Brown Obsessive Compulsive Scale',
  shortName: 'Y-BOCS',
  defaultAge: 30,
  defaultGender: 'Mand',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createYbocsQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 14,
      interpretation: 'Ubetydelig til mild OCD.',
      severity: 'normal'
    },
    {
      minScore: 15,
      maxScore: 22,
      interpretation: 'Mild til moderat OCD.',
      severity: 'mild'
    },
    {
      minScore: 23,
      maxScore: 29,
      interpretation: 'Moderat til svær OCD.',
      severity: 'moderate'
    },
    {
      minScore: 30,
      maxScore: 40,
      interpretation: 'Svær til invaliderende OCD.',
      severity: 'severe'
    }
  ]
}

export function calculateYbocs(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, ybocsConfig.thresholds)
}
