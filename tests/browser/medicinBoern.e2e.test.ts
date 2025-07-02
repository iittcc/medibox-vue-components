import { describe, expect, test } from 'vitest'
import { page } from '@vitest/browser/context'

describe('Medicine Calculator End-to-End Tests', () => {
  test('full user journey with real interactions', async () => {
    // Navigate to the calculator page
    await page.goto('/medicinBoern.html')
    
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Verify page title and main elements
    await expect.element(page.getByText('Medicin - dosering til børn')).toBeInTheDocument()
    
    // Step 1: Select Amoxicillin from dropdown
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('Amoxicillin').click()
    
    // Step 2: Wait for dispensing options to appear and select tablets
    await expect.element(page.getByTestId('dispensing-select')).toBeVisible()
    const dispensingSelect = page.getByTestId('dispensing-select')
    await dispensingSelect.click()
    await page.getByText('Tabletter').click()
    
    // Step 3: Wait for preparation options and select 500mg tablets
    await expect.element(page.getByTestId('preparation-select')).toBeVisible()
    const preparationSelect = page.getByTestId('preparation-select')
    await preparationSelect.click()
    await page.getByText(/500 mg/).first().click()
    
    // Step 4: Use weight slider to set 20kg
    const weightSlider = page.getByTestId('weight-slider')
    await weightSlider.fill('20')
    
    // Step 5: Use dosage slider to set 50 mg/kg/day
    const dosageSlider = page.getByTestId('dosage-slider')
    await dosageSlider.fill('50')
    
    // Step 6: Verify calculations appear and are correct
    await expect.element(page.getByTestId('calculation-results')).toBeVisible()
    
    // Expected calculation: (50 * 20) / 500 = 2 tablets per day
    await expect.element(page.getByTestId('daily-amount')).toHaveTextContent('2')
    
    // Step 7: Test copy functionality
    const copyButton = page.getByTestId('copy-button')
    await copyButton.click()
    
    // Verify success message appears
    await expect.element(page.getByText(/kopieret/i)).toBeVisible()
    
    // Step 8: Test reset functionality
    const resetButton = page.getByTestId('reset-button')
    await resetButton.click()
    
    // Verify form is reset
    await expect.element(medicineSelect).toHaveValue('')
    await expect.element(weightSlider).toHaveValue('15')
  })

  test('dosage suggestion interaction', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Select Penicillin to get dosage suggestions
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('V-penicillin').click()
    
    // Wait for and verify dosage suggestions appear
    await expect.element(page.getByTestId('dosage-suggestions')).toBeVisible()
    
    // Click on the first suggestion (80000 IE/kg/døgn)
    const firstSuggestion = page.getByTestId('suggestion-0')
    await firstSuggestion.click()
    
    // Verify the dosage slider updated to the suggested value
    const dosageSlider = page.getByTestId('dosage-slider')
    await expect.element(dosageSlider).toHaveValue('80000')
    
    // Verify days field updated if the suggestion included days
    const daysInput = page.getByTestId('days-input')
    await expect.element(daysInput).toHaveValue('7')
  })

  test('warning message for weight restrictions', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Select Ibuprofen (has minimum weight restriction)
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('Ibuprofen').click()
    
    // Select tablets
    const dispensingSelect = page.getByTestId('dispensing-select')
    await dispensingSelect.click()
    await page.getByText('Tabletter').click()
    
    // Select first preparation
    const preparationSelect = page.getByTestId('preparation-select')
    await preparationSelect.click()
    await page.getByText(/200 mg/).first().click()
    
    // Set weight below minimum (less than 7kg)
    const weightSlider = page.getByTestId('weight-slider')
    await weightSlider.fill('5')
    
    // Set dosage
    const dosageSlider = page.getByTestId('dosage-slider')
    await dosageSlider.fill('15')
    
    // Verify warning message appears
    await expect.element(page.getByTestId('warning-message')).toBeVisible()
    await expect.element(page.getByText(/6 måneder/i)).toBeInTheDocument()
    await expect.element(page.getByText(/7 kg/i)).toBeInTheDocument()
  })

  test('mobile responsiveness', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Verify main elements are visible on mobile
    await expect.element(page.getByText('Medicin - dosering til børn')).toBeVisible()
    
    // Test touch interactions
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('Amoxicillin').click()
    
    // Verify responsive layout works
    await expect.element(page.getByTestId('dispensing-select')).toBeVisible()
    
    // Test slider interaction on mobile
    const weightSlider = page.getByTestId('weight-slider')
    await weightSlider.fill('25')
    
    // Verify the slider value updated
    await expect.element(page.getByTestId('weight-display')).toHaveTextContent('25')
  })

  test('all medicine types workflow', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    const medicines = [
      'Amoxicillin',
      'Amoxicillin/Clavulansyre',
      'Azithromycin',
      'Clarithromycin',
      'Dicloxacillin',
      'Erythromycin',
      'Pivmecillinam',
      'V-penicillin',
      'Trimethoprim',
      'Naproxen',
      'Ibuprofen',
      'Paracetamol'
    ]

    for (const medicine of medicines) {
      // Select medicine
      const medicineSelect = page.getByTestId('medicine-select')
      await medicineSelect.click()
      await page.getByText(medicine).click()
      
      // Verify dispensing options appear
      await expect.element(page.getByTestId('dispensing-select')).toBeVisible()
      
      // Select first available dispensing option
      const dispensingSelect = page.getByTestId('dispensing-select')
      await dispensingSelect.click()
      
      // Find and click first non-empty option
      const dispensingOptions = await page.locator('option[value!=""]').all()
      if (dispensingOptions.length > 0) {
        await dispensingOptions[0].click()
        
        // Verify preparation options appear
        await expect.element(page.getByTestId('preparation-select')).toBeVisible()
      }
      
      // Reset for next medicine
      const resetButton = page.getByTestId('reset-button')
      await resetButton.click()
      
      // Wait for reset to complete
      await expect.element(medicineSelect).toHaveValue('')
    }
  })

  test('keyboard navigation accessibility', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Test tab navigation through form elements
    await page.keyboard.press('Tab')
    let focusedElement = await page.locator(':focus').first()
    await expect.element(focusedElement).toBeVisible()
    
    // Continue tabbing through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Test Enter key to activate buttons
    const resetButton = page.getByTestId('reset-button')
    await resetButton.focus()
    await page.keyboard.press('Enter')
    
    // Verify reset action occurred
    const weightSlider = page.getByTestId('weight-slider')
    await expect.element(weightSlider).toHaveValue('15')
  })

  test('data persistence during session', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Fill out form
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('Paracetamol').click()
    
    const dispensingSelect = page.getByTestId('dispensing-select')
    await dispensingSelect.click()
    await page.getByText('Tabletter').click()
    
    const weightSlider = page.getByTestId('weight-slider')
    await weightSlider.fill('30')
    
    // Scroll down and back up to test if values persist
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.evaluate(() => window.scrollTo(0, 0))
    
    // Verify values are still there
    await expect.element(medicineSelect).toHaveValue('paracetamol')
    await expect.element(weightSlider).toHaveValue('30')
  })

  test('error handling for edge cases', async () => {
    await page.goto('/medicinBoern.html')
    await page.waitForSelector('[data-testid="surface-card"]')
    
    // Test with extreme values
    const weightSlider = page.getByTestId('weight-slider')
    await weightSlider.fill('1')
    
    const dosageSlider = page.getByTestId('dosage-slider')
    await dosageSlider.fill('1')
    
    // Select a medicine to trigger calculations
    const medicineSelect = page.getByTestId('medicine-select')
    await medicineSelect.click()
    await page.getByText('Paracetamol').click()
    
    const dispensingSelect = page.getByTestId('dispensing-select')
    await dispensingSelect.click()
    await page.getByText('Tabletter').click()
    
    const preparationSelect = page.getByTestId('preparation-select')
    await preparationSelect.click()
    await page.getByText(/250 mg/).first().click()
    
    // Verify the calculator handles extreme values gracefully
    await expect.element(page.getByTestId('calculation-results')).toBeVisible()
    
    // Test with maximum values
    await weightSlider.fill('100')
    await dosageSlider.fill('1000')
    
    // Verify calculations still work
    await expect.element(page.getByTestId('daily-amount')).toBeVisible()
  })
})