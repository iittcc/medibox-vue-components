/// <reference types="@vitest/browser/providers/playwright" />
/// <reference types="@vitest/browser/context" />

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import PrimeVue from 'primevue/config'
import WestleyCroupScore from '@/components/WestleyCroupScore.vue'

// Comprehensive mocking to avoid all dependencies
vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => ({
    patientData: { value: { name: '', age: 6, gender: 'male' } },
    calculatorData: { value: { levelOfConsciousness: 0, cyanosis: 0, stridor: 0, airEntry: 0, retractions: 0 } },
    state: { value: { isComplete: false, isSubmitting: false, currentStep: 1 } },
    result: { value: null },
    setFieldValue: vi.fn(),
    submitCalculation: vi.fn(),
    resetCalculator: vi.fn(),
    initializeSteps: vi.fn()
  })
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    add: vi.fn()
  })
}))

describe('Westley Croup Score Simple Test', () => {
  test('component mounts without errors', async () => {
    const screen = render(WestleyCroupScore, {
      global: {
        plugins: [
          [PrimeVue, { 
            theme: 'none',
            unstyled: true
          }]
        ]
      }
    })
     // Check main component title
     await expect.element(screen.getByText('Westley Croup Score')).toBeInTheDocument()
      
     // Check Patient section
     await expect.element(screen.getByText('Patient')).toBeInTheDocument()
     
    // Check form sections are present
    await expect.element(screen.getByText('Bevidsthedsniveau')).toBeInTheDocument()
    await expect.element(screen.getByText('Cyanose')).toBeInTheDocument()
    await expect.element(screen.getByText('Stridor')).toBeInTheDocument()
    await expect.element(screen.getByText('Luftskifte (st.p.)')).toBeInTheDocument()
    await expect.element(screen.getByText('Indtrækninger')).toBeInTheDocument()
    // Just check that the component rendered
    expect(screen.container).toBeDefined()
  })
})