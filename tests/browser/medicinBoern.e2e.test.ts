/// <reference types="@vitest/browser/providers/playwright" />

import { describe, test, expect, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import PrimeVue from 'primevue/config'
import MedicinBoern from '@/MedicinBoern.vue'

// Comprehensive mocking to avoid all dependencies
vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => ({
    patientData: { value: { name: '', age: 6, gender: 'male' } },
    calculatorData: { 
      value: { 
        medicine: '',
        dispensing: '',
        preparation: '',
        weight: 15,
        dosage: 20,
        days: 7
      } 
    },
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

// Mock all other potential dependencies
vi.mock('@/assets/sendDataToServer.ts', () => ({
  default: vi.fn().mockResolvedValue(true)
}))

describe('Medicine Calculator Component Tests', () => {
  test('component mounts without errors', async () => {
    const screen = render(MedicinBoern, {
      global: {
        plugins: [
          [PrimeVue, { 
            theme: 'none',
            unstyled: true
          }]
        ]
      }
    })
    
    // Just check that the component rendered
    expect(screen.container).toBeDefined()
  })

  test('displays main title', async () => {
    const screen = render(MedicinBoern, {
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
    await expect.element(screen.getByText('Medicin - dosering til børn')).toBeInTheDocument()
  })
})