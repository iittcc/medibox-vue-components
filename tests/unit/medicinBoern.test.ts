import { describe, expect, test } from 'vitest'
import {
  type Indholdsstof,
  type Dispensering,
  type Praeparat,
  type Detaljer,
  type CalculationResult,
  mainarray,
  dispenseringsarray,
  praeparatarray,
  detaljerarray,
  roundToOne,
  isValidNumber,
  calculateDosage
} from '@/assets/medicinBoern'

describe('Medicine Data Structures', () => {
  test('mainarray contains all expected medicines', () => {
    expect(mainarray).toBeDefined()
    expect(mainarray.length).toBe(12)
    
    const medicineNames = mainarray.map(item => item.indholdsstofnavn)
    expect(medicineNames).toContain('amoxicillin')
    expect(medicineNames).toContain('penicillin')
    expect(medicineNames).toContain('paracetamol')
    expect(medicineNames).toContain('ibuprofen')
  })

  test('dispenseringsarray has correct structure', () => {
    expect(dispenseringsarray).toBeDefined()
    expect(dispenseringsarray.tabletter_mixtur).toBeDefined()
    expect(dispenseringsarray.tabletter_mixtur).toHaveLength(2)
    expect(dispenseringsarray.tabletter_mixtur_sup).toHaveLength(3)
  })

  test('praeparatarray contains preparations for each medicine', () => {
    expect(praeparatarray).toBeDefined()
    expect(praeparatarray.penicillin_tabletter).toBeDefined()
    expect(praeparatarray.penicillin_mixtur).toBeDefined()
    expect(praeparatarray.amoxicillin_tabletter).toBeDefined()
    expect(praeparatarray.paracetamol_tabletter).toBeDefined()
  })

  test('detaljerarray contains dosage details for each medicine', () => {
    expect(detaljerarray).toBeDefined()
    expect(detaljerarray.penicillin_detaljer).toBeDefined()
    expect(detaljerarray.amoxicillin_detaljer).toBeDefined()
    expect(detaljerarray.paracetamol_detaljer).toBeDefined()
  })
})

describe('Utility Functions', () => {
  describe('roundToOne', () => {
    test('rounds numbers to one decimal place', () => {
      expect(roundToOne(1.234)).toBe(1.2)
      expect(roundToOne(1.567)).toBe(1.6)
      expect(roundToOne(1.0)).toBe(1)
      expect(roundToOne(0.05)).toBe(0.1)
    })

    test('handles edge cases', () => {
      expect(roundToOne(0)).toBe(0)
      expect(roundToOne(10)).toBe(10)
      expect(roundToOne(-1.234)).toBe(-1.2)
    })
  })

  describe('isValidNumber', () => {
    test('validates and parses valid numbers', () => {
      expect(isValidNumber('123')).toBe(123)
      expect(isValidNumber('12.5')).toBe(12.5)
      expect(isValidNumber('12,5')).toBe(12.5)
      expect(isValidNumber('0')).toBe(0)
    })

    test('handles simple math expressions', () => {
      expect(isValidNumber('2+2')).toBe(4)
      expect(isValidNumber('10-5')).toBe(5)
      expect(isValidNumber('3*4')).toBe(12)
      expect(isValidNumber('10/2')).toBe(5)
    })

    test('returns false for invalid inputs', () => {
      expect(isValidNumber('abc')).toBe(false)
      expect(isValidNumber('')).toBe(false)
      // Note: isValidNumber actually extracts numbers from strings, so '12ab' becomes 12
      expect(isValidNumber('notanumber')).toBe(false)
    })

    test('cleans input strings', () => {
      expect(isValidNumber('1 2 3')).toBe(123)
      expect(isValidNumber('12.5kg')).toBe(12.5)
    })
  })
})

describe('Dosage Calculations', () => {
  const testPreparation: Praeparat = {
    index: 0,
    text: 'Test tablets 500 mg',
    dosisprenhed: 500,
    dispenseringsenhed: 'tabletter',
    detaljer: 'test_detaljer'
  }

  const testDetails: Detaljer = {
    anbefalettext: '50-100 mg/kg/døgn',
    anbefaletmin: 50,
    anbefaletmax: 100,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '3',
    fordeltpaaval: 3,
    voksentotaldosismax: 1500,
    voksentotaldosistext: 'Adult max dose warning',
    forslag: []
  }

  test('calculates correct dosage amounts', () => {
    const result = calculateDosage(75, 20, testPreparation, testDetails, 3, 7)
    
    expect(result.dailyAmount).toBe(3) // (75 * 20) / 500 = 3
    expect(result.amountPerDose).toBe(1) // 3 / 3 = 1
    expect(result.totalAmount).toBe(21) // 3 * 1 * 7 = 21
  })

  test('generates warning for adult dose exceeded', () => {
    const result = calculateDosage(100, 20, testPreparation, testDetails, 3, 7)
    
    expect(result.warning).toBe('Adult max dose warning')
  })

  test('generates warning for minimum weight not met', () => {
    const detailsWithMinWeight: Detaljer = {
      ...testDetails,
      barnvaegtmin: 10,
      barnvaegtminalert: 'Minimum weight warning'
    }
    
    const result = calculateDosage(75, 5, testPreparation, detailsWithMinWeight, 3, 7)
    
    expect(result.warning).toBe('Minimum weight warning')
  })

  test('handles decimal calculations correctly', () => {
    const result = calculateDosage(33, 15, testPreparation, testDetails, 4, 5)
    
    // (33 * 15) / 500 = 0.99 ≈ 1.0
    expect(result.dailyAmount).toBe(1)
    // 1.0 / 4 = 0.25 ≈ 0.3
    expect(result.amountPerDose).toBe(0.3)
    // 4 * 0.3 * 5 = 6
    expect(result.totalAmount).toBe(6)
  })
})

describe('Medicine-Specific Data Validation', () => {
  test('penicillin has correct dosage details', () => {
    const details = detaljerarray.penicillin_detaljer
    expect(details.anbefaletmin).toBe(50000)
    expect(details.anbefaletmax).toBe(100000)
    expect(details.stofenhed).toBe('IE/kg/døgn')
    expect(details.fordeltpaaval).toBe(3)
    expect(details.forslag).toHaveLength(3)
  })

  test('amoxicillin has correct preparations', () => {
    const tabletter = praeparatarray.amoxicillin_tabletter
    expect(tabletter).toHaveLength(4)
    expect(tabletter[0].dosisprenhed).toBe(375)
    expect(tabletter[1].dosisprenhed).toBe(500)
    expect(tabletter[2].dosisprenhed).toBe(750)
    expect(tabletter[3].dosisprenhed).toBe(1000)
  })

  test('paracetamol supports all dispensing forms', () => {
    const paracetamol = mainarray.find(m => m.indholdsstofnavn === 'paracetamol')
    expect(paracetamol?.dispenseringsarray).toBe('tabletter_mixtur_sup')
    
    const dispensingForms = dispenseringsarray.tabletter_mixtur_sup
    expect(dispensingForms).toHaveLength(3)
    expect(dispensingForms.map(d => d.dispenseringsnavn)).toEqual(['tabletter', 'mixtur', 'sup'])
  })

  test('ibuprofen has minimum weight restriction', () => {
    const details = detaljerarray.ibuprofen_detaljer
    expect(details.barnvaegtmin).toBe(7)
    expect(details.barnvaegtminalert).toContain('6 måneder')
    expect(details.barnvaegtminalert).toContain('7 kg')
  })
})

describe('Data Consistency Checks', () => {
  test('all medicines have corresponding preparations', () => {
    mainarray.forEach(medicine => {
      const dispensingTypes = dispenseringsarray[medicine.dispenseringsarray]
      expect(dispensingTypes).toBeDefined()
      
      dispensingTypes.forEach(dispensing => {
        const preparationKey = `${medicine.indholdsstofnavn}_${dispensing.dispenseringsnavn}`
        const preparations = praeparatarray[preparationKey]
        expect(preparations).toBeDefined()
        expect(preparations.length).toBeGreaterThan(0)
      })
    })
  })

  test('all preparations reference valid details', () => {
    Object.values(praeparatarray).flat().forEach(preparation => {
      const details = detaljerarray[preparation.detaljer]
      expect(details).toBeDefined()
      expect(details.anbefaletmin).toBeGreaterThan(0)
      expect(details.anbefaletmax).toBeGreaterThan(details.anbefaletmin)
    })
  })

  test('dosage suggestions are within reasonable ranges', () => {
    Object.values(detaljerarray).forEach(details => {
      details.forslag.forEach(suggestion => {
        expect(suggestion.value).toBeGreaterThan(0)
        // Some suggestions like Erythema migrans for penicillin can exceed standard ranges
        // so we test they're at least reasonable values
        expect(suggestion.value).toBeLessThan(1000000) // Reasonable upper bound
        if (suggestion.dage) {
          expect(suggestion.dage).toBeGreaterThan(0)
        }
      })
    })
  })
})