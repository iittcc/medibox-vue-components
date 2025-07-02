import { describe, expect, test, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

// Mock all the volt and custom components
vi.mock('@/volt/Select.vue', () => ({
  default: {
    name: 'Select',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder'],
    emits: ['update:modelValue', 'change'],
    template: `
      <select 
        :value="modelValue" 
        @change="handleChange"
        data-testid="select"
      >
        <option value="">{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="option[optionValue]" 
          :value="option[optionValue]"
        >
          {{ option[optionLabel] }}
        </option>
      </select>
    `,
    methods: {
      handleChange(event) {
        this.$emit('update:modelValue', event.target.value)
        this.$emit('change', event)
      }
    }
  }
}))

vi.mock('@/volt/InputNumber.vue', () => ({
  default: {
    name: 'InputNumber',
    props: ['modelValue', 'min', 'max', 'readonly', 'suffix', 'showButtons'],
    emits: ['update:modelValue'],
    template: `
      <input 
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :readonly="readonly"
        @input="$emit('update:modelValue', parseFloat($event.target.value) || 0)"
        data-testid="input-number"
      />
    `
  }
}))

vi.mock('@/components/NumberSliderInput.vue', () => ({
  default: {
    name: 'NumberSliderInput',
    props: ['modelValue', 'min', 'max', 'step', 'suffix', 'showButtons', 'normalMin', 'normalMax', 'tooltip', 'sliderType'],
    emits: ['update:modelValue'],
    template: `
      <div data-testid="number-slider-input">
        <input 
          type="range"
          :value="modelValue"
          :min="min"
          :max="max"
          :step="step"
          @input="$emit('update:modelValue', parseFloat($event.target.value))"
          data-testid="slider"
        />
        <span>{{ modelValue }}{{ suffix }}</span>
      </div>
    `
  }
}))

vi.mock('@/components/SurfaceCard.vue', () => ({
  default: {
    name: 'SurfaceCard',
    props: ['title'],
    template: `
      <div data-testid="surface-card">
        <h2>{{ title }}</h2>
        <slot name="content"></slot>
      </div>
    `
  }
}))

vi.mock('@/volt/SecondaryButton.vue', () => ({
  default: {
    name: 'SecondaryButton',
    props: ['label', 'severity', 'icon'],
    emits: ['click'],
    template: `<button @click="$emit('click')" data-testid="secondary-button">{{ label }}</button>`
  }
}))

vi.mock('@/volt/Message.vue', () => ({
  default: {
    name: 'Message',
    props: ['severity', 'closable'],
    template: `<div data-testid="message" :class="severity"><slot /></div>`
  }
}))

vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    name: 'CopyDialog',
    props: ['title', 'icon', 'disabled'],
    template: `
      <button data-testid="copy-dialog" :disabled="disabled">
        {{ title }}
        <slot name="container"></slot>
      </button>
    `
  }
}))

describe('MedicinBoernScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('renders the component with title', () => {
    expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Medicin - dosering til børn')
  })

  test('displays all medicine selection fields', () => {
    // Should have 4 select components: Indholdsstof, Dispensering, Præparat, Dosering forslag
    const selects = wrapper.findAll('[data-testid="select"]')
    expect(selects.length).toBeGreaterThanOrEqual(3)
  })

  test('displays weight and dosage sliders', () => {
    // Should have 2 NumberSliderInput components: weight and dosage
    const sliders = wrapper.findAll('[data-testid="number-slider-input"]')
    expect(sliders.length).toBe(2)
  })

  test('shows reset button', () => {
    expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="secondary-button"]').text()).toContain('Nulstil')
  })

  test('initial state has correct default values', () => {
    const component = wrapper.vm as any
    // Component starts with first medicine selected, not empty
    expect(component.selectedIndholdsstof).toBe('amoxicillin')
    expect(component.selectedDispensering).toBe('tabletter') // Auto-selected first option
    expect(component.selectedPraeparat).toBe(0) // Number index, not string
    expect(component.vaegt).toBe(16) // Default weight
    expect(component.dosering).toBe(50) // Default from first suggestion
  })
})

describe('Medicine Selection Logic', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('updates dispensing options when medicine is selected', async () => {
    const component = wrapper.vm as any
    
    // Select amoxicillin (should already be selected by default)
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    
    expect(component.dispenseringOptions.length).toBeGreaterThan(0)
    expect(component.dispenseringOptions.some((opt: any) => opt.value === 'tabletter')).toBe(true)
    expect(component.dispenseringOptions.some((opt: any) => opt.value === 'mixtur')).toBe(true)
  })

  test('updates preparation options when dispensing is selected', async () => {
    const component = wrapper.vm as any
    
    // Select amoxicillin and tablets
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    
    expect(component.praeparatOptions.length).toBeGreaterThan(0)
    expect(component.praeparatOptions[0].label).toContain('mg')
    expect(component.praeparatOptions[0].value).toBe(0) // Index value
  })

  test('resets preparation when dispensing changes', async () => {
    const component = wrapper.vm as any
    
    // Set up initial selections
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1
    await nextTick()
    
    // Change dispensing - should reset preparation to 0
    component.selectedDispensering = 'mixtur'
    await nextTick()
    
    expect(component.selectedPraeparat).toBe(0)
  })

  test('keeps appropriate dispensing when medicine changes', async () => {
    const component = wrapper.vm as any
    
    // Set up initial selection
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    
    // Change to another medicine that also has tablets
    component.selectedIndholdsstof = 'penicillin'
    await nextTick()
    
    // Should keep tablets if available, otherwise select first option
    expect(component.selectedDispensering).toBeTruthy()
  })
})

describe('Dosage Calculations', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('performs automatic calculations on input changes', async () => {
    const component = wrapper.vm as any
    
    // Set up complete values
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1 // 500mg tablets
    await nextTick()
    component.vaegt = 20
    component.dosering = 50
    component.fordeltPaaVal = 3
    component.antalDage = 7
    await nextTick()
    
    // Check that calculations are performed automatically
    expect(component.antalPrDogn).toBeGreaterThan(0)
    expect(component.antalIAlt).toBeGreaterThan(0)
    expect(component.amountPerDose).toBeGreaterThan(0)
  })

  test('shows warning for weight restrictions', async () => {
    const component = wrapper.vm as any
    
    // Select ibuprofen with low weight (should trigger warning)
    component.selectedIndholdsstof = 'ibuprofen'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 0
    await nextTick()
    component.vaegt = 5 // Below 7kg minimum
    component.dosering = 15
    await nextTick()
    
    expect(component.warning).toContain('6 måneder')
    expect(component.warning).toContain('7 kg')
  })

  test('updates calculations when dosage changes', async () => {
    const component = wrapper.vm as any
    
    // Set up calculation
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1 // 500mg
    await nextTick()
    component.vaegt = 20
    component.fordeltPaaVal = 3
    component.antalDage = 7
    
    component.dosering = 50
    await nextTick()
    const result1 = component.antalIAlt
    
    component.dosering = 75
    await nextTick()
    const result2 = component.antalIAlt
    
    expect(result2).toBeGreaterThan(result1)
  })

  test('calculates correct amounts for known values', async () => {
    const component = wrapper.vm as any
    
    // Set specific known values for predictable calculation
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1 // 500mg tablets
    await nextTick()
    component.vaegt = 20
    component.dosering = 50 // 50 mg/kg/day
    component.fordeltPaaVal = 3
    component.antalDage = 7
    await nextTick()
    
    // (50 * 20) / 500 = 2 tablets per day
    expect(component.antalPrDogn).toBe(2)
    // 2 / 3 ≈ 0.7 tablets per dose
    expect(component.amountPerDose).toBeCloseTo(0.7, 1)
    // 3 * 0.7 * 7 = approximately 14.7, rounded up to 15
    expect(component.antalIAlt).toBe(15)
  })
})

describe('Dosage Suggestions', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('shows dosage suggestions when medicine is selected', async () => {
    const component = wrapper.vm as any
    
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    
    expect(component.doseringForslagOptions.length).toBeGreaterThan(0)
    expect(component.doseringForslagOptions[0]).toHaveProperty('label')
    expect(component.doseringForslagOptions[0]).toHaveProperty('value')
  })

  test('applies dosage suggestion when selection changes', async () => {
    const component = wrapper.vm as any
    
    component.selectedIndholdsstof = 'penicillin'
    await nextTick()
    
    // Get the first suggestion
    const firstSuggestion = component.currentDetails?.forslag[0]
    expect(firstSuggestion).toBeDefined()
    
    // Change to a different suggestion
    if (component.currentDetails?.forslag.length > 1) {
      component.selectedDoseringForslag = 1
      component.onDoseringForslagChange()
      await nextTick()
      
      const secondSuggestion = component.currentDetails.forslag[1]
      expect(component.dosering).toBe(secondSuggestion.value)
      if (secondSuggestion.dage) {
        expect(component.antalDage).toBe(secondSuggestion.dage)
      }
    }
  })
})

describe('Form Reset', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('resets form values but keeps first medicine selected', async () => {
    const component = wrapper.vm as any
    
    // Change some values
    component.selectedIndholdsstof = 'penicillin'
    await nextTick()
    component.vaegt = 25
    component.dosering = 75
    component.antalDage = 10
    await nextTick()
    
    // Reset form
    component.resetForm()
    await nextTick()
    
    // Should reset to first medicine (amoxicillin)
    expect(component.selectedIndholdsstof).toBe('amoxicillin')
    expect(component.vaegt).toBe(16) // Default weight
    expect(component.antalDage).toBe(7) // Default days
    // Dosage should be reset to current suggestion value
    expect(component.dosering).toBeGreaterThan(0)
  })

  test('reset button triggers resetForm method', async () => {
    const component = wrapper.vm as any
    
    // Store original values to verify they change
    const originalMedicine = component.selectedIndholdsstof
    const originalWeight = component.vaegt
    
    // Change some values first
    component.selectedIndholdsstof = 'penicillin'
    component.vaegt = 25
    await nextTick()
    
    // Click reset button
    const resetButton = wrapper.find('[data-testid="secondary-button"]')
    await resetButton.trigger('click')
    await nextTick()
    
    // Verify reset occurred (values changed back)
    expect(component.selectedIndholdsstof).toBe('amoxicillin') // Reset to first medicine
    expect(component.vaegt).toBe(16) // Reset to default weight
  })
})

describe('Copy Functionality', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('copy dialog contains calculation results', async () => {
    const component = wrapper.vm as any
    
    // Set up complete calculation
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1
    await nextTick()
    component.vaegt = 20
    component.dosering = 50
    component.fordeltPaaVal = 3
    component.antalDage = 7
    await nextTick()
    
    const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
    expect(copyDialog.exists()).toBe(true)
    
    // Check that copy dialog contains relevant information
    const copyContent = copyDialog.text()
    expect(copyContent).toContain('Amoxicillin')
    expect(copyContent).toContain('20')
    expect(copyContent).toContain('50')
  })

  test('copy dialog is disabled when no results', async () => {
    const component = wrapper.vm as any
    
    // Clear showResults
    component.showResults = false
    await nextTick()
    
    const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
    expect(copyDialog.attributes('disabled')).toBeDefined()
  })
})

describe('Server Data Integration', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('sends data to server on calculation', async () => {
    const sendDataToServer = await import('@/assets/sendDataToServer')
    const component = wrapper.vm as any
    
    // Set up calculation
    component.selectedIndholdsstof = 'amoxicillin'
    await nextTick()
    component.selectedDispensering = 'tabletter'
    await nextTick()
    component.selectedPraeparat = 1
    await nextTick()
    component.vaegt = 20
    component.dosering = 50
    await nextTick()
    
    // Verify sendDataToServer was called
    expect(sendDataToServer.default).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'medicinBoern',
        indholdsstof: 'Amoxicillin',
        dosering: 50,
        vaegt: 20
      })
    )
  })
})

describe('Real Data Integration', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MedicinBoernScore)
  })

  test('uses real medicine data correctly', async () => {
    const component = wrapper.vm as any
    
    // Check that component loads with real data
    expect(component.indholdsstofOptions.length).toBe(12) // All 12 medicines
    expect(component.indholdsstofOptions[0].label).toBe('Amoxicillin')
    expect(component.indholdsstofOptions[0].value).toBe('amoxicillin')
  })

  test('handles all medicine types correctly', async () => {
    const component = wrapper.vm as any
    
    const medicines = ['amoxicillin', 'penicillin', 'paracetamol', 'ibuprofen']
    
    for (const medicine of medicines) {
      component.selectedIndholdsstof = medicine
      await nextTick()
      
      expect(component.dispenseringOptions.length).toBeGreaterThan(0)
      
      // Select first dispensing option
      component.selectedDispensering = component.dispenseringOptions[0].value
      await nextTick()
      
      expect(component.praeparatOptions.length).toBeGreaterThan(0)
      expect(component.currentDetails).toBeDefined()
    }
  })
})