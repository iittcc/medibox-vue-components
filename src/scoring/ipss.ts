/**
 * What: Pure scoring function and question definitions for IPSS
 * (International Prostate Symptom Score).
 * How: 7 questions (not 8) with descriptions. 4 severity thresholds.
 */

import type { CalculatorConfig, Question, ScoreResult } from './types'
import { calculateSimpleSum } from './utils'

export function createIpssQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Ufuldstændig tømning',
      description: 'I løbet af den sidste måned, hvor ofte har du haft følelsen af, at blæren ikke er blevet fuldstændig tømt efter afsluttet vandladning?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '2. Vandladningsfrekvens',
      description: 'I løbet af den sidste måned, hvor ofte har du måttet lade vandet på ny mindre end 2 timer efter forrige vandladning?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '3. Afbrudt vandladning',
      description: 'I løbet af den sidste måned, hvor ofte har du måttet stoppe og starte igen, mens du lod vandet?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '4. Vandladningstrang',
      description: 'I løbet af den sidste måned, hvor ofte synes du, det har været vanskeligt at udsætte vandladningen?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '5. Svag strålekraft',
      description: 'I løbet af den sidste måned, hvor ofte har du haft svag urinstråle?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-50',
      text: '6. Stranguri',
      description: 'I løbet af den sidste måned, hvor ofte har du måttet trykke eller presse for at lade vandet?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Mindre end 1 af 5 gange', value: 1 },
        { text: 'Mindre end halvdelen af gangene', value: 2 },
        { text: 'Omtrent halvdelen af gangene', value: 3 },
        { text: 'Mere end halvdelen af gangene', value: 4 },
        { text: 'Næsten altid', value: 5 }
      ],
      answer: 0
    },
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '7. Nykturi',
      description: 'I løbet af den sidste måned, hvor mange gange har du typisk måtte stå op i løbet af natten for at lade vandet?',
      options: [
        { text: 'Ingen', value: 0 },
        { text: '1 gang', value: 1 },
        { text: '2 gange', value: 2 },
        { text: '3 gange', value: 3 },
        { text: '4 gange', value: 4 },
        { text: '5 gange', value: 5 }
      ],
      answer: 0
    }
  ]
}

export const ipssConfig: CalculatorConfig = {
  name: 'IPSS, International prostata symptom score',
  shortName: 'IPSS',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 10,
  maxAge: 110,
  showCpr: false,
  questions: createIpssQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 0, interpretation: 'Asymptomatisk', severity: 'normal' },
    { minScore: 1, maxScore: 7, interpretation: 'Symptomatisk, mild', severity: 'mild' },
    { minScore: 8, maxScore: 19, interpretation: 'Symptomatisk, moderat', severity: 'moderate' },
    { minScore: 20, maxScore: 35, interpretation: 'Symptomatisk, alvorlig', severity: 'severe' }
  ]
}

export function calculateIpss(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, ipssConfig.thresholds)
}
