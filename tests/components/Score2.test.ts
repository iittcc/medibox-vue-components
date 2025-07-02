import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import RiskAssessment from '@/components/RiskAssessment.vue'
import PrimeVue from 'primevue/config'

// Mock all dependencies
vi.mock('primevue/chart', () => ({
  default: {
    name: 'Chart',
    props: ['type', 'data', 'options'],
    template: '<div data-testid="chart" :data-type="type"></div>'
  }
}))

vi.mock('@/volt/ToggleButton.vue', () => ({
  default: {
    name: 'ToggleButton',
    props: ['modelValue', 'onLabel', 'offLabel'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return { emit }
    },
    template: `
      <button 
        data-testid="toggle-button" 
        @click="emit('update:modelValue', !modelValue)"
        :data-value="modelValue"
      >
        {{ modelValue ? onLabel : offLabel }}
      </button>
    `
  }
}))

vi.mock('@/components/SurfaceCard.vue', () => ({
  default: {
    name: 'SurfaceCard',
    props: ['title'],
    template: `
      <div data-testid="surface-card" :data-title="title">
        <slot name="button" />
        <slot name="content" />
      </div>
    `
  }
}))

vi.mock('@/components/SurfaceCardItem.vue', () => ({
  default: {
    name: 'SurfaceCardItem',
    template: `
      <div data-testid="surface-card-item">
        <slot name="icon" />
        <slot name="title" />
        <slot name="content" />
      </div>
    `
  }
}))

vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    name: 'CopyDialog',
    props: ['title', 'info'],
    template: `
      <div data-testid="copy-dialog">
        <slot name="container" />
      </div>
    `
  }
}))

vi.mock('@/components/CustomIcon.vue', () => ({
  default: {
    name: 'CustomIcon',
    props: ['icon'],
    template: '<span data-testid="custom-icon" :data-icon="icon"></span>'
  }
}))

vi.mock('@/components/PersonInfo.vue', () => ({
  default: {
    name: 'PersonInfo',
    props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay'],
    emits: ['update:name', 'update:age', 'update:gender'],
    template: `
      <div data-testid="person-info">
        <input 
          :value="name" 
          @input="$emit('update:name', $event.target.value)"
          data-testid="name-input"
        />
        <input 
          type="number"
          :value="age" 
          @input="$emit('update:age', parseInt($event.target.value))"
          data-testid="age-input"
        />
        <select 
          :value="gender" 
          @change="$emit('update:gender', $event.target.value)"
          data-testid="gender-select"
        >
          <option value="Mand">Mand</option>
          <option value="Kvinde">Kvinde</option>
        </select>
      </div>
    `
  }
}))

vi.mock('@/components/NumberSliderInput.vue', () => ({
  default: {
    name: 'NumberSliderInput',
    props: ['modelValue', 'min', 'max', 'mode', 'showButtons', 'step', 'suffix', 'normalMin', 'normalMax', 'tooltip', 'sliderType'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return { emit }
    },
    template: `
      <div data-testid="number-slider-input">
        <input 
          type="range"
          :value="modelValue"
          :min="min"
          :max="max"
          :step="step"
          @input="emit('update:modelValue', parseFloat($event.target.value))"
          data-testid="slider"
        />
        <span>{{ modelValue }}{{ suffix }}</span>
      </div>
    `
  }
}))

// Mock the risk calculator functions
vi.mock('@/assets/riskCalculator.ts', () => ({
  calculateRisk: vi.fn((gender, age, smoker, sysBP, ldl) => {
    // Simplified risk calculation for testing
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

describe('Score2 Risk Assessment Component', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(RiskAssessment, {
      global: {
        plugins: [PrimeVue],
        mocks: {
          custom: 'custom'
        }
      }
    })
  })

  describe('Basic Rendering', () => {
    it('renders the component with medical calculator container', () => {
      expect(wrapper.find('.medical-calculator-container').exists()).toBe(true)
    })

    it('displays all main sections', () => {
      const cards = wrapper.findAll('[data-testid="surface-card"]')
      const titles = cards.map(card => card.attributes('data-title'))
      
      expect(titles).toContain('Oplysninger')
      expect(titles).toContain('Undersøgelse')
      expect(titles).toContain('Behandlingsmål')
      expect(titles).toContain('Resultat')
      expect(titles).toContain('Behandlingsmål effekt')
      expect(titles).toContain('Behandlingsmål effektfraktion')
    })

    it('renders copy dialog in information section', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
    })

    it('displays both bar and pie charts', () => {
      const charts = wrapper.findAll('[data-testid="chart"]')
      expect(charts).toHaveLength(2)
      expect(charts[0].attributes('data-type')).toBe('bar')
      expect(charts[1].attributes('data-type')).toBe('pie')
    })
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      const component = wrapper.vm as any
      
      expect(component.name).toBe('')
      expect(component.gender).toBe('Mand')
      expect(component.age).toBe(55)
      expect(component.sysBP).toBe(140)
      expect(component.LDLCholesterol).toBe(5.0)
      expect(component.smoking).toBe(false)
      expect(component.targetSysBP).toBe(120)
      expect(component.targetLDLCholesterol).toBe(2.0)
      expect(component.targetSmoking).toBe(false)
    })

    it('initializes risk values on mount', () => {
      const component = wrapper.vm as any
      
      expect(component.risk).toBeGreaterThan(-1)
      expect(component.targetRisk).toBeGreaterThan(-1)
      expect(component.riskGroup).toBeTruthy()
      expect(component.targetRiskGroup).toBeTruthy()
    })

    it('has correct normal range values for default age and gender', () => {
      const component = wrapper.vm as any
      
      // For male age 55 - values will be updated based on actual calculation
      expect(component.minSysBP).toBeGreaterThan(0)
      expect(component.maxSysBP).toBeGreaterThan(component.minSysBP)
      expect(component.minLDLCholesterol).toBeGreaterThan(0)
      expect(component.maxLDLCholesterol).toBeGreaterThan(component.minLDLCholesterol)
    })
  })

  describe('Form Interactions', () => {
    it('updates person information through PersonInfo component', async () => {
      const component = wrapper.vm as any
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      
      // Update name
      personInfo.vm.$emit('update:name', 'Test Patient')
      await nextTick()
      expect(component.name).toBe('Test Patient')
      
      // Update age
      personInfo.vm.$emit('update:age', 65)
      await nextTick()
      expect(component.age).toBe(65)
      
      // Update gender
      personInfo.vm.$emit('update:gender', 'Kvinde')
      await nextTick()
      expect(component.gender).toBe('Kvinde')
    })

    it('updates examination values through sliders', async () => {
      const component = wrapper.vm as any
      const sliders = wrapper.findAllComponents({ name: 'NumberSliderInput' })
      
      // Update systolic BP
      if (sliders.length > 0) {
        sliders[0].vm.emit('update:modelValue', 160)
        await nextTick()
        expect(component.sysBP).toBe(160)
      }
      
      // Update LDL cholesterol
      if (sliders.length > 1) {
        sliders[1].vm.emit('update:modelValue', 6.0)
        await nextTick()
        expect(component.LDLCholesterol).toBe(6.0)
      }
    })

    it('updates smoking status through toggle button', async () => {
      const component = wrapper.vm as any
      const toggleButtons = wrapper.findAllComponents({ name: 'ToggleButton' })
      
      // Toggle smoking status
      if (toggleButtons.length > 0) {
        toggleButtons[0].vm.emit('update:modelValue', true)
        await nextTick()
        expect(component.smoking).toBe(true)
      }
    })

    it('updates treatment goal values', async () => {
      const component = wrapper.vm as any
      const sliders = wrapper.findAllComponents({ name: 'NumberSliderInput' })
      
      // Update target systolic BP
      if (sliders.length > 2) {
        sliders[2].vm.emit('update:modelValue', 110)
        await nextTick()
        expect(component.targetSysBP).toBe(110)
      }
      
      // Update target LDL
      if (sliders.length > 3) {
        sliders[3].vm.emit('update:modelValue', 1.8)
        await nextTick()
        expect(component.targetLDLCholesterol).toBe(1.8)
      }
    })
  })

  describe('Risk Calculation', () => {
    it('calculates risk when examination values change', async () => {
      const component = wrapper.vm as any
      const initialRisk = component.risk
      
      // Change values that should increase risk
      component.sysBP = 180
      component.LDLCholesterol = 7.0
      component.smoking = true
      await nextTick()
      
      expect(component.risk).toBeGreaterThan(initialRisk)
    })

    it('calculates target risk when treatment goals change', async () => {
      const component = wrapper.vm as any
      
      // Set higher initial target values
      component.targetSysBP = 150
      component.targetLDLCholesterol = 5.0
      component.targetSmoking = true
      component.calcTargetRisk()
      await nextTick()
      const initialTargetRisk = component.targetRisk
      
      // Change to better treatment goals
      component.targetSysBP = 110
      component.targetLDLCholesterol = 1.5
      component.targetSmoking = false
      component.calcTargetRisk()
      await nextTick()
      
      expect(component.targetRisk).toBeLessThan(initialTargetRisk)
    })

    it('calculates risk reduction metrics correctly', async () => {
      const component = wrapper.vm as any
      
      // Set specific values for predictable calculation
      component.risk = 20
      component.targetRisk = 10
      component.calcRiskValues()
      await nextTick()
      
      expect(component.arr).toBe(10) // Absolute risk reduction
      expect(component.rrr).toBe(0.5) // Relative risk reduction
      expect(component.nnt).toBe(0.1) // Number needed to treat (1/arr)
    })

    it('handles zero risk difference correctly', async () => {
      const component = wrapper.vm as any
      
      component.risk = 10
      component.targetRisk = 10
      component.calcRiskValues()
      await nextTick()
      
      expect(component.arr).toBe(0)
      expect(component.rrr).toBe(0)
      expect(component.nnt).toBe(0)
    })
  })

  describe('Risk Group Classification', () => {
    it('classifies risk correctly for age < 50', async () => {
      const component = wrapper.vm as any
      component.age = 45
      await nextTick()
      
      // Test low risk
      const lowRiskResult = component.calcRiskGroup(2, component.age)
      expect(lowRiskResult[0]).toBe('Lav-moderat risiko')
      expect(lowRiskResult[2]).toBe('risk-low')
      
      // Test high risk
      const result = component.calcRiskGroup(5, component.age)
      expect(result[0]).toBe('Høj risiko')
      expect(result[2]).toBe('risk-high')
      
      // Test very high risk
      const veryHighResult = component.calcRiskGroup(10, component.age)
      expect(veryHighResult[0]).toBe('Meget høj risiko')
      expect(veryHighResult[2]).toBe('risk-very-high')
    })

    it('classifies risk correctly for age 50-69', async () => {
      const component = wrapper.vm as any
      component.age = 60
      await nextTick()
      
      // Test boundaries
      expect(component.riskGroupLowStr).toBe('<5%')
      expect(component.riskGroupHighStr).toBe('5% til <10%')
      expect(component.riskGroupVeryHighStr).toBe('>=10%')
    })

    it('classifies risk correctly for age >= 70', async () => {
      const component = wrapper.vm as any
      component.age = 75
      await nextTick()
      
      // Test boundaries
      expect(component.riskGroupLowStr).toBe('<7.5%')
      expect(component.riskGroupHighStr).toBe('7.5% til <15%')
      expect(component.riskGroupVeryHighStr).toBe('>=15%')
    })
  })

  describe('Normal Range Updates', () => {
    it('updates LDL normal ranges based on age', async () => {
      const component = wrapper.vm as any
      
      // Test age < 30
      component.age = 25
      await nextTick()
      expect(component.minLDLCholesterol).toBe(1.2)
      expect(component.maxLDLCholesterol).toBe(4.3)
      
      // Test age 30-49
      component.age = 40
      await nextTick()
      expect(component.minLDLCholesterol).toBe(1.4)
      expect(component.maxLDLCholesterol).toBe(4.7)
      
      // Test age >= 50
      component.age = 65
      await nextTick()
      expect(component.minLDLCholesterol).toBe(2.0)
      expect(component.maxLDLCholesterol).toBe(5.3)
    })

    it('maintains same normal ranges for both genders', async () => {
      const component = wrapper.vm as any
      
      // Test male
      component.gender = 'Mand'
      component.age = 55
      component.updateMinMaxRanges()
      await nextTick()
      const maleSysBP = component.minSysBP
      const maleLDL = component.minLDLCholesterol
      
      // Test female
      component.gender = 'Kvinde'
      component.updateMinMaxRanges()
      await nextTick()
      expect(component.minSysBP).toBe(maleSysBP)
      expect(component.minLDLCholesterol).toBe(maleLDL)
    })
  })

  describe('Chart Data Updates', () => {
    it('updates bar chart data when risks change', async () => {
      const component = wrapper.vm as any
      
      // Set risks and trigger chart update
      component.risk = 15
      component.targetRisk = 8
      component.calcRisk()
      component.calcTargetRisk()
      await nextTick()
      
      // Chart data should reflect current calculated risks
      expect(component.chartData.datasets[0].data[0]).toBeGreaterThanOrEqual(0)
      expect(component.chartData.datasets[0].data[1]).toBeGreaterThanOrEqual(0)
    })

    it('updates pie chart data for risk factors', async () => {
      const component = wrapper.vm as any
      
      // The pie chart shows the contribution of each factor to risk reduction
      component.calcRiskFragment()
      await nextTick()
      
      const pieData = component.chartPieData.datasets[0].data
      expect(pieData).toHaveLength(3) // BP, LDL, Smoking
      expect(pieData[0] + pieData[1] + pieData[2]).toBeLessThanOrEqual(100)
    })

    it('updates chart colors based on risk group', async () => {
      const component = wrapper.vm as any
      
      // Set high risk
      component.risk = 25
      component.age = 60
      component.calcRisk()
      await nextTick()
      
      const barColors = component.chartData.datasets[0].backgroundColor
      expect(barColors[0]).toBeTruthy()
    })
  })

  describe('Copy Dialog Content', () => {
    it('displays all patient information in copy dialog', async () => {
      const component = wrapper.vm as any
      component.name = 'Test Patient'
      component.age = 65
      component.gender = 'Mand'
      component.sysBP = 150
      component.LDLCholesterol = 5.5
      component.smoking = true
      await nextTick()
      
      const copyContent = wrapper.find('[data-testid="copy-dialog"]').text()
      
      expect(copyContent).toContain('Test Patient')
      expect(copyContent).toContain('65 år')
      expect(copyContent).toContain('Mand')
      expect(copyContent).toContain('150 mmHg')
      expect(copyContent).toContain('5.5 mmol/L')
      expect(copyContent).toContain('Ja') // Smoking
    })

    it('displays risk assessment results in copy dialog', async () => {
      const component = wrapper.vm as any
      component.risk = 15
      component.targetRisk = 8
      component.riskGroup = 'Høj risiko'
      component.targetRiskGroup = 'Lav-moderat risiko'
      await nextTick()
      
      const copyContent = wrapper.find('[data-testid="copy-dialog"]').text()
      
      expect(copyContent).toContain('Nuværende risiko: Høj risiko (15%)')
      expect(copyContent).toContain('Behandlingsmål risiko: Lav-moderat risiko (8%)')
    })
  })

  describe('Edge Cases', () => {
    it('handles extreme age values', async () => {
      const component = wrapper.vm as any
      
      // Test minimum age
      component.age = 40
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
      
      // Test maximum age
      component.age = 90
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
    })

    it('handles extreme blood pressure values', async () => {
      const component = wrapper.vm as any
      
      // Test minimum BP
      component.sysBP = 20
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
      
      // Test maximum BP
      component.sysBP = 200
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
    })

    it('handles extreme LDL values', async () => {
      const component = wrapper.vm as any
      
      // Test minimum LDL
      component.LDLCholesterol = 0
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
      
      // Test maximum LDL
      component.LDLCholesterol = 8
      await nextTick()
      expect(component.risk).toBeGreaterThan(-1)
    })

    it('displays risk percentage or dash correctly', () => {
      const component = wrapper.vm as any
      
      // Valid risk - test with current calculated risk
      expect(component.risk).toBeGreaterThan(0)
      const riskText = wrapper.text()
      expect(riskText).toMatch(/\d+%/)
      
      // Invalid risk
      component.risk = -1
      expect(wrapper.html()).toContain('-')
    })
  })

  describe('Reactive Behavior', () => {
    it('recalculates current risk when examination values change', async () => {
      const component = wrapper.vm as any
      const initialRisk = component.risk
      
      component.sysBP = 180
      component.LDLCholesterol = 7.0
      component.smoking = true
      await nextTick()
      
      // Risk should change when parameters change
      expect(component.risk).not.toBe(initialRisk)
    })

    it('recalculates target risk when treatment goals change', async () => {
      const component = wrapper.vm as any
      
      // Set different values and trigger calculation
      component.targetSysBP = 180
      component.targetLDLCholesterol = 7.0
      component.targetSmoking = true
      component.calcTargetRisk()
      await nextTick()
      const higherTargetRisk = component.targetRisk
      
      // Change to better treatment goals
      component.targetSysBP = 100
      component.targetLDLCholesterol = 1.0
      component.targetSmoking = false
      component.calcTargetRisk()
      await nextTick()
      
      // Target risk should be lower with better goals
      expect(component.targetRisk).toBeLessThan(higherTargetRisk)
    })

    it('updates both risks when age or gender changes', async () => {
      const component = wrapper.vm as any
      const initialRisk = component.risk
      const initialTargetRisk = component.targetRisk
      
      component.age = 75
      component.gender = 'Kvinde'
      await nextTick()
      
      // Both risks should change when demographics change
      expect(component.risk).not.toBe(initialRisk)
      expect(component.targetRisk).not.toBe(initialTargetRisk)
    })
  })
})

describe('Score2 Unit Tests', () => {
  describe('Risk Group Age String', () => {
    it('returns correct age group strings', () => {
      const component = mount(RiskAssessment).vm as any
      
      // Test < 50
      component.age = 45
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('< 50 år')
      
      // Test 50-69
      component.age = 60
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('50 - 69 år')
      
      // Test >= 70
      component.age = 75
      component.calcRisk()
      expect(component.riskGroupAgeStr).toBe('>= 70 år')
    })
  })

  describe('Risk Fragment Calculation', () => {
    it('calculates risk factor contributions correctly', () => {
      const component = mount(RiskAssessment).vm as any
      
      // Set up scenario where all factors contribute
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
      
      // All factors should have non-zero contribution
      expect(pieData[0]).toBeGreaterThan(0) // BP contribution
      expect(pieData[1]).toBeGreaterThan(0) // LDL contribution
      expect(pieData[2]).toBeGreaterThan(0) // Smoking contribution
      
      // Total should be approximately 100% (allowing for rounding)
      const total = pieData[0] + pieData[1] + pieData[2]
      expect(total).toBeGreaterThanOrEqual(99)
      expect(total).toBeLessThanOrEqual(101)
    })
  })
})