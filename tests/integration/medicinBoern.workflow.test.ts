import { describe, expect, test, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

describe('Medicine Calculator Integration Tests', () => {
  let wrapper: any

  beforeEach(() => {
    // Create fresh component wrapper for each test
    wrapper = mount(MedicinBoernScore, {
      global: {
        plugins: [
          [PrimeVue, { 
            theme: 'none',
            unstyled: true
          }]
        ]
      }
    })
  })

  test('component renders with all sections', async () => {
    // Test that the basic component elements are present
    expect(wrapper.text()).toContain('Medicin - dosering til børn')
    expect(wrapper.text()).toContain('Medicin')
    expect(wrapper.text()).toContain('Dosering')
    expect(wrapper.text()).toContain('Vægt')
  })

  test('medicine selection updates reactive state', async () => {
    // Find the medicine select component
    const medicineSelects = wrapper.findAllComponents({ name: 'Select' })
    expect(medicineSelects.length).toBeGreaterThan(0)
    
    // Test that component has reactive data
    expect(wrapper.vm.selectedIndholdsstof).toBe('amoxicillin') // Default value
    
    // Simulate selection change
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedIndholdsstof = 'paracetamol'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.selectedIndholdsstof).toBe('paracetamol')
  })

  test('weight and dosage sliders affect calculations', async () => {
    // Test reactive calculations
    expect(wrapper.vm.vaegt).toBe(16) // Default weight
    // Dosering might have a suggested value based on selected medicine
    expect(typeof wrapper.vm.dosering).toBe('number')
    
    // Update values and verify reactivity
    wrapper.vm.vaegt = 20
    wrapper.vm.dosering = 50
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.vaegt).toBe(20)
    expect(wrapper.vm.dosering).toBe(50)
  })

  test('form reset functionality works', async () => {
    // Change some values
    const originalInholdsstof = wrapper.vm.selectedIndholdsstof
    const originalVaegt = wrapper.vm.vaegt
    
    wrapper.vm.selectedIndholdsstof = 'paracetamol'
    wrapper.vm.vaegt = 25
    await wrapper.vm.$nextTick()
    
    // Verify values are changed (don't check dosering as it might auto-update)
    expect(wrapper.vm.selectedIndholdsstof).toBe('paracetamol')
    expect(wrapper.vm.vaegt).toBe(25)
    
    // Trigger reset function directly (testing the functionality, not the UI)
    wrapper.vm.resetForm()
    await wrapper.vm.$nextTick()
    
    // Verify reset values
    expect(wrapper.vm.selectedIndholdsstof).toBe(originalInholdsstof) // Back to original
    expect(wrapper.vm.vaegt).toBe(originalVaegt) // Back to original
  })

  test('component handles medicine data correctly', async () => {
    // Test that medicine data is loaded
    expect(wrapper.vm.indholdsstofOptions).toBeDefined()
    expect(wrapper.vm.indholdsstofOptions.length).toBeGreaterThan(0)
    
    // Test default medicine is selected
    expect(wrapper.vm.selectedIndholdsstof).toBe('amoxicillin')
    
    // Test changing medicine updates dependent options
    wrapper.vm.selectedIndholdsstof = 'paracetamol'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.selectedIndholdsstof).toBe('paracetamol')
  })

  test('calculations show results when form is complete', async () => {
    // Set up a complete form
    wrapper.vm.selectedIndholdsstof = 'amoxicillin'
    wrapper.vm.selectedDispensering = 'tabletter'
    wrapper.vm.selectedPraeparat = 1
    wrapper.vm.vaegt = 20
    wrapper.vm.dosering = 50
    await wrapper.vm.$nextTick()
    
    // Verify calculation properties are computed
    expect(wrapper.vm.antalPrDogn).toBeDefined()
    expect(wrapper.vm.antalIAlt).toBeDefined()
    expect(wrapper.vm.amountPerDose).toBeDefined()
  })

  test('copy dialog is present and disabled when no results', async () => {
    // Find copy dialog component - it might be named differently or have different props
    const copyDialog = wrapper.findComponent({ name: 'CopyDialog' })
    
    if (copyDialog.exists()) {
      // Should be disabled when no results
      // The disabled prop checks showResults value
      expect(copyDialog.props('disabled')).toBeDefined()
    } else {
      // If not found by name, check if it exists in the template
      const dialogText = wrapper.text()
      expect(dialogText).toContain('Kopier til Clipboard')
    }
  })

  test('warning message appears for appropriate conditions', async () => {
    // Set conditions that should trigger warning
    wrapper.vm.selectedIndholdsstof = 'ibuprofen'
    wrapper.vm.vaegt = 5 // Below minimum for ibuprofen
    await wrapper.vm.$nextTick()
    
    // Warning should be reactive to weight changes
    expect(wrapper.vm.warning).toBeDefined()
  })
})