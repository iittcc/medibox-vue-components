// Test data fixtures for Westley Croup Score Calculator

export interface PatientData {
  name: string
  age: number
  gender: 'male' | 'female'
}

export interface WestleyCroupInputs {
  levelOfConsciousness: number
  cyanosis: number
  stridor: number
  airEntry: number
  retractions: number
}

export interface ExpectedResult {
  score: number
  interpretation: string
  riskLevel: 'low' | 'moderate' | 'high'
}

export interface TestScenario {
  name: string
  patient: PatientData
  inputs: WestleyCroupInputs
  expected: ExpectedResult
}

// Test patients
export const testPatients: PatientData[] = [
  { name: 'Test Barn 1', age: 3, gender: 'male' },
  { name: 'Test Barn 2', age: 6, gender: 'female' },
  { name: 'Test Barn 3', age: 1, gender: 'male' },
  { name: 'Test Barn 4', age: 8, gender: 'female' }
]

// Westley Croup Score test scenarios
export const testScenarios: TestScenario[] = [
  {
    name: 'Minimal symptoms - Let croup (Score 0)',
    patient: testPatients[0],
    inputs: {
      levelOfConsciousness: 0, // Vågen
      cyanosis: 0,            // Ingen
      stridor: 0,             // Ingen
      airEntry: 0,            // Normal
      retractions: 0          // Ingen
    },
    expected: {
      score: 0,
      interpretation: 'Let croup',
      riskLevel: 'low'
    }
  },
  {
    name: 'Mild symptoms - Let croup (Score 2)',
    patient: testPatients[1],
    inputs: {
      levelOfConsciousness: 0, // Vågen
      cyanosis: 0,            // Ingen
      stridor: 1,             // Ved ophidselse
      airEntry: 1,            // Nedsat
      retractions: 0          // Ingen
    },
    expected: {
      score: 2,
      interpretation: 'Let croup',
      riskLevel: 'low'
    }
  },
  {
    name: 'Moderate symptoms - Moderat croup (Score 3)',
    patient: testPatients[2],
    inputs: {
      levelOfConsciousness: 0, // Vågen
      cyanosis: 0,            // Ingen
      stridor: 1,             // Ved ophidselse
      airEntry: 1,            // Nedsat
      retractions: 1          // Milde
    },
    expected: {
      score: 3,
      interpretation: 'Moderat croup',
      riskLevel: 'moderate'
    }
  },
  {
    name: 'Moderate-high symptoms - Moderat croup (Score 5)',
    patient: testPatients[3],
    inputs: {
      levelOfConsciousness: 0, // Vågen
      cyanosis: 0,            // Ingen
      stridor: 2,             // I hvile
      airEntry: 1,            // Nedsat
      retractions: 2          // Moderate
    },
    expected: {
      score: 5,
      interpretation: 'Moderat croup',
      riskLevel: 'moderate'
    }
  },
  {
    name: 'Severe symptoms - Alvorlig croup (Score 6)',
    patient: testPatients[0],
    inputs: {
      levelOfConsciousness: 0, // Vågen
      cyanosis: 0,            // Ingen
      stridor: 2,             // I hvile
      airEntry: 2,            // Udtalt nedsat
      retractions: 2          // Moderate
    },
    expected: {
      score: 6,
      interpretation: 'Alvorlig croup',
      riskLevel: 'high'
    }
  },
  {
    name: 'Critical symptoms - Alvorlig croup (Score 10)',
    patient: testPatients[1],
    inputs: {
      levelOfConsciousness: 5, // Desorienteret/forvirret
      cyanosis: 0,            // Ingen
      stridor: 2,             // I hvile
      airEntry: 2,            // Udtalt nedsat
      retractions: 1          // Milde
    },
    expected: {
      score: 10,
      interpretation: 'Alvorlig croup',
      riskLevel: 'high'
    }
  },
  {
    name: 'Maximum score - Alvorlig croup (Score 13)',
    patient: testPatients[2],
    inputs: {
      levelOfConsciousness: 5, // Desorienteret/forvirret
      cyanosis: 5,            // I hvile
      stridor: 2,             // I hvile
      airEntry: 1,            // Nedsat
      retractions: 0          // Ingen
    },
    expected: {
      score: 13,
      interpretation: 'Alvorlig croup',
      riskLevel: 'high'
    }
  }
]

// Form option mappings (Danish text to values)
export const formOptions = {
  levelOfConsciousness: {
    'Vågen (eller sovende)': 0,
    'Desorienteret/forvirret': 5
  },
  cyanosis: {
    'Ingen': 0,
    'Ved ophidselse': 4,
    'I hvile': 5
  },
  stridor: {
    'Ingen': 0,
    'Ved ophidselse': 1,
    'I hvile': 2
  },
  airEntry: {
    'Normal': 0,
    'Nedsat': 1,
    'Udtalt nedsat': 2
  },
  retractions: {
    'Ingen': 0,
    'Milde': 1,
    'Moderate': 2,
    'Svære': 3
  }
}

// Edge case scenarios
export const edgeCaseScenarios: TestScenario[] = [
  {
    name: 'Boundary case - Score exactly 2 (still Let croup)',
    patient: testPatients[0],
    inputs: {
      levelOfConsciousness: 0,
      cyanosis: 0,
      stridor: 0,
      airEntry: 2,  // Udtalt nedsat (2 points)
      retractions: 0
    },
    expected: {
      score: 2,
      interpretation: 'Let croup',
      riskLevel: 'low'
    }
  },
  {
    name: 'Boundary case - Score exactly 3 (transitions to Moderat)',
    patient: testPatients[1],
    inputs: {
      levelOfConsciousness: 0,
      cyanosis: 0,
      stridor: 0,
      airEntry: 0,
      retractions: 3  // Svære (3 points)
    },
    expected: {
      score: 3,
      interpretation: 'Moderat croup',
      riskLevel: 'moderate'
    }
  }
]

// Age boundary tests
export const ageBoundaryTests = [
  { age: 0, shouldWork: true, description: 'Minimum age (newborn)' },
  { age: 1, shouldWork: true, description: 'Infant' },
  { age: 6, shouldWork: true, description: 'Typical croup age' },
  { age: 12, shouldWork: true, description: 'Maximum typical age' },
  { age: 15, shouldWork: true, description: 'Above typical range but allowed' }
]

// Mobile viewports for responsive testing
export const mobileViewports = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12' },
  { width: 360, height: 740, name: 'Android' },
  { width: 768, height: 1024, name: 'iPad' }
]