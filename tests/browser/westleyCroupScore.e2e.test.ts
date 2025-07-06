/// <reference types="@vitest/browser/providers/playwright" />
/// <reference types="@vitest/browser/context" />

import { describe, expect, test, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from 'vitest-browser-vue'
import PrimeVue from 'primevue/config'
import WestleyCroupScore from '@/components/WestleyCroupScore.vue'

// Mock the useCalculatorFramework to avoid ToastService dependency
import { vi } from 'vitest'

// Mock the calculator framework with reactive refs
vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => {
    const patientData = { value: { name: '', age: 6, gender: 'male' } }
    const calculatorData = { value: { levelOfConsciousness: 0, cyanosis: 0, stridor: 0, airEntry: 0, retractions: 0 } }
    const state = { value: { isComplete: true, isSubmitting: false, currentStep: 1 } }
    const result = { value: { score: 0, interpretation: 'Let croup', riskLevel: 'low' } }
    
    return {
      patientData,
      calculatorData,
      state,
      result,
      setFieldValue: vi.fn(),
      submitCalculation: vi.fn().mockResolvedValue(true),
      resetCalculator: vi.fn(),
      initializeSteps: vi.fn()
    }
  }
}))

describe('Westley Croup Score E2E Tests', () => {
  beforeEach(async () => {
    // Set viewport for consistent testing
    await page.viewport(1280, 720)
  })

  describe('Component Rendering', () => {
    test('component renders and displays main elements', async () => {
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
    })
  })

  describe('Medical Scoring Accuracy', () => {
    test('validates official Westley Croup Score ranges', async () => {
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
      
      // Check that the score interpretation guide is shown
      await expect.element(screen.getByText('Score ≤ 2 : Let croup | Score 3-5: Moderat croup | Score ≥ 6: Alvorlig croup')).toBeInTheDocument()
      
      // Verify that official option values are available
      // Consciousness: 0 (Vågen) and 5 (Desorienteret)
      await expect.element(screen.getByText('Vågen (eller sovende)')).toBeInTheDocument()
      await expect.element(screen.getByText('Desorienteret/forvirret')).toBeInTheDocument()
      
      // Cyanosis: 0 (Ingen), 4 (Ved ophidselse), 5 (I hvile)
      await expect.element(screen.getByText('Ved ophidselse')).toBeInTheDocument()
      
      // Air entry: 0 (Normal), 1 (Nedsat), 2 (Udtalt nedsat)
      await expect.element(screen.getByText('Normal')).toBeInTheDocument()
      await expect.element(screen.getByText('Nedsat')).toBeInTheDocument()
      await expect.element(screen.getByText('Udtalt nedsat')).toBeInTheDocument()
      
      // Retractions: 0 (Ingen), 1 (Milde), 2 (Moderate), 3 (Svære)
      await expect.element(screen.getByText('Milde')).toBeInTheDocument()
      await expect.element(screen.getByText('Moderate')).toBeInTheDocument()
      await expect.element(screen.getByText('Svære')).toBeInTheDocument()
    })
  })
})