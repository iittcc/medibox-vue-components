/**
 * What: Pure scoring function and question definitions for HAMA
 * (Hamiltons Angstskala / Hamilton Anxiety Rating Scale).
 * How: 14 clinician-rated items scored 0-4, simple sum with 5 severity thresholds.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

const HAMA_OPTIONS = [
  { text: 'Forekommer ikke', value: 0 },
  { text: 'Let grad', value: 1 },
  { text: 'Moderat grad', value: 2 },
  { text: 'Udtalt grad', value: 3 },
  { text: 'Maksimal grad', value: 4 }
]

/** Tooltip descriptions for each HAMA item (clinical assessment guide) */
export const HAMA_TOOLTIPS: Record<number, string> = {
  1: 'Omfatter irritabilitet, bekymring, utryghed, frygt, stigende til panik. Der lægges vægt på patientens rapport om bekymring, utryghed, usikkerhed, frygt- og panikoplevelser.',
  2: 'Omfatter manglende evne til at slappe af, nervøs uro, spændinger i kroppen, rysten og skælven, hvileløs træthed.',
  3: 'Angst, som opstår, når patienten befinder sig i særlige situationer. F.eks. åbne eller lukkede rum, det at stå i kø, at køre i bus eller med tog.',
  4: 'Omfatter alene patientens subjektive oplevelse af søvnlængde og søvndybde. Til grund for bedømmelsen lægges forløbet af de foregående 3 døgn.',
  5: 'Omfatter den nedsatte psykiske og mentale aktivitet.',
  6: 'Omfatter såvel den verbale som den nonverbale tilkendegivelse af patientens oplevelse af tristhed, nedtrykthed, modløshed, håbløshed og hjælpeløshed.',
  7: 'Omfatter mathed, stivhed, ømhed gående over i egentlige smerter, som mere eller mindre diffust er lokaliseret til muskelapparatet, f.eks. smerter i nakke- og skulderåg, muskulær hovedpine.',
  8: 'Omfatter øget trætbarhed og svaghed gående over i egentlige funktionsforstyrrelser af sanseapparatet, f.eks. øresusen, synsforstyrrelser, varme- eller kuldefornemmelser eller prikkende fornemmelser i huden.',
  9: 'Omfatter takykardi, palpitationer, trykken for brystet, brystsmerter, dunkende fornemmelse i blodårerne, besvimelsestendens.',
  10: 'Omfatter pressen eller sammensnøringsfornemmelse i hals eller bryst, dyspnø gående over i kvælningsfornemmelser.',
  11: 'Omfatter synkebesvær, sugende fornemmelse i maven, mavesmerter i forbindelse med måltiderne, oppustethed, kvalme, opkastninger, borborygmi, diarré eller obstipation.',
  12: 'Omfatter hyppige eller mere imperative miktioner, menstruationsforstyrrelser, nedsat seksuel interesse eller evne.',
  13: 'Omfatter mundtørhed, rødmen eller bleghed, øget svedtendens, svimmelhed.',
  14: 'Man observerer, om patienten ved interviewet har virket anspændt, nervøs, urolig, pillende, rastløs, tremulerende, bleg, hyperventilerende eller svedende.'
}

export function createHamaQuestions(): Question[] {
  return [
    { type: 'SelectButton', bg: '--p-primary-100', text: '1. Angst', description: HAMA_TOOLTIPS[1], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '2. Anspændthed', description: HAMA_TOOLTIPS[2], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '3. Fobisk angst', description: HAMA_TOOLTIPS[3], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '4. Søvnforstyrrelser', description: HAMA_TOOLTIPS[4], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '5. Intellektuel hæmning / koncentrationsforstyrrelser', description: HAMA_TOOLTIPS[5], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '6. Nedsat stemningsleje', description: HAMA_TOOLTIPS[6], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '7. Generelle somatiske klager (motoriske)', description: HAMA_TOOLTIPS[7], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '8. Generelle somatiske klager (sensoriske)', description: HAMA_TOOLTIPS[8], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '9. Kardiovaskulære klager', description: HAMA_TOOLTIPS[9], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '10. Respiratoriske klager', description: HAMA_TOOLTIPS[10], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '11. Gastrointestinale klager', description: HAMA_TOOLTIPS[11], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '12. Urogenitale klager', description: HAMA_TOOLTIPS[12], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-100', text: '13. Øvrige autonome klager', description: HAMA_TOOLTIPS[13], options: [...HAMA_OPTIONS], answer: null },
    { type: 'SelectButton', bg: '--p-primary-50', text: '14. Generelle kliniske fund ved interviewet', description: HAMA_TOOLTIPS[14], options: [...HAMA_OPTIONS], answer: null }
  ]
}

export const hamaConfig: CalculatorConfig = {
  name: 'Hamiltons Angstskala',
  description: 'Vurdering af en angsttilstands sværhedsgrad og monitorering af behandlingsforløb',
  shortName: 'HAMA',
  defaultAge: 30,
  defaultGender: 'Kvinde',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createHamaQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 7, interpretation: 'Ingen angsttilstand', severity: 'normal' },
    { minScore: 8, maxScore: 14, interpretation: 'Tvivlsom angsttilstand', severity: 'mild' },
    { minScore: 15, maxScore: 19, interpretation: 'Lettere angsttilstand', severity: 'moderate' },
    { minScore: 20, maxScore: 29, interpretation: 'Moderat angsttilstand', severity: 'moderate' },
    { minScore: 30, maxScore: 56, interpretation: 'Svær angsttilstand', severity: 'severe' }
  ]
}

export function calculateHama(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, hamaConfig.thresholds)
}
