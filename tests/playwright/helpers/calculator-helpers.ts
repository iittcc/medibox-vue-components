import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { PatientData, WestleyCroupInputs } from '../fixtures/test-data'
import { formOptions } from '../fixtures/test-data'

export class WestleyCroupCalculatorHelper {
  constructor(public page: Page) {}

  // Navigation and page setup
  async navigateToCalculator() {
    await this.page.goto('/westleyCroup.html')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageLoad() {
    // Wait for the Vue app to mount and render content
    await this.page.waitForSelector('.medical-calculator-container', { timeout: 30000 })
    // Wait for the title to be visible
    await expect(this.page.locator('text=Westley Croup Score')).toBeVisible()
    // Wait for form to be ready
    await this.page.waitForSelector('text=Bevidsthedsniveau', { timeout: 10000 })
  }

  // Patient information helpers
  async fillPatientInfo(patient: PatientData) {
    // Fill patient name using placeholder
    const nameInput = this.page.getByPlaceholder('Indtast navn')
    await nameInput.clear()
    await nameInput.fill(patient.name)

    // Set patient age using ID selector (NumberSliderInput component)
    const ageInput = this.page.locator('#personAge input')
    await ageInput.clear()
    await ageInput.fill(patient.age.toString())

    // Select gender using SelectButton component
    const genderSelector = patient.gender === 'male' ? 
      this.page.locator('text=Dreng') : 
      this.page.locator('text=Pige')
    await genderSelector.click()
  }

  // Medical form helpers
  async selectLevelOfConsciousness(value: number) {
    const option = Object.entries(formOptions.levelOfConsciousness)
      .find(([_, val]) => val === value)?.[0]
    
    if (!option) {
      throw new Error(`Invalid level of consciousness value: ${value}`)
    }

    // Find the section containing "Bevidsthedsniveau" and select the option within it
    const section = this.page.locator('text=Bevidsthedsniveau').locator('..').locator('..')
    await section.getByText(option, { exact: true }).click()
  }

  async selectCyanosis(value: number) {
    const option = Object.entries(formOptions.cyanosis)
      .find(([_, val]) => val === value)?.[0]
    
    if (!option) {
      throw new Error(`Invalid cyanosis value: ${value}`)
    }

    // Find the section containing "Cyanose" and select the option within it
    const section = this.page.locator('text=Cyanose').locator('..').locator('..')
    await section.getByText(option, { exact: true }).click()
  }

  async selectStridor(value: number) {
    const option = Object.entries(formOptions.stridor)
      .find(([_, val]) => val === value)?.[0]
    
    if (!option) {
      throw new Error(`Invalid stridor value: ${value}`)
    }

    // Find the section containing "Stridor" and select the option within it
    const section = this.page.locator('text=Stridor').locator('..').locator('..')
    await section.getByText(option, { exact: true }).click()
  }

  async selectAirEntry(value: number) {
    const option = Object.entries(formOptions.airEntry)
      .find(([_, val]) => val === value)?.[0]
    
    if (!option) {
      throw new Error(`Invalid air entry value: ${value}`)
    }

    // Find the section containing "Luftskifte" and select the option within it
    const section = this.page.locator('text=Luftskifte').locator('..').locator('..')
    await section.getByText(option, { exact: true }).click()
  }

  async selectRetractions(value: number) {
    const option = Object.entries(formOptions.retractions)
      .find(([_, val]) => val === value)?.[0]
    
    if (!option) {
      throw new Error(`Invalid retractions value: ${value}`)
    }

    // Find the section containing "Indtrækninger" and select the option within it
    const section = this.page.locator('text=Indtrækninger').locator('..').locator('..')
    await section.getByText(option, { exact: true }).click()
  }

  // Combined form filling
  async fillCalculatorForm(inputs: WestleyCroupInputs) {
    await this.selectLevelOfConsciousness(inputs.levelOfConsciousness)
    await this.selectCyanosis(inputs.cyanosis)
    await this.selectStridor(inputs.stridor)
    await this.selectAirEntry(inputs.airEntry)
    await this.selectRetractions(inputs.retractions)
  }

  // Results verification
  async getCalculatedScore(): Promise<number> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the score in the format "Westley Croup Score X : ..."
    const scoreElement = this.page.locator('text=/Westley Croup Score \\d+/')
    const scoreText = await scoreElement.textContent()
    
    if (!scoreText) {
      throw new Error('Could not find calculated score')
    }

    // Extract the number from "Westley Croup Score X : ..."
    const match = scoreText.match(/Westley Croup Score (\d+)/)
    if (!match) {
      throw new Error(`Could not parse score from: ${scoreText}`)
    }

    return parseInt(match[1], 10)
  }

  async getInterpretation(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the interpretation in the format "Westley Croup Score X : interpretation"
    const resultElement = this.page.locator('text=/Westley Croup Score \\d+ : /')
    const resultText = await resultElement.textContent()
    
    if (!resultText) {
      throw new Error('Could not find score interpretation')
    }

    // Extract the interpretation part after the colon
    const match = resultText.match(/Westley Croup Score \d+ : (.+)/)
    if (!match) {
      throw new Error(`Could not parse interpretation from: ${resultText}`)
    }

    return match[1].trim()
  }

  async getRiskLevel(): Promise<string> {
    // Risk level might be part of interpretation
    const interpretation = await this.getInterpretation()
    
    if (interpretation.includes('Let')) return 'low'
    if (interpretation.includes('Moderat')) return 'moderate'
    if (interpretation.includes('Alvorlig')) return 'high'
    
    return 'unknown'
  }

  // Form interaction helpers
  async submitCalculation() {
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // Wait for calculation to complete - wait for results section to appear
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 10000 })
  }

  async resetForm() {
    const resetButton = this.page.getByRole('button', { name: /nulstil|reset/i })
    await resetButton.click()
    
    // Wait for form to reset
    await this.page.waitForTimeout(500)
  }

  async copyToClipboard() {
    const copyButton = this.page.getByRole('button', { name: /kopier|copy/i })
    await copyButton.click()
    
    // Wait for copy confirmation
    await expect(this.page.locator('text=kopieret')).toBeVisible({ timeout: 5000 })
  }

  // Verification helpers
  async verifyFormSections() {
    // Verify all form sections are present
    await expect(this.page.locator('text=Bevidsthedsniveau')).toBeVisible()
    await expect(this.page.locator('text=Cyanose')).toBeVisible()
    await expect(this.page.locator('text=Stridor')).toBeVisible()
    await expect(this.page.locator('text=Luftskifte')).toBeVisible()
    await expect(this.page.locator('text=Indtrækninger')).toBeVisible()
  }

  async verifyScoreGuide() {
    // Verify the score interpretation guide is displayed
    await expect(this.page.locator('text=Score ≤ 2 : Let croup')).toBeVisible()
    await expect(this.page.locator('text=Score 3-5: Moderat croup')).toBeVisible()
    await expect(this.page.locator('text=Score ≥ 6: Alvorlig croup')).toBeVisible()
  }

  async verifyPatientSection() {
    await expect(this.page.locator('text=Patient')).toBeVisible()
    await expect(this.page.getByPlaceholder('Indtast navn')).toBeVisible()
    await expect(this.page.locator('#personAge')).toBeVisible()
  }

  // Form validation helpers
  async verifyRequiredFieldsValidation() {
    await this.submitCalculation()
    
    // Check for validation messages
    const validationMessage = this.page.locator('.text-red-500')
    await expect(validationMessage).toBeVisible()
  }

  async verifyAgeValidation(age: number) {
    const ageInput = this.page.locator('#personAge input')
    await ageInput.clear()
    await ageInput.fill(age.toString())
    
    // Trigger validation by clicking elsewhere or trying to submit
    await this.page.click('body')
    
    if (age < 0 || age > 18) {
      // Should show validation error
      const validationMessage = this.page.locator('.text-red-500')
      await expect(validationMessage).toBeVisible()
    }
  }

  // Accessibility helpers
  async checkKeyboardNavigation() {
    // Start from the top and tab through form elements
    await this.page.keyboard.press('Tab')
    
    // Verify focus moves through form elements
    const nameInput = this.page.getByPlaceholder('Indtast navn')
    await expect(nameInput).toBeFocused()
    
    await this.page.keyboard.press('Tab')
    // Age input might be complex due to NumberSliderInput component
    // Just verify that focus moved to some input element
    const focusedElement = this.page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  }

  async checkAriaLabels() {
    // Verify important elements have proper identifiers
    await expect(this.page.getByPlaceholder('Indtast navn')).toBeVisible()
    await expect(this.page.locator('#personAge')).toBeVisible()
    
    // Check radio button groups have proper labels
    await expect(this.page.locator('text=Bevidsthedsniveau')).toBeVisible()
    await expect(this.page.locator('text=Cyanose')).toBeVisible()
  }

  // Mobile helpers
  async setMobileViewport(width: number = 375, height: number = 667) {
    await this.page.setViewportSize({ width, height })
    await this.page.waitForTimeout(500) // Allow for responsive adjustments
  }

  async verifyMobileLayout() {
    // Verify mobile-specific layout elements
    await expect(this.page.locator('.medical-calculator-container')).toBeVisible()
    
    // Check that form elements are still accessible on mobile
    await this.verifyFormSections()
    await this.verifyPatientSection()
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.navigateToCalculator()
    await this.waitForPageLoad()
    return Date.now() - startTime
  }

  async measureCalculationTime(): Promise<number> {
    const startTime = Date.now()
    await this.submitCalculation()
    return Date.now() - startTime
  }
}

// Utility functions
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  })
}

export async function logConsoleErrors(page: Page) {
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text())
    }
  })
  
  page.on('pageerror', (error: any) => {
    console.error('Page error:', error.message)
  })
}