// Test data fixtures for WHO-5 Well-Being Index Calculator

import { mobileViewports } from './test-data'

export interface Who5PatientData {
  name: string
  age: number
  gender: 'male' | 'female'
}

export interface Who5Inputs {
  question1: number // I have felt cheerful and in good spirits
  question2: number // I have felt calm and relaxed
  question3: number // I have felt active and vigorous
  question4: number // I woke up feeling fresh and rested
  question5: number // My daily life has been filled with things that interest me
}

export interface Who5ExpectedResult {
  score: number
  interpretationKeyword: string
  riskLevel: 'poor' | 'below_average' | 'average' | 'good' | 'excellent'
}

export interface Who5TestScenario {
  name: string
  patient: Who5PatientData
  inputs: Who5Inputs
  expected: Who5ExpectedResult
}

// Test patients for WHO-5 (adults 16+)
export const who5TestPatients: Who5PatientData[] = [
  { name: 'Test Patient 1', age: 25, gender: 'male' },
  { name: 'Test Patient 2', age: 45, gender: 'female' },
  { name: 'Test Patient 3', age: 65, gender: 'male' },
  { name: 'Test Patient 4', age: 30, gender: 'female' }
]

// WHO-5 test scenarios
export const who5TestScenarios: Who5TestScenario[] = [
  {
    name: 'Poor well-being - Depression risk (Score 20)',
    patient: who5TestPatients[0],
    inputs: {
      question1: 1, // Lidt af tiden
      question2: 1, // Lidt af tiden
      question3: 1, // Lidt af tiden
      question4: 1, // Lidt af tiden
      question5: 1  // Lidt af tiden
    },
    expected: {
      score: 20, // Raw score 5 * 4 = 20
      interpretationKeyword: 'dårligt',
      riskLevel: 'poor'
    }
  },
  {
    name: 'Below average well-being (Score 40)',
    patient: who5TestPatients[1],
    inputs: {
      question1: 2, // Lidt mindre end halvdelen af tiden
      question2: 2, // Lidt mindre end halvdelen af tiden
      question3: 3, // Lidt mere end halvdelen af tiden
      question4: 2, // Lidt mindre end halvdelen af tiden
      question5: 1  // Lidt af tiden
    },
    expected: {
      score: 40, // Raw score 10 * 4 = 40
      interpretationKeyword: 'under gennemsnit',
      riskLevel: 'below_average'
    }
  },
  {
    name: 'Average well-being (Score 60)',
    patient: who5TestPatients[2],
    inputs: {
      question1: 3, // Lidt mere end halvdelen af tiden
      question2: 3, // Lidt mere end halvdelen af tiden
      question3: 3, // Lidt mere end halvdelen af tiden
      question4: 3, // Lidt mere end halvdelen af tiden
      question5: 3  // Lidt mere end halvdelen af tiden
    },
    expected: {
      score: 60, // Raw score 15 * 4 = 60
      interpretationKeyword: 'gennemsnitligt',
      riskLevel: 'average'
    }
  },
  {
    name: 'Good well-being (Score 80)',
    patient: who5TestPatients[3],
    inputs: {
      question1: 4, // Det mest af tiden
      question2: 4, // Det mest af tiden
      question3: 4, // Det mest af tiden
      question4: 4, // Det mest af tiden
      question5: 4  // Det mest af tiden
    },
    expected: {
      score: 80, // Raw score 20 * 4 = 80
      interpretationKeyword: 'godt',
      riskLevel: 'good'
    }
  },
  {
    name: 'Excellent well-being (Score 100)',
    patient: who5TestPatients[0],
    inputs: {
      question1: 5, // Hele tiden
      question2: 5, // Hele tiden
      question3: 5, // Hele tiden
      question4: 5, // Hele tiden
      question5: 5  // Hele tiden
    },
    expected: {
      score: 100, // Raw score 25 * 4 = 100
      interpretationKeyword: 'fremragende',
      riskLevel: 'excellent'
    }
  }
]

// WHO-5 edge case scenarios
export const who5EdgeCaseScenarios: Who5TestScenario[] = [
  {
    name: 'Minimum possible score (Score 0)',
    patient: who5TestPatients[1],
    inputs: {
      question1: 0, // På intet tidspunkt
      question2: 0, // På intet tidspunkt
      question3: 0, // På intet tidspunkt
      question4: 0, // På intet tidspunkt
      question5: 0  // På intet tidspunkt
    },
    expected: {
      score: 0, // Raw score 0 * 4 = 0
      interpretationKeyword: 'dårligt',
      riskLevel: 'poor'
    }
  },
  {
    name: 'Mixed responses - Below average (Score 36)',
    patient: who5TestPatients[2],
    inputs: {
      question1: 0, // På intet tidspunkt
      question2: 5, // Hele tiden
      question3: 1, // Lidt af tiden
      question4: 2, // Lidt mindre end halvdelen af tiden
      question5: 1  // Lidt af tiden
    },
    expected: {
      score: 36, // Raw score 9 * 4 = 36
      interpretationKeyword: 'under gennemsnit',
      riskLevel: 'below_average'
    }
  },
  {
    name: 'Boundary case - Just above depression threshold (Score 32)',
    patient: who5TestPatients[3],
    inputs: {
      question1: 2, // Lidt mindre end halvdelen af tiden
      question2: 2, // Lidt mindre end halvdelen af tiden
      question3: 2, // Lidt mindre end halvdelen af tiden
      question4: 1, // Lidt af tiden
      question5: 1  // Lidt af tiden
    },
    expected: {
      score: 32, // Raw score 8 * 4 = 32
      interpretationKeyword: 'under gennemsnit',
      riskLevel: 'below_average'
    }
  }
]

// Age boundary tests for WHO-5
export const who5AgeBoundaryTests = [
  { age: 15, shouldFail: true },   // Below minimum
  { age: 16, shouldFail: false },  // Minimum valid
  { age: 25, shouldFail: false },  // Normal adult
  { age: 65, shouldFail: false },  // Elderly adult
  { age: 110, shouldFail: false }, // Maximum valid
  { age: 111, shouldFail: true }   // Above maximum
]

// Re-export mobile viewports from shared test data
export { mobileViewports }

// WHO-5 answer options mapping
export const who5AnswerOptions = {
  5: 'Hele tiden',
  4: 'Det mest af tiden',
  3: 'Lidt mere end halvdelen af tiden',
  2: 'Lidt mindre end halvdelen af tiden',
  1: 'Lidt af tiden',
  0: 'På intet tidspunkt'
}

// WHO-5 scoring thresholds
export const who5ScoringThresholds = {
  poor: { min: 0, max: 28 },
  below_average: { min: 29, max: 49 },
  average: { min: 50, max: 67 },
  good: { min: 68, max: 84 },
  excellent: { min: 85, max: 100 }
}

// Clinical interpretation mapping
export const who5ClinicalInterpretations = {
  poor: 'Dårligt velbefindende - mulig depression',
  below_average: 'Under gennemsnit',
  average: 'Gennemsnitligt',
  good: 'Godt',
  excellent: 'Fremragende velbefindende'
}

// Recommendation mapping
export const who5Recommendations = {
  poor: ['Kontakt læge for depression screening', 'Overvej psykologisk støtte'],
  below_average: ['Kontakt læge for depression screening', 'Overvej psykologisk støtte'],
  average: ['Fortsæt gode vaner', 'Regelmæssig motion og social kontakt'],
  good: ['Fortsæt gode vaner', 'Regelmæssig motion og social kontakt'],
  excellent: ['Fortsæt gode vaner', 'Regelmæssig motion og social kontakt']
}