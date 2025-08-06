// Test data fixtures for EPDS (Edinburgh Postnatal Depression Scale) Calculator

import { mobileViewports } from './test-data'

export interface EpdsPatientData {
  name: string
  age: number
  gender: 'male' | 'female'
}

export interface EpdsInputs {
  question1: number // Able to laugh and see funny side
  question2: number // Look forward with enjoyment
  question3: number // Blamed self unnecessarily
  question4: number // Anxious or worried for no good reason
  question5: number // Scared or panicky for no good reason
  question6: number // Things have been getting on top of me
  question7: number // Unhappy that I have had difficulty sleeping
  question8: number // Sad or miserable
  question9: number // Unhappy that I have been crying
  question10: number // Thought of harming myself
}

export interface EpdsExpectedResult {
  score: number
  interpretationKeyword: string
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe'
}

export interface EpdsTestScenario {
  name: string
  patient: EpdsPatientData
  inputs: EpdsInputs
  expected: EpdsExpectedResult
}

// Test patients for EPDS (females 12-50, primarily postpartum)
export const epdsTestPatients: EpdsPatientData[] = [
  { name: 'Test Patient 1', age: 25, gender: 'female' },
  { name: 'Test Patient 2', age: 30, gender: 'female' },
  { name: 'Test Patient 3', age: 35, gender: 'female' },
  { name: 'Test Patient 4', age: 28, gender: 'female' }
]

// EPDS test scenarios
export const epdsTestScenarios: EpdsTestScenario[] = [
  {
    name: 'Minimal depression risk (Score 3)',
    patient: epdsTestPatients[0],
    inputs: {
      question1: 0, // Lige så meget som jeg altid har kunnet
      question2: 0, // Lige så meget som jeg tidligere har gjort
      question3: 0, // Nej, slet ikke
      question4: 0, // Nej, overhovedet ikke
      question5: 0, // Nej, overhovedet ikke
      question6: 0, // Nej, jeg har kunne overskue min situation lige så godt, som jeg plejer
      question7: 0, // Nej, aldrig
      question8: 0, // Nej, aldrig
      question9: 0, // Nej, aldrig
      question10: 0 // Aldrig
    },
    expected: {
      score: 0,
      interpretationKeyword: 'Minimal',
      riskLevel: 'minimal'
    }
  },
  {
    name: 'Mild depression risk (Score 6)',
    patient: epdsTestPatients[1],
    inputs: {
      question1: 1, // Ikke helt så meget som tidligere
      question2: 1, // En del mindre end jeg tidligere har gjort
      question3: 1, // Ikke så tit
      question4: 1, // Meget sjældent
      question5: 1, // Nej, ikke meget
      question6: 1, // Nej, det meste af tiden har jeg kunne overskue min situation
      question7: 1, // Sjældent
      question8: 1, // Sjældent
      question9: 1, // Ja, ved enkelte lejligheder
      question10: 1 // Sjældent
    },
    expected: {
      score: 10,
      interpretationKeyword: 'Mild',
      riskLevel: 'mild'
    }
  },
  {
    name: 'Moderate depression risk (Score 15)',
    patient: epdsTestPatients[2],
    inputs: {
      question1: 2, // Afgjort ikke så meget som tidligere
      question2: 2, // Afgjort mindre end jeg tidligere har gjort
      question3: 2, // Ja, af og til
      question4: 2, // Ja, nogle gange
      question5: 2, // Ja, nogle gange
      question6: 2, // Ja, nogle gange
      question7: 2, // Ja, ret tit
      question8: 2, // Ja, ret tit
      question9: 2, // Ja, ret tit
      question10: 2 // Nogle gange
    },
    expected: {
      score: 20,
      interpretationKeyword: 'Moderat',
      riskLevel: 'moderate'
    }
  },
  {
    name: 'Severe depression risk with suicidal thoughts (Score 25)',
    patient: epdsTestPatients[3],
    inputs: {
      question1: 3, // Overhovedet ikke
      question2: 3, // Næsten ikke
      question3: 3, // Ja, det meste af tiden
      question4: 3, // Ja, meget ofte
      question5: 3, // Ja, en hel del
      question6: 3, // Ja, det meste af tiden
      question7: 3, // Ja, det meste af tiden
      question8: 3, // Ja, det meste af tiden
      question9: 3, // Ja, det meste af tiden
      question10: 3 // Ja, ganske ofte
    },
    expected: {
      score: 30,
      interpretationKeyword: 'Moderat',
      riskLevel: 'severe'
    }
  }
]

// EPDS edge case scenarios
export const epdsEdgeCaseScenarios: EpdsTestScenario[] = [
  {
    name: 'Boundary case - Just above threshold (Score 10)',
    patient: epdsTestPatients[0],
    inputs: {
      question1: 1, // Ikke helt så meget som tidligere
      question2: 1, // En del mindre end jeg tidligere har gjort
      question3: 1, // Ikke så tit
      question4: 1, // Meget sjældent
      question5: 1, // Nej, ikke meget
      question6: 1, // Nej, det meste af tiden har jeg kunne overskue min situation
      question7: 1, // Sjældent
      question8: 1, // Sjældent
      question9: 1, // Ja, ved enkelte lejligheder
      question10: 1 // Sjældent
    },
    expected: {
      score: 10,
      interpretationKeyword: 'Behandlingskrævende',
      riskLevel: 'mild'
    }
  },
  {
    name: 'Mixed responses - Moderate risk (Score 14)',
    patient: epdsTestPatients[1],
    inputs: {
      question1: 0, // Lige så meget som jeg altid har kunnet
      question2: 3, // Næsten ikke
      question3: 1, // Ikke så tit
      question4: 2, // Ja, nogle gange
      question5: 1, // Nej, ikke meget
      question6: 2, // Ja, nogle gange
      question7: 1, // Sjældent
      question8: 2, // Ja, ret tit
      question9: 1, // Ja, ved enkelte lejligheder
      question10: 1 // Sjældent
    },
    expected: {
      score: 14,
      interpretationKeyword: 'Behandlingskrævende',
      riskLevel: 'moderate'
    }
  },
  {
    name: 'Suicidal ideation - High priority (Score 18 with Q10 = 3)',
    patient: epdsTestPatients[2],
    inputs: {
      question1: 1, // Ikke helt så meget som tidligere
      question2: 1, // En del mindre end jeg tidligere har gjort
      question3: 1, // Ikke så tit
      question4: 1, // Meget sjældent
      question5: 1, // Nej, ikke meget
      question6: 1, // Nej, det meste af tiden har jeg kunne overskue min situation
      question7: 1, // Sjældent
      question8: 1, // Sjældent
      question9: 1, // Ja, ved enkelte lejligheder
      question10: 3 // Ja, ganske ofte
    },
    expected: {
      score: 12,
      interpretationKeyword: 'Moderat',
      riskLevel: 'severe'
    }
  }
]

// Age boundary tests for EPDS
export const epdsAgeBoundaryTests = [
  { age: 11, shouldFail: true },   // Below minimum
  { age: 12, shouldFail: false },  // Minimum valid
  { age: 25, shouldFail: false },  // Normal adult
  { age: 35, shouldFail: false },  // Typical postpartum age
  { age: 50, shouldFail: false },  // Maximum valid
  { age: 51, shouldFail: true }    // Above maximum
]

// Re-export mobile viewports from shared test data
export { mobileViewports }

// EPDS answer options mapping for each question
export const epdsAnswerOptions = {
  question1: {
    0: 'Lige så meget som jeg altid har kunnet',
    1: 'Ikke helt så meget som tidligere',
    2: 'Afgjort ikke så meget som tidligere',
    3: 'Overhovedet ikke'
  },
  question2: {
    0: 'Lige så meget som jeg tidligere har gjort',
    1: 'En del mindre end jeg tidligere har gjort',
    2: 'Afgjort mindre end jeg tidligere har gjort',
    3: 'Næsten ikke'
  },
  question3: {
    0: 'Nej, slet ikke',
    1: 'Ikke så tit',
    2: 'Ja, af og til',
    3: 'Ja, det meste af tiden'
  },
  question4: {
    0: 'Nej, overhovedet ikke',
    1: 'Meget sjældent',
    2: 'Ja, nogle gange',
    3: 'Ja, meget ofte'
  },
  question5: {
    0: 'Nej, overhovedet ikke',
    1: 'Nej, ikke meget',
    2: 'Ja, nogle gange',
    3: 'Ja, en hel del'
  },
  question6: {
    0: 'Nej, jeg har kunne overskue min situation lige så godt, som jeg plejer',
    1: 'Nej, det meste af tiden har jeg kunne overskue min situation',
    2: 'Ja, nogle gange',
    3: 'Ja, det meste af tiden'
  },
  question7: {
    0: 'Nej, aldrig',
    1: 'Sjældent',
    2: 'Ja, ret tit',
    3: 'Ja, det meste af tiden'
  },
  question8: {
    0: 'Nej, aldrig',
    1: 'Sjældent',
    2: 'Ja, ret tit',
    3: 'Ja, det meste af tiden'
  },
  question9: {
    0: 'Nej, aldrig',
    1: 'Ja, ved enkelte lejligheder',
    2: 'Ja, ret tit',
    3: 'Ja, det meste af tiden'
  },
  question10: {
    0: 'Aldrig',
    1: 'Sjældent',
    2: 'Nogle gange',
    3: 'Ja, ganske ofte'
  }
}

// EPDS scoring thresholds
export const epdsScoringThresholds = {
  minimal: { min: 0, max: 9 },
  mild: { min: 10, max: 12 },
  moderate: { min: 13, max: 19 },
  severe: { min: 20, max: 30 }
}

// Clinical interpretation mapping
export const epdsClinicalInterpretations = {
  minimal: 'Minimal risiko for postnatal depression',
  mild: 'Mild risiko for postnatal depression',
  moderate: 'Moderat til høj risiko for postnatal depression',
  severe: 'Høj risiko for postnatal depression med behov for øjeblikkelig handling'
}

// Recommendation mapping
export const epdsRecommendations = {
  minimal: ['Fortsat observation', 'Støt fra familie og venner'],
  mild: ['Tal med sundhedsplejerske', 'Overvej støttegrupper'],
  moderate: ['Kontakt læge', 'Psykologisk vurdering anbefales'],
  severe: ['Søg øjeblikkelig hjælp', 'Kontakt læge eller akutmodtagelse']
}