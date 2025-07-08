// Test data fixtures for AUDIT Alcohol Dependency Calculator

import { mobileViewports } from './test-data'

export interface AuditPatientData {
  name: string
  age: number
  gender: 'male' | 'female'
}

export interface AuditInputs {
  question1: number // Hvor tit drikker du alkohol?
  question2: number // Hvor mange genstande drikker du almindeligvis?
  question3: number // Hvor tit drikker du fem genstande eller flere?
  question4: number // Har du ikke kunne stoppe når først begyndt?
  question5: number // Har du ikke kunne gøre det du skulle?
  question6: number // Har du måttet have en lille én om morgenen?
  question7: number // Har du haft dårlig samvittighed?
  question8: number // Har du ikke kunne huske aftenen før?
  question9: number // Er du eller andre kommet til skade?
  question10: number // Har andre været bekymrede?
}

export interface AuditExpectedResult {
  score: number
  interpretationKeyword: string
  riskLevel: 'low' | 'high'
}

export interface AuditTestScenario {
  name: string
  patient: AuditPatientData
  inputs: AuditInputs
  expected: AuditExpectedResult
}

// Test patients for AUDIT (adults 10+)
export const auditTestPatients: AuditPatientData[] = [
  { name: 'Test Patient 1', age: 25, gender: 'male' },
  { name: 'Test Patient 2', age: 45, gender: 'female' },
  { name: 'Test Patient 3', age: 65, gender: 'male' },
  { name: 'Test Patient 4', age: 30, gender: 'female' }
]

// AUDIT test scenarios
export const auditTestScenarios: AuditTestScenario[] = [
  {
    name: 'Low risk - Minimal alcohol use (Score 0)',
    patient: auditTestPatients[0],
    inputs: {
      question1: 0, // Aldrig
      question2: 0, // 1-2
      question3: 0, // Aldrig
      question4: 0, // Aldrig
      question5: 0, // Aldrig
      question6: 0, // Aldrig
      question7: 0, // Aldrig
      question8: 0, // Aldrig
      question9: 0, // Nej
      question10: 0 // Nej
    },
    expected: {
      score: 0,
      interpretationKeyword: 'Lavt',
      riskLevel: 'low'
    }
  },
  {
    name: 'Low risk - Moderate social drinking (Score 5)',
    patient: auditTestPatients[1],
    inputs: {
      question1: 2, // To til fire gange om måneden
      question2: 1, // 3-4
      question3: 1, // Sjældent
      question4: 0, // Aldrig
      question5: 0, // Aldrig
      question6: 0, // Aldrig
      question7: 1, // Sjældent
      question8: 0, // Aldrig
      question9: 0, // Nej
      question10: 0 // Nej
    },
    expected: {
      score: 5,
      interpretationKeyword: 'Lavt',
      riskLevel: 'low'
    }
  },
  {
    name: 'Boundary case - Low risk maximum (Score 7)',
    patient: auditTestPatients[2],
    inputs: {
      question1: 2, // To til fire gange om måneden
      question2: 2, // 5-6
      question3: 1, // Sjældent
      question4: 1, // Sjældent
      question5: 0, // Aldrig
      question6: 0, // Aldrig
      question7: 1, // Sjældent
      question8: 0, // Aldrig
      question9: 0, // Nej
      question10: 0 // Nej
    },
    expected: {
      score: 7,
      interpretationKeyword: 'Lavt',
      riskLevel: 'low'
    }
  },
  {
    name: 'High risk - Alcohol dependency threshold (Score 8)',
    patient: auditTestPatients[3],
    inputs: {
      question1: 3, // To til tre gange om ugen
      question2: 2, // 5-6
      question3: 2, // Månedligt
      question4: 1, // Sjældent
      question5: 0, // Aldrig
      question6: 0, // Aldrig
      question7: 0, // Aldrig
      question8: 0, // Aldrig
      question9: 0, // Nej
      question10: 0 // Nej
    },
    expected: {
      score: 8,
      interpretationKeyword: 'Højt',
      riskLevel: 'high'
    }
  },
  {
    name: 'High risk - Problematic drinking (Score 15)',
    patient: auditTestPatients[0],
    inputs: {
      question1: 3, // To til tre gange om ugen
      question2: 3, // 7-9
      question3: 2, // Månedligt
      question4: 2, // Månedligt
      question5: 1, // Sjældent
      question6: 1, // Sjældent
      question7: 2, // Månedligt
      question8: 1, // Sjældent
      question9: 0, // Nej
      question10: 0 // Nej
    },
    expected: {
      score: 15,
      interpretationKeyword: 'Højt',
      riskLevel: 'high'
    }
  },
  {
    name: 'High risk - Severe alcohol dependency (Score 30)',
    patient: auditTestPatients[1],
    inputs: {
      question1: 4, // Fire gange om ugen eller oftere
      question2: 4, // 10 eller flere
      question3: 4, // Dagligt eller næsten dagligt
      question4: 4, // Næsten dagligt
      question5: 4, // Næsten dagligt
      question6: 4, // Næsten dagligt
      question7: 4, // Næsten dagligt
      question8: 4, // Næsten dagligt
      question9: 2, // Ja, men ikke inden for det seneste år
      question10: 0 // Nej
    },
    expected: {
      score: 30,
      interpretationKeyword: 'Højt',
      riskLevel: 'high'
    }
  }
]

// Edge case scenarios
export const auditEdgeCaseScenarios: AuditTestScenario[] = [
  {
    name: 'Edge case - Maximum possible score (Score 40)',
    patient: auditTestPatients[2],
    inputs: {
      question1: 4, // Fire gange om ugen eller oftere
      question2: 4, // 10 eller flere
      question3: 4, // Dagligt eller næsten dagligt
      question4: 4, // Næsten dagligt
      question5: 4, // Næsten dagligt
      question6: 4, // Næsten dagligt
      question7: 4, // Næsten dagligt
      question8: 4, // Næsten dagligt
      question9: 4, // Ja, inden for det seneste år
      question10: 4 // Ja, inden for det seneste år
    },
    expected: {
      score: 40,
      interpretationKeyword: 'Højt',
      riskLevel: 'high'
    }
  },
  {
    name: 'Edge case - Mixed responses crossing threshold',
    patient: auditTestPatients[3],
    inputs: {
      question1: 1, // Månedligt eller sjældnere
      question2: 0, // 1-2
      question3: 0, // Aldrig
      question4: 0, // Aldrig
      question5: 0, // Aldrig
      question6: 0, // Aldrig
      question7: 1, // Sjældent
      question8: 0, // Aldrig
      question9: 2, // Ja, men ikke inden for det seneste år
      question10: 4 // Ja, inden for det seneste år
    },
    expected: {
      score: 8,
      interpretationKeyword: 'Højt',
      riskLevel: 'high'
    }
  }
]

// Age boundary test cases
export const auditAgeBoundaryTests = [
  { age: 9, shouldBeInvalid: true },   // Below minimum
  { age: 10, shouldBeInvalid: false }, // Minimum valid
  { age: 50, shouldBeInvalid: false }, // Normal adult
  { age: 110, shouldBeInvalid: false }, // Maximum valid
  { age: 111, shouldBeInvalid: true }   // Above maximum
]

// Option mappings for question types
export const auditQuestionOptions = {
  frequency1: [ // Question 1
    { text: 'Aldrig', value: 0 },
    { text: 'Månedligt eller sjældnere', value: 1 },
    { text: 'To til fire gange om måneden', value: 2 },
    { text: 'To til tre gange om ugen', value: 3 },
    { text: 'Fire gange om ugen oftere', value: 4 }
  ],
  drinks: [ // Question 2
    { text: '1-2', value: 0 },
    { text: '3-4', value: 1 },
    { text: '5-6', value: 2 },
    { text: '7-9', value: 3 },
    { text: '10 eller flere', value: 4 }
  ],
  frequency2: [ // Questions 3-8
    { text: 'Aldrig', value: 0 },
    { text: 'Sjældent', value: 1 },
    { text: 'Månedligt', value: 2 },
    { text: 'Ugentligt', value: 3 },
    { text: 'Dagligt eller næsten dagligt', value: 4 }
  ],
  frequency3: [ // Question 5
    { text: 'Aldrig', value: 0 },
    { text: 'Sjældent', value: 1 },
    { text: 'Nogle gange om måneden', value: 2 },
    { text: 'Nogle gange om ugen', value: 3 },
    { text: 'Næsten dagligt', value: 4 }
  ],
  yesNo: [ // Questions 9-10
    { text: 'Nej', value: 0 },
    { text: 'Ja, men ikke inden for det seneste år', value: 2 },
    { text: 'Ja, inden for det seneste år', value: 4 }
  ]
}

// Export mobile viewports from base test data
export { mobileViewports }