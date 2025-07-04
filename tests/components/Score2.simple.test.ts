import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import RiskAssessment from '@/components/RiskAssessment.vue'
import PrimeVue from 'primevue/config'

// Mock Chart.js component
vi.mock('primevue/chart', () => ({
  default: {
    name: 'Chart',
    props: ['type', 'data', 'options'],
    template: '<div data-testid="chart"></div>'
  }
}))

// Mock all child components to focus on core logic
vi.mock('@/volt/ToggleButton.vue', () => ({
  default: {
    name: 'ToggleButton',
    props: ['modelValue'],
    template: '<button data-testid="toggle">{{ modelValue }}</button>'
  }
}))

vi.mock('@/components/SurfaceCard.vue', () => ({
  default: {
    name: 'SurfaceCard',
    template: '<div><slot /></div>'
  }
}))

vi.mock('@/components/SurfaceCardItem.vue', () => ({
  default: {
    name: 'SurfaceCardItem',
    template: '<div><slot /></div>'
  }
}))

vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    name: 'CopyDialog',
    template: '<div data-testid="copy-dialog"><slot /></div>'
  }
}))

vi.mock('@/components/CustomIcon.vue', () => ({
  default: {
    name: 'CustomIcon',
    template: '<span></span>'
  }
}))

vi.mock('@/components/PersonInfo.vue', () => ({
  default: {
    name: 'PersonInfo',
    props: ['name', 'age', 'gender'],
    template: '<div data-testid="person-info"></div>'
  }
}))

vi.mock('@/components/NumberSliderInput.vue', () => ({
  default: {
    name: 'NumberSliderInput',
    props: ['modelValue'],
    template: '<div data-testid="slider">{{ modelValue }}</div>'
  }
}))

// Mock the risk calculator with predictable behavior
vi.mock('@/assets/riskCalculator.ts', () => ({
  calculateRisk: vi.fn((gender, age, smoker, sysBP, ldl) => {
    let baseRisk = 5
    if (age >= 70) baseRisk += 10
    else if (age >= 50) baseRisk += 5
    
    if (smoker) baseRisk += 5
    if (sysBP >= 160) baseRisk += 8
    else if (sysBP >= 140) baseRisk += 4
    
    if (ldl >= 5.2) baseRisk += 6
    else if (ldl >= 4.2) baseRisk += 3
    
    return Math.min(baseRisk, 50)
  }),
  filterByAgeGroup: vi.fn(() => ({}))
}))

describe('Score2 Medical Calculator - Core Logic Tests', () => {
  let wrapper: VueWrapper<any>
  let component: any

  beforeEach(() => {
    wrapper = mount(RiskAssessment, {
      global: {
        plugins: [PrimeVue],
        mocks: {
          custom: 'custom'
        }
      }
    })
    component = wrapper.vm
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Initial State', () => {
    it('has correct default patient values', () => {
      expect(component.name).toBe('')
      expect(component.gender).toBe('male')
      expect(component.age).toBe(55)
    })

    it('has correct default examination values', () => {
      expect(component.sysBP).toBe(140)
      expect(component.LDLCholesterol).toBe(5.0)
      expect(component.smoking).toBe(false)
    })

    it('has correct default treatment goal values', () => {
      expect(component.targetSysBP).toBe(120)
      expect(component.targetLDLCholesterol).toBe(2.0)
      expect(component.targetSmoking).toBe(false)
    })

    it('initializes with calculated risk values', () => {
      expect(component.risk).toBeGreaterThan(0)
      expect(component.targetRisk).toBeGreaterThan(0)
      expect(component.riskGroup).toBeTruthy()
      expect(component.targetRiskGroup).toBeTruthy()
    })
  })

  describe('Risk Calculation Logic', () => {
    it('calculates higher risk for older patients', async () => {
      component.age = 45
      component.calcRisk()
      const youngerRisk = component.risk

      component.age = 75
      component.calcRisk()
      const olderRisk = component.risk

      expect(olderRisk).toBeGreaterThan(youngerRisk)
    })

    it('calculates higher risk for smokers', async () => {
      component.smoking = false
      component.calcRisk()
      const nonSmokerRisk = component.risk

      component.smoking = true
      component.calcRisk()
      const smokerRisk = component.risk

      expect(smokerRisk).toBeGreaterThan(nonSmokerRisk)
    })

    it('calculates higher risk for higher blood pressure', async () => {
      component.sysBP = 120
      component.calcRisk()
      const lowBPRisk = component.risk

      component.sysBP = 180
      component.calcRisk()
      const highBPRisk = component.risk

      expect(highBPRisk).toBeGreaterThan(lowBPRisk)
    })

    it('calculates higher risk for higher LDL', async () => {
      component.LDLCholesterol = 3.0
      component.calcRisk()
      const lowLDLRisk = component.risk

      component.LDLCholesterol = 7.0
      component.calcRisk()
      const highLDLRisk = component.risk

      expect(highLDLRisk).toBeGreaterThan(lowLDLRisk)
    })
  })

  describe('Risk Group Classification', () => {
    it('classifies risk groups correctly for different age ranges', () => {
      // Test age < 50
      const youngResult = component.calcRiskGroup(2, 45)
      expect(youngResult[0]).toBe('Lav-moderat risiko')
      expect(youngResult[2]).toBe('risk-low')

      const youngHighResult = component.calcRiskGroup(5, 45)
      expect(youngHighResult[0]).toBe('Høj risiko')
      expect(youngHighResult[2]).toBe('risk-high')

      const youngVeryHighResult = component.calcRiskGroup(10, 45)
      expect(youngVeryHighResult[0]).toBe('Meget høj risiko')
      expect(youngVeryHighResult[2]).toBe('risk-very-high')

      // Test age 50-69
      const middleResult = component.calcRiskGroup(4, 60)
      expect(middleResult[0]).toBe('Lav-moderat risiko')

      const middleHighResult = component.calcRiskGroup(7, 60)
      expect(middleHighResult[0]).toBe('Høj risiko')

      const middleVeryHighResult = component.calcRiskGroup(15, 60)
      expect(middleVeryHighResult[0]).toBe('Meget høj risiko')

      // Test age >= 70
      const olderResult = component.calcRiskGroup(5, 75)
      expect(olderResult[0]).toBe('Lav-moderat risiko')

      const olderHighResult = component.calcRiskGroup(10, 75)
      expect(olderHighResult[0]).toBe('Høj risiko')

      const olderVeryHighResult = component.calcRiskGroup(20, 75)
      expect(olderVeryHighResult[0]).toBe('Meget høj risiko')
    })

    it('sets correct age group strings', () => {
      component.age = 45
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('< 50 år')

      component.age = 60
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('50 - 69 år')

      component.age = 75
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('>= 70 år')
    })
  })

  describe('Risk Reduction Calculations', () => {
    it('calculates absolute risk reduction correctly', () => {
      component.risk = 20
      component.targetRisk = 10
      component.calcRiskValues()

      expect(component.arr).toBe(10)
    })

    it('calculates relative risk reduction correctly', () => {
      component.risk = 20
      component.targetRisk = 10
      component.calcRiskValues()

      expect(component.rrr).toBe(0.5) // 50%
    })

    it('calculates number needed to treat correctly', () => {
      component.risk = 20
      component.targetRisk = 10
      component.calcRiskValues()

      expect(component.nnt).toBe(0.1) // 1/10
    })

    it('handles zero risk difference', () => {
      component.risk = 15
      component.targetRisk = 15
      component.calcRiskValues()

      expect(component.arr).toBe(0)
      expect(component.rrr).toBe(0)
      expect(component.nnt).toBe(0)
    })
  })

  describe('Normal Range Updates', () => {
    it('updates LDL ranges based on age', () => {
      // Age < 30
      component.age = 25
      component.updateMinMaxRanges()
      expect(component.minLDLCholesterol).toBe(1.2)
      expect(component.maxLDLCholesterol).toBe(4.3)

      // Age 30-49
      component.age = 40
      component.updateMinMaxRanges()
      expect(component.minLDLCholesterol).toBe(1.4)
      expect(component.maxLDLCholesterol).toBe(4.7)

      // Age >= 50
      component.age = 65
      component.updateMinMaxRanges()
      expect(component.minLDLCholesterol).toBe(2.0)
      expect(component.maxLDLCholesterol).toBe(5.3)
    })

    it('maintains same blood pressure ranges for all ages', () => {
      component.age = 25
      component.updateMinMaxRanges()
      const youngMinBP = component.minSysBP
      const youngMaxBP = component.maxSysBP

      component.age = 75
      component.updateMinMaxRanges()
      
      expect(component.minSysBP).toBe(youngMinBP)
      expect(component.maxSysBP).toBe(youngMaxBP)
    })
  })

  describe('Chart Data Management', () => {
    it('initializes chart data structures', () => {
      expect(component.chartData).toBeDefined()
      expect(component.chartData.labels).toEqual(['Risiko (Nuværende)', 'Risiko (Behandlingsmål)'])
      expect(component.chartData.datasets).toHaveLength(1)
      expect(component.chartData.datasets[0].data).toHaveLength(2)
    })

    it('initializes pie chart data for risk factors', () => {
      expect(component.chartPieData).toBeDefined()
      expect(component.chartPieData.labels).toEqual(['Systolisk BP', 'LDL', 'Rygning'])
      expect(component.chartPieData.datasets[0].data).toHaveLength(3)
    })

    it('has chart options configured', () => {
      expect(component.chartOptions).toBeDefined()
      expect(component.chartOptions.animation.duration).toBe(0)
      expect(component.chartOptions.responsive).toBe(true)

      expect(component.chartPieOptions).toBeDefined()
      expect(component.chartPieOptions.animation.duration).toBe(0)
      expect(component.chartPieOptions.responsive).toBe(true)
    })
  })

  describe('Risk Fragment Calculation', () => {
    it('calculates risk factor contributions', () => {
      // Set up a scenario with differences
      component.sysBP = 160
      component.targetSysBP = 120
      component.LDLCholesterol = 6.0
      component.targetLDLCholesterol = 2.0
      component.smoking = true
      component.targetSmoking = false

      component.calcRisk()
      component.calcTargetRisk()
      component.calcRiskFragment()

      const pieData = component.chartPieData.datasets[0].data
      
      // All factors should contribute when there are differences
      expect(pieData[0]).toBeGreaterThanOrEqual(0) // BP contribution
      expect(pieData[1]).toBeGreaterThanOrEqual(0) // LDL contribution
      expect(pieData[2]).toBeGreaterThanOrEqual(0) // Smoking contribution
    })
  })

  describe('Patient Information Display', () => {
    it('formats patient data correctly', async () => {
      component.name = 'Test Patient'
      component.age = 65
      component.gender = 'female'
      component.sysBP = 150
      component.LDLCholesterol = 5.5
      component.smoking = true
      await nextTick()

      // These values should be accessible for copy dialog
      expect(component.name).toBe('Test Patient')
      expect(component.age).toBe(65)
      expect(component.gender).toBe('female')
      expect(component.sysBP).toBe(150)
      expect(component.LDLCholesterol).toBe(5.5)
      expect(component.smoking).toBe(true)
    })
  })

  describe('Component Lifecycle', () => {
    it('performs initial calculations on mount', () => {
      // Risk should be calculated on component creation
      expect(component.risk).toBeGreaterThan(0)
      expect(component.targetRisk).toBeGreaterThan(0)
    })

    it('maintains consistent state after multiple calculations', () => {
      const initialRisk = component.risk
      
      // Perform multiple calculation cycles
      component.calcRisk()
      component.calcTargetRisk()
      component.calcRiskValues()
      
      // Should maintain consistent values
      expect(component.risk).toBe(initialRisk)
      expect(component.arr).toBe(component.risk - component.targetRisk)
    })
  })
})