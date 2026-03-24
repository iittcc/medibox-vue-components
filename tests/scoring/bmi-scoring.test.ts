import { describe, it, expect } from 'vitest'
import {
  calculateBmi,
  getBmiCategory,
  calculateIdealWeight,
  calculateBmiResult,
  calculateWeightPlan,
  formatBmiRange,
  BMI_CATEGORIES,
  bmiConfig,
} from '../../src/scoring/bmi'

describe('BMI Scoring', () => {
  describe('calculateBmi', () => {
    it('calculates BMI correctly for standard values', () => {
      // 77 kg / (1.77m)² = 77 / 3.1329 = 24.58
      const bmi = calculateBmi(177, 77)
      expect(bmi).toBeCloseTo(24.58, 1)
    })

    it('calculates BMI for underweight person', () => {
      // 50 kg / (1.75m)² = 50 / 3.0625 = 16.33
      const bmi = calculateBmi(175, 50)
      expect(bmi).toBeCloseTo(16.33, 1)
    })

    it('calculates BMI for obese person', () => {
      // 120 kg / (1.70m)² = 120 / 2.89 = 41.52
      const bmi = calculateBmi(170, 120)
      expect(bmi).toBeCloseTo(41.52, 1)
    })

    it('returns 0 for zero height', () => {
      expect(calculateBmi(0, 77)).toBe(0)
    })

    it('returns 0 for negative height', () => {
      expect(calculateBmi(-10, 77)).toBe(0)
    })
  })

  describe('getBmiCategory', () => {
    it('returns Undervægtig for BMI < 18.5', () => {
      expect(getBmiCategory(16.0).label).toBe('Undervægtig')
      expect(getBmiCategory(18.4).label).toBe('Undervægtig')
    })

    it('returns Normalvægtig for BMI 18.5-25', () => {
      expect(getBmiCategory(18.5).label).toBe('Normalvægtig')
      expect(getBmiCategory(22.0).label).toBe('Normalvægtig')
      expect(getBmiCategory(24.9).label).toBe('Normalvægtig')
    })

    it('returns Overvægtig for BMI 25-30', () => {
      expect(getBmiCategory(25.0).label).toBe('Overvægtig')
      expect(getBmiCategory(27.5).label).toBe('Overvægtig')
      expect(getBmiCategory(29.9).label).toBe('Overvægtig')
    })

    it('returns Fedme klasse I for BMI 30-35', () => {
      expect(getBmiCategory(30.0).label).toBe('Fedme, klasse I')
      expect(getBmiCategory(34.9).label).toBe('Fedme, klasse I')
    })

    it('returns Fedme klasse II for BMI 35-40', () => {
      expect(getBmiCategory(35.0).label).toBe('Fedme, klasse II')
      expect(getBmiCategory(39.9).label).toBe('Fedme, klasse II')
    })

    it('returns Fedme klasse III for BMI >= 40', () => {
      expect(getBmiCategory(40.0).label).toBe('Fedme, klasse III')
      expect(getBmiCategory(50.0).label).toBe('Fedme, klasse III')
    })

    // Threshold boundary tests
    it('boundary: BMI exactly 18.5 is Normalvægtig', () => {
      expect(getBmiCategory(18.5).label).toBe('Normalvægtig')
    })

    it('boundary: BMI exactly 25.0 is Overvægtig', () => {
      expect(getBmiCategory(25.0).label).toBe('Overvægtig')
    })

    it('boundary: BMI exactly 30.0 is Fedme klasse I', () => {
      expect(getBmiCategory(30.0).label).toBe('Fedme, klasse I')
    })

    it('boundary: BMI exactly 35.0 is Fedme klasse II', () => {
      expect(getBmiCategory(35.0).label).toBe('Fedme, klasse II')
    })

    it('boundary: BMI exactly 40.0 is Fedme klasse III', () => {
      expect(getBmiCategory(40.0).label).toBe('Fedme, klasse III')
    })
  })

  describe('calculateIdealWeight', () => {
    it('calculates ideal weight for 177 cm', () => {
      const ideal = calculateIdealWeight(177)
      // 18.5 * (177² / 10000) = 18.5 * 3.1329 = 57.96
      // 25.0 * (177² / 10000) = 25.0 * 3.1329 = 78.32
      expect(ideal.min).toBeCloseTo(58.0, 0)
      expect(ideal.max).toBeCloseTo(78.3, 0)
    })

    it('calculates ideal weight for 160 cm', () => {
      const ideal = calculateIdealWeight(160)
      // 18.5 * (160² / 10000) = 18.5 * 2.56 = 47.36
      // 25.0 * (160² / 10000) = 25.0 * 2.56 = 64.00
      expect(ideal.min).toBeCloseTo(47.4, 0)
      expect(ideal.max).toBe(64.0)
    })

    it('calculates ideal weight for 190 cm', () => {
      const ideal = calculateIdealWeight(190)
      // 18.5 * (190² / 10000) = 18.5 * 3.61 = 66.785
      // 25.0 * (190² / 10000) = 25.0 * 3.61 = 90.25
      expect(ideal.min).toBeCloseTo(66.8, 0)
      expect(ideal.max).toBeCloseTo(90.3, 0)
    })
  })

  describe('calculateBmiResult', () => {
    it('returns complete BMI result', () => {
      const result = calculateBmiResult(177, 77)
      expect(result.bmi).toBeCloseTo(24.58, 1)
      expect(result.category.label).toBe('Normalvægtig')
      expect(result.idealWeightMin).toBeGreaterThan(50)
      expect(result.idealWeightMax).toBeGreaterThan(70)
    })

    it('returns correct category for overweight', () => {
      const result = calculateBmiResult(170, 90)
      expect(result.bmi).toBeCloseTo(31.14, 1)
      expect(result.category.label).toBe('Fedme, klasse I')
    })
  })

  describe('calculateWeightPlan', () => {
    it('calculates weight plan for weight loss', () => {
      const plan = calculateWeightPlan(77, -3, 10)
      expect(plan.startWeight).toBe(77)
      expect(plan.targetWeight).toBe(74)
      expect(plan.weeks).toBe(10)
      expect(plan.weeklyChange).toBeCloseTo(-0.3, 1)
      expect(plan.points).toHaveLength(11) // 0 through 10
      expect(plan.points[0].weight).toBe(77)
      expect(plan.points[10].weight).toBe(74)
    })

    it('calculates weight plan for weight gain', () => {
      const plan = calculateWeightPlan(60, 5, 10)
      expect(plan.startWeight).toBe(60)
      expect(plan.targetWeight).toBe(65)
      expect(plan.points[0].weight).toBe(60)
      expect(plan.points[10].weight).toBe(65)
    })

    it('handles 1 week plan', () => {
      const plan = calculateWeightPlan(80, -2, 1)
      expect(plan.points).toHaveLength(2)
      expect(plan.points[0].weight).toBe(80)
      expect(plan.points[1].weight).toBe(78)
    })

    it('handles 0 weeks gracefully', () => {
      const plan = calculateWeightPlan(80, -2, 0)
      expect(plan.weeklyChange).toBe(0)
      expect(plan.points).toHaveLength(1)
    })

    it('week numbers are sequential', () => {
      const plan = calculateWeightPlan(77, -5, 5)
      plan.points.forEach((p, i) => {
        expect(p.week).toBe(i)
      })
    })
  })

  describe('formatBmiRange', () => {
    it('formats normal range', () => {
      expect(formatBmiRange(BMI_CATEGORIES[1])).toBe('18.5 – 25.0')
    })

    it('formats open-ended range', () => {
      expect(formatBmiRange(BMI_CATEGORIES[5])).toBe('40.0 +')
    })
  })

  describe('BMI_CATEGORIES', () => {
    it('has 6 categories', () => {
      expect(BMI_CATEGORIES).toHaveLength(6)
    })

    it('categories cover full range without gaps', () => {
      for (let i = 1; i < BMI_CATEGORIES.length; i++) {
        expect(BMI_CATEGORIES[i].minBmi).toBe(BMI_CATEGORIES[i - 1].maxBmi)
      }
    })

    it('first category starts at 0', () => {
      expect(BMI_CATEGORIES[0].minBmi).toBe(0)
    })
  })

  describe('bmiConfig', () => {
    it('has correct defaults', () => {
      expect(bmiConfig.defaultHeight).toBe(177)
      expect(bmiConfig.defaultWeight).toBe(77)
      expect(bmiConfig.defaultWeightChange).toBe(-3)
      expect(bmiConfig.defaultWeeks).toBe(10)
    })

    it('has valid slider ranges', () => {
      expect(bmiConfig.minHeight).toBeLessThan(bmiConfig.maxHeight)
      expect(bmiConfig.minWeight).toBeLessThan(bmiConfig.maxWeight)
      expect(bmiConfig.minWeightChange).toBeLessThan(bmiConfig.maxWeightChange)
      expect(bmiConfig.minWeeks).toBeLessThan(bmiConfig.maxWeeks)
    })
  })

  // Parity tests — match legacy calculator behavior
  describe('parity with legacy calculator', () => {
    it('177cm 77kg = BMI 24.6 Normalvægtig', () => {
      const bmi = calculateBmi(177, 77)
      expect(Number(bmi.toFixed(1))).toBe(24.6)
      expect(getBmiCategory(bmi).label).toBe('Normalvægtig')
    })

    it('177cm 77kg ideal weight = 58.0 - 78.3', () => {
      const ideal = calculateIdealWeight(177)
      expect(ideal.min).toBe(58.0)
      expect(ideal.max).toBe(78.3)
    })

    it('170cm 90kg = BMI 31.1 Fedme klasse I', () => {
      const bmi = calculateBmi(170, 90)
      expect(Number(bmi.toFixed(1))).toBe(31.1)
      expect(getBmiCategory(bmi).label).toBe('Fedme, klasse I')
    })

    it('180cm 60kg = BMI 18.5 Normalvægtig (boundary)', () => {
      // 60 / (180² / 10000) = 60 / 3.24 = 18.518...
      const bmi = calculateBmi(180, 60)
      expect(bmi).toBeGreaterThanOrEqual(18.5)
      expect(getBmiCategory(bmi).label).toBe('Normalvægtig')
    })
  })
})
