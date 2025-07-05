/// <reference types="@vitest/browser/context" />

import { describe, expect, test, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from 'vitest-browser-vue'
import PrimeVue from 'primevue/config'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

describe('Medicine Calculator Basic Tests', () => {
  beforeEach(async () => {
    // Set viewport for consistent testing
    await page.viewport(1280, 720)
  })

  test('component renders and displays main elements', async () => {
    // Render the component with PrimeVue configuration
    const screen = render(MedicinBoernScore, {
      global: {
        plugins: [
          [PrimeVue, { 
            theme: 'none',
            unstyled: true
          }]
        ]
      }
    })
    
    // Test that the basic component elements are present
    await expect.element(screen.getByText('Medicin - dosering til børn')).toBeInTheDocument()
    
    // Check that the main form sections are visible
    await expect.element(screen.getByText('Medicin')).toBeInTheDocument()
    await expect.element(screen.getByText('Dosering')).toBeInTheDocument()
    await expect.element(screen.getByText('Vægt')).toBeInTheDocument()
  })

  test('form elements are interactive', async () => {
    // Render the component with PrimeVue configuration
    const screen = render(MedicinBoernScore, {
      global: {
        plugins: [
          [PrimeVue, { 
            theme: 'none',
            unstyled: true
          }]
        ]
      }
    })
    
    // Test that select elements are present by placeholder text
    const medicineSelect = screen.getByText(/Vælg indholdsstof/i)
    await expect.element(medicineSelect).toBeInTheDocument()
    
    // Test reset button is present
    await expect.element(screen.getByRole('button', { name: /nulstil/i })).toBeInTheDocument()
  })
})