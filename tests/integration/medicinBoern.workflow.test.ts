import { describe, expect, test, beforeEach } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page } from '@vitest/browser/context'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

describe('Medicine Calculator Integration Tests', () => {
  beforeEach(async () => {
    // Clear any previous state
    await page.reload()
  })

  test('complete workflow: select medicine, calculate dosage, copy results', async () => {
    const screen = render(MedicinBoernScore)

    // Step 1: Select medicine (Amoxicillin)
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('amoxicillin')
    
    // Verify dispensing options appeared
    await expect.element(screen.getByTestId('dispensing-select')).toBeInTheDocument()
    
    // Step 2: Select dispensing form (Tablets)
    const dispensingSelect = screen.getByTestId('dispensing-select')
    await dispensingSelect.selectOption('tabletter')
    
    // Verify preparation options appeared
    await expect.element(screen.getByTestId('preparation-select')).toBeInTheDocument()
    
    // Step 3: Select preparation (500mg tablets)
    const preparationSelect = screen.getByTestId('preparation-select')
    await preparationSelect.selectOption('amoxicillin_tabletter_1')
    
    // Step 4: Set weight using slider
    const weightSlider = screen.getByTestId('weight-slider')
    await weightSlider.fill('20')
    
    // Step 5: Set dosage using slider
    const dosageSlider = screen.getByTestId('dosage-slider')
    await dosageSlider.fill('50')
    
    // Step 6: Verify calculations appear
    await expect.element(screen.getByTestId('daily-amount')).toBeVisible()
    await expect.element(screen.getByTestId('amount-per-dose')).toBeVisible()
    await expect.element(screen.getByTestId('total-amount')).toBeVisible()
    
    // Step 7: Verify calculation values are correct
    const dailyAmountElement = screen.getByTestId('daily-amount')
    await expect.element(dailyAmountElement).toHaveTextContent('2') // (50 * 20) / 500 = 2
    
    // Step 8: Test copy functionality
    const copyButton = screen.getByTestId('copy-button')
    await copyButton.click()
    
    // Verify copy success message appears
    await expect.element(screen.getByText(/kopieret/i)).toBeInTheDocument()
  })

  test('dosage suggestions workflow', async () => {
    const screen = render(MedicinBoernScore)

    // Select Penicillin
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('penicillin')
    
    // Verify dosage suggestions appear
    await expect.element(screen.getByTestId('dosage-suggestions')).toBeVisible()
    
    // Click on first suggestion
    const firstSuggestion = screen.getByTestId('suggestion-0')
    await firstSuggestion.click()
    
    // Verify dosage slider updated
    const dosageSlider = screen.getByTestId('dosage-slider')
    await expect.element(dosageSlider).toHaveValue('80000')
    
    // Verify days field updated if suggestion included days
    const daysInput = screen.getByTestId('days-input')
    await expect.element(daysInput).toHaveValue('7')
  })

  test('warning messages for weight restrictions', async () => {
    const screen = render(MedicinBoernScore)

    // Select Ibuprofen (has weight restriction)
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('ibuprofen')
    
    const dispensingSelect = screen.getByTestId('dispensing-select')
    await dispensingSelect.selectOption('tabletter')
    
    const preparationSelect = screen.getByTestId('preparation-select')
    await preparationSelect.selectOption('ibuprofen_tabletter_0')
    
    // Set weight below minimum (7kg)
    const weightSlider = screen.getByTestId('weight-slider')
    await weightSlider.fill('5')
    
    // Set some dosage
    const dosageSlider = screen.getByTestId('dosage-slider')
    await dosageSlider.fill('15')
    
    // Verify warning message appears
    await expect.element(screen.getByTestId('warning-message')).toBeVisible()
    await expect.element(screen.getByText(/6 måneder.*7 kg/i)).toBeInTheDocument()
  })

  test('form reset functionality', async () => {
    const screen = render(MedicinBoernScore)

    // Fill out the form
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('amoxicillin')
    
    const dispensingSelect = screen.getByTestId('dispensing-select')
    await dispensingSelect.selectOption('tabletter')
    
    const weightSlider = screen.getByTestId('weight-slider')
    await weightSlider.fill('25')
    
    const dosageSlider = screen.getByTestId('dosage-slider')
    await dosageSlider.fill('75')
    
    // Click reset button
    const resetButton = screen.getByTestId('reset-button')
    await resetButton.click()
    
    // Verify form is reset
    await expect.element(medicineSelect).toHaveValue('')
    await expect.element(dispensingSelect).toHaveValue('')
    await expect.element(weightSlider).toHaveValue('15')
    await expect.element(dosageSlider).toHaveValue('50')
  })

  test('responsive design on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const screen = render(MedicinBoernScore)

    // Verify component is still usable on mobile
    const medicineSelect = screen.getByTestId('medicine-select')
    await expect.element(medicineSelect).toBeVisible()
    
    const weightSlider = screen.getByTestId('weight-slider')
    await expect.element(weightSlider).toBeVisible()
    
    // Test touch interactions work
    await medicineSelect.selectOption('paracetamol')
    await expect.element(screen.getByTestId('dispensing-select')).toBeVisible()
  })

  test('handles all medicine types correctly', async () => {
    const medicines = [
      'amoxicillin',
      'amoxicillinclavulansyre', 
      'azithromycin',
      'clarithromycin',
      'dicloxacillin',
      'erythromycin',
      'pivmecillinam',
      'penicillin',
      'trimethoprim',
      'naproxen',
      'ibuprofen',
      'paracetamol'
    ]

    for (const medicine of medicines) {
      const screen = render(MedicinBoernScore)
      
      // Select medicine
      const medicineSelect = screen.getByTestId('medicine-select')
      await medicineSelect.selectOption(medicine)
      
      // Verify dispensing options appear
      await expect.element(screen.getByTestId('dispensing-select')).toBeVisible()
      
      // Select first available dispensing option
      const dispensingSelect = screen.getByTestId('dispensing-select')
      const dispensingOptions = await dispensingSelect.query('option[value!=""]')
      if (dispensingOptions.length > 0) {
        await dispensingSelect.selectOption(dispensingOptions[0].getAttribute('value'))
        
        // Verify preparation options appear
        await expect.element(screen.getByTestId('preparation-select')).toBeVisible()
      }
      
      // Reset for next medicine
      const resetButton = screen.getByTestId('reset-button')
      await resetButton.click()
    }
  })

  test('dosage calculations update in real-time', async () => {
    const screen = render(MedicinBoernScore)

    // Set up complete form
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('amoxicillin')
    
    const dispensingSelect = screen.getByTestId('dispensing-select')
    await dispensingSelect.selectOption('tabletter')
    
    const preparationSelect = screen.getByTestId('preparation-select')
    await preparationSelect.selectOption('amoxicillin_tabletter_1')
    
    const weightSlider = screen.getByTestId('weight-slider')
    await weightSlider.fill('20')
    
    const dosageSlider = screen.getByTestId('dosage-slider')
    await dosageSlider.fill('50')
    
    // Get initial calculation result
    const dailyAmountElement = screen.getByTestId('daily-amount')
    const initialValue = await dailyAmountElement.textContent()
    
    // Change weight
    await weightSlider.fill('30')
    
    // Verify calculation updated
    const newValue = await dailyAmountElement.textContent()
    expect(newValue).not.toBe(initialValue)
    
    // Change dosage
    await dosageSlider.fill('75')
    
    // Verify calculation updated again
    const finalValue = await dailyAmountElement.textContent()
    expect(finalValue).not.toBe(newValue)
  })

  test('validates edge cases and boundary values', async () => {
    const screen = render(MedicinBoernScore)

    // Test minimum weight
    const weightSlider = screen.getByTestId('weight-slider')
    await weightSlider.fill('1')
    
    // Test maximum weight
    await weightSlider.fill('100')
    
    // Test minimum dosage
    const dosageSlider = screen.getByTestId('dosage-slider')
    await dosageSlider.fill('1')
    
    // Test calculations still work at extremes
    const medicineSelect = screen.getByTestId('medicine-select')
    await medicineSelect.selectOption('paracetamol')
    
    const dispensingSelect = screen.getByTestId('dispensing-select')
    await dispensingSelect.selectOption('tabletter')
    
    const preparationSelect = screen.getByTestId('preparation-select')
    await preparationSelect.selectOption('paracetamol_tabletter_0')
    
    // Verify calculations appear even with extreme values
    await expect.element(screen.getByTestId('daily-amount')).toBeVisible()
    await expect.element(screen.getByTestId('total-amount')).toBeVisible()
  })
})