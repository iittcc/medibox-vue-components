/**
 * What: Pure scoring function and question definitions for DANPSS
 * (Danish Prostate Symptom Score).
 * How: 4 sections with dual A/B scoring per question.
 * Score per question = answerA × answerB (product).
 * Total = sum of section 1-3 products (section 4 is optional/separate).
 *
 * Why: DANPSS uses a unique product-based scoring that doesn't fit
 * calculateSimpleSum. It needs its own scoring function and types.
 */

import type { ScoringThreshold } from './types'

export interface DanpssOption {
  text: string
  value: number
}

export interface DanpssQuestion {
  bg: string
  textA: string
  textB: string
  optionsA: DanpssOption[]
  optionsB: DanpssOption[]
  answerA: number | null
  answerB: number | null
  section: string
}

export interface DanpssQuestionResult {
  questionTextA: string
  questionTextB: string
  answerTextA: string
  answerTextB: string
  scoreA: number
  scoreB: number
  scoreAB: number
  section: string
}

export interface DanpssSectionResult {
  name: string
  totalA: number
  totalB: number
  totalAB: number
  interval: string
}

export interface DanpssScoreResult {
  totalA: number
  totalB: number
  totalAB: number
  interpretation: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
  sections: DanpssSectionResult[]
  sexualSection: DanpssSectionResult | null
  questionResults: DanpssQuestionResult[]
  allSexualAnswered: boolean
}

export interface DanpssConfig {
  name: string
  shortName: string
  defaultAge: number
  defaultGender: string
  minAge: number
  maxAge: number
  showCpr: boolean
  thresholds: ScoringThreshold[]
}

const optionsB: DanpssOption[] = [
  { text: 'Ikke generende', value: 0 },
  { text: 'Lidt generende', value: 1 },
  { text: 'Moderat generende', value: 2 },
  { text: 'Meget generende', value: 3 }
]

export function createDanpssQuestions(): DanpssQuestion[] {
  return [
    // Section 1: Tømning (4 questions)
    { bg: '--p-primary-100', section: 'Tømning', textA: '1A. Skal du vente på, at vandladningen kommer i gang?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '1B. Hvis du skal vente, hvor stor en gene er det så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Tømning', textA: '2A. Synes du urinstrålen er:', optionsA: [{ text: 'Normal?', value: 0 }, { text: 'Lidt slap?', value: 1 }, { text: 'Meget slap?', value: 2 }, { text: 'Dryppende?', value: 3 }], textB: '2B. Hvis urinstrålen er slap, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-100', section: 'Tømning', textA: '3A. Føler du, at du får tømt blæren helt ved vandladning?', optionsA: [{ text: 'Ja, altid', value: 0 }, { text: 'Oftest', value: 1 }, { text: 'Sjældent', value: 2 }, { text: 'Tømmes aldrig helt', value: 3 }], textB: '3B. Hvis du føler, at blæren ikke tømmes helt ved vandladning, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Tømning', textA: '4A. Skal du presse for at starte vandladningen og/eller for at holde vandladningen i gang?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '4B. Hvis du skal presse, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    // Section 2: Fyldning (4 questions)
    { bg: '--p-primary-100', section: 'Fyldning', textA: '5A. Hvor lang tid går der højst mellem hver vandladning, fra du vågner, til du går i seng?', optionsA: [{ text: 'Mere end 3 timer', value: 0 }, { text: '2-3 timer', value: 1 }, { text: '1-2 timer', value: 2 }, { text: 'Mindre end 1 time', value: 3 }], textB: '5B. Hvis du ofte skal lade vandet, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Fyldning', textA: '6A. Hvor mange gange skal du lade vandet om natten?', optionsA: [{ text: '0 gange', value: 0 }, { text: '1-2 gange', value: 1 }, { text: '3-4 gange', value: 2 }, { text: '5 gange eller mere', value: 3 }], textB: '6B. Hvis du skal lade vandet om natten, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-100', section: 'Fyldning', textA: '7A. Oplever du en bydende (stærk) vandladningstrang?', optionsA: [{ text: 'Aldrig', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '7B. Hvis du oplever en bydende (stærk) vandladningstrang, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Fyldning', textA: '8A. Er vandladningstrangen så kraftig, at du ikke kan holde på vandet, inden du når toilettet?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '8B. Hvis urinen løber fra dig, inden du når toilettet, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    // Section 3: Andre symptomer (4 questions)
    { bg: '--p-primary-100', section: 'Andre symptomer', textA: '9A. Gør det ondt eller svier det, når du lader vandet?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '9B. Hvis det gør ondt eller svier, når du lader vandet, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Andre symptomer', textA: '10A. Drypper der urin, når du tror, at vandladningen er færdig (efterdryp)?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'I toilettet', value: 1 }, { text: 'Lidt i bukserne', value: 2 }, { text: 'Meget i bukserne', value: 3 }], textB: '10B. Hvis der drypper urin, når du tror, at vandladningen er færdig (efterdryp), hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-100', section: 'Andre symptomer', textA: '11A. Har du ufrivillig vandladning ved fysisk anstrengelse (fx hoste, nys eller løft)?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '11B. Hvis du har ufrivillig vandladning ved fysisk anstrengelse, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-primary-50', section: 'Andre symptomer', textA: '12A. Har du ufrivillig vandladning uden fysisk anstrengelse og uden trang (siven)?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Sjældent', value: 1 }, { text: 'Dagligt', value: 2 }, { text: 'Hver gang', value: 3 }], textB: '12B. Hvis urinen siver fra dig uden fysisk anstrengelse og uden trang, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    // Section 4: Seksualfunktion (3 questions, optional)
    { bg: '--p-zinc-100', section: 'Seksualfunktion', textA: '13A. Kan du få rejsning?', optionsA: [{ text: 'Ja, med normal stivhed', value: 0 }, { text: 'Ja, med let nedsat stivhed', value: 1 }, { text: 'Ja, med meget nedsat stivhed', value: 2 }, { text: 'Nej, kan ikke få rejsning', value: 3 }], textB: '13B. Hvis du har problemer med at få rejsning, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-zinc-50', section: 'Seksualfunktion', textA: '14A. Har du sædafgang?', optionsA: [{ text: 'Ja, i normal mængde', value: 0 }, { text: 'Ja, i let nedsat mængde', value: 1 }, { text: 'Ja, i meget nedsat mængde', value: 2 }, { text: 'Nej', value: 3 }], textB: '14B. Hvis du har nedsat eller ophævet sædafgang, hvor stor en gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null },
    { bg: '--p-zinc-100', section: 'Seksualfunktion', textA: '15A. Hvis du har sædafgang, oplever du da smerter/ubehag ved sædafgang?', optionsA: [{ text: 'Nej', value: 0 }, { text: 'Ja, lette smerter/ubehag', value: 1 }, { text: 'Ja, moderat smerter/ubehag', value: 2 }, { text: 'Ja, stærk smerte/ubehag', value: 3 }], textB: '15B. Hvis du har smerter/ubehag ved sædafgang, hvor stor gene er dette så for dig?', optionsB: [...optionsB], answerA: null, answerB: null }
  ]
}

export const danpssConfig: DanpssConfig = {
  name: 'DANPSS Scoringsskema',
  shortName: 'DANPSS',
  defaultAge: 55,
  defaultGender: 'Mand',
  minAge: 0,
  maxAge: 120,
  showCpr: false,
  thresholds: [
    { minScore: 0, maxScore: 7, interpretation: 'Lette symptomer (Vandladningsproblem total score < 8)', severity: 'normal' },
    { minScore: 8, maxScore: 19, interpretation: 'Moderate symptomer (Vandladningsproblem total score 8-19)', severity: 'moderate' },
    { minScore: 20, maxScore: 108, interpretation: 'Svære symptomer (Vandladningsproblem total score > 19)', severity: 'severe' }
  ]
}

// Why: DANPSS uses product scoring (A × B) not sum scoring.
// Total is based on sections 1-3 only; section 4 is optional and separate.
export function calculateDanpss(questions: DanpssQuestion[]): DanpssScoreResult {
  const questionResults: DanpssQuestionResult[] = questions.map(q => {
    const scoreA = q.answerA ?? 0
    const scoreB = q.answerB ?? 0
    const selectedA = q.optionsA.find(o => o.value === scoreA)
    const selectedB = q.optionsB.find(o => o.value === scoreB)

    return {
      questionTextA: q.textA,
      questionTextB: q.textB,
      answerTextA: selectedA?.text ?? '',
      answerTextB: selectedB?.text ?? '',
      scoreA,
      scoreB,
      scoreAB: scoreA * scoreB,
      section: q.section
    }
  })

  const sectionNames = ['Tømning', 'Fyldning', 'Andre symptomer']
  const sections: DanpssSectionResult[] = sectionNames.map(name => {
    const sectionQs = questionResults.filter(qr => qr.section === name)
    return {
      name,
      totalA: sectionQs.reduce((s, qr) => s + qr.scoreA, 0),
      totalB: sectionQs.reduce((s, qr) => s + qr.scoreB, 0),
      totalAB: sectionQs.reduce((s, qr) => s + qr.scoreAB, 0),
      interval: '0-36'
    }
  })

  const sexualQs = questionResults.filter(qr => qr.section === 'Seksualfunktion')
  const allSexualAnswered = questions
    .filter(q => q.section === 'Seksualfunktion')
    .every(q => q.answerA !== null && q.answerB !== null)

  const sexualSection: DanpssSectionResult | null = allSexualAnswered ? {
    name: 'Seksualfunktion',
    totalA: sexualQs.reduce((s, qr) => s + qr.scoreA, 0),
    totalB: sexualQs.reduce((s, qr) => s + qr.scoreB, 0),
    totalAB: sexualQs.reduce((s, qr) => s + qr.scoreAB, 0),
    interval: '0-27'
  } : null

  const totalA = sections.reduce((s, sec) => s + sec.totalA, 0)
  const totalB = sections.reduce((s, sec) => s + sec.totalB, 0)
  const totalAB = sections.reduce((s, sec) => s + sec.totalAB, 0)

  const threshold = danpssConfig.thresholds.find(
    t => totalAB >= t.minScore && totalAB <= t.maxScore
  )

  return {
    totalA,
    totalB,
    totalAB,
    interpretation: threshold?.interpretation ?? '',
    severity: (threshold?.severity ?? 'normal') as 'normal' | 'mild' | 'moderate' | 'severe',
    sections,
    sexualSection,
    questionResults,
    allSexualAnswered
  }
}
