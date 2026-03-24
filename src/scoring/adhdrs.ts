/**
 * What: Pure scoring function and question definitions for ADHD-RS
 * (ADHD Rating Scale for children and youth).
 * How: 26 questions in 4 domains, scale 0-3. Simple sum scoring with subscores.
 * Thresholds on total: ≥70 severe, >60 borderline, ≤60 normal.
 *
 * Why: Danish version of the behavioral assessment tool for ADHD symptoms
 * in children aged 4-18, used by parents and teachers.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

/**
 * What: Domain group boundaries for subscore computation.
 * How: A = inattention (1-9), B = hyperactivity (10-14),
 * C = impulsivity (15-18), D = oppositional (19-26).
 */
export const ADHDRS_DOMAINS = {
  a: { title: 'Uopmærksomhed', startIndex: 0, endIndex: 8 },
  b: { title: 'Hyperaktivitet', startIndex: 9, endIndex: 13 },
  c: { title: 'Impulsivitet', startIndex: 14, endIndex: 17 },
  d: { title: 'Oppositionel adfærd', startIndex: 18, endIndex: 25 }
}

export const ADHDRS_SECTIONS = [
  { title: 'Uopmærksomhed (1-9)', startIndex: 0 },
  { title: 'Hyperaktivitet (10-14)', startIndex: 9 },
  { title: 'Impulsivitet (15-18)', startIndex: 14 },
  { title: 'Oppositionel adfærd (19-26)', startIndex: 18 }
]

const ADHDRS_OPTIONS = [
  { text: 'Aldrig/sjældent', value: 0 },
  { text: 'Nogle gange', value: 1 },
  { text: 'Ofte', value: 2 },
  { text: 'Meget ofte', value: 3 }
]

export function createAdhdrsQuestions(): Question[] {
  return [
    // Domain A: Inattention (items 1-9)
    { type: 'SelectButton', bg: '--p-primary-100', text: '1. Uopmærksom på detaljer', description: 'Er ikke opmærksom på detaljer eller laver sjuskefejl i sit skolearbejde', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '2. Svært ved at koncentrere sig', description: 'Har svært ved at fastholde koncentrationen ved opgaver eller under leg', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '3. Hører ikke efter', description: 'Hører tilsyneladende ikke efter ved direkte tiltale', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '4. Gør ikke tingene færdige', description: 'Gør ikke de ting, der bliver bedt om, eller gør dem ikke færdige', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '5. Svært ved at organisere', description: 'Har svært ved at organisere opgaver og aktiviteter', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '6. Undgår krævende opgaver', description: 'Undgår opgaver (f.eks. skole, lektier) som kræver omtanke og koncentration', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '7. Mister ting', description: 'Mister ting, der er nødvendige for at udføre opgaver eller aktiviteter', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '8. Distraheres let', description: 'Bliver let afledt eller distraheret', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '9. Glemsom', description: 'Er glemsom i forbindelse med daglige aktiviteter', options: [...ADHDRS_OPTIONS], answer: null },

    // Domain B: Hyperactivity (items 10-14)
    { type: 'SelectButton', bg: '--p-primary-50', text: '10. Urolig', description: 'Sidder uroligt eller bevæger konstant hænder og fødder', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '11. Rejser sig fra plads', description: 'Rejser sig fra sin plads i klassen eller i andre sammenhænge, hvor man forventes at blive siddende', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '12. Farer omkring', description: 'Farer omkring i situationer, hvor det ikke er passende', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '13. Svært ved stille lege', description: 'Har svært ved at indgå i stille lege eller fritidsaktiviteter', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '14. Altid i fuld fart', description: 'Er altid i "fuld fart" eller har "krudt bagi"', options: [...ADHDRS_OPTIONS], answer: null },

    // Domain C: Impulsivity (items 15-18)
    { type: 'SelectButton', bg: '--p-primary-100', text: '15. Snakker meget', description: 'Snakker som et vandfald', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '16. Buser ud med svar', description: 'Buser ud med et svar, før spørgsmålet er afsluttet', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '17. Svært ved at vente', description: 'Har svært ved at vente på sin tur', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '18. Afbryder andre', description: 'Afbryder eller forstyrrer andre', options: [...ADHDRS_OPTIONS], answer: null },

    // Domain D: Oppositional conduct (items 19-26)
    { type: 'SelectButton', bg: '--p-primary-100', text: '19. Rasende', description: 'Bliver rasende eller mister besindelsen', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '20. Skændes med voksne', description: 'Skændes med de voksne', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '21. Trodser voksne', description: 'Trodser åbenlyst voksne eller nægter at rette sig efter deres regler', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '22. Irriterer med vilje', description: 'Irriterer folk med vilje', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '23. Giver andre skylden', description: 'Giver andre skylden for sine fejl eller dårlig opførsel', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '24. Nærtagende', description: 'Er nærtagende eller bliver let irriteret på andre', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '25. Vred eller fornærmet', description: 'Er vred eller fornærmet', options: [...ADHDRS_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '26. Hævngerrig', description: 'Er ondskabsfuld eller hævngerrig', options: [...ADHDRS_OPTIONS], answer: null }
  ]
}

export const adhdrsConfig: CalculatorConfig = {
  name: 'ADHD-RS',
  description: 'ADHD Rating Scale — adfærdsvurdering for børn og unge',
  shortName: 'ADHD-RS',
  defaultAge: 10,
  defaultGender: 'Mand',
  minAge: 4,
  maxAge: 18,
  showCpr: false,
  questions: createAdhdrsQuestions(),
  thresholds: [
    {
      minScore: 0,
      maxScore: 60,
      interpretation: 'Normal symptombelastning.',
      severity: 'normal'
    },
    {
      minScore: 61,
      maxScore: 69,
      interpretation: 'Borderline symptombelastning.',
      severity: 'moderate'
    },
    {
      minScore: 70,
      maxScore: 78,
      interpretation: 'Svær symptombelastning.',
      severity: 'severe'
    }
  ]
}

export function calculateAdhdrs(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, adhdrsConfig.thresholds)
}

/**
 * What: Compute domain subscores from question results.
 * How: Sums answer values per domain group for display purposes.
 */
export function getAdhdrsSubscores(questions: Question[]): {
  inattention: number
  hyperactivityImpulsivity: number
  oppositional: number
  total: number
} {
  const d = ADHDRS_DOMAINS
  let inattention = 0, hyperactivity = 0, impulsivity = 0, oppositional = 0

  questions.forEach((q, i) => {
    const val = q.answer ?? 0
    if (i >= d.a.startIndex && i <= d.a.endIndex) inattention += val
    else if (i >= d.b.startIndex && i <= d.b.endIndex) hyperactivity += val
    else if (i >= d.c.startIndex && i <= d.c.endIndex) impulsivity += val
    else if (i >= d.d.startIndex && i <= d.d.endIndex) oppositional += val
  })

  return {
    inattention,
    hyperactivityImpulsivity: hyperactivity + impulsivity,
    oppositional,
    total: inattention + hyperactivity + impulsivity + oppositional
  }
}
