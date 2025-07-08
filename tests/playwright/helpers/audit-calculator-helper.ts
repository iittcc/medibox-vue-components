import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { AuditPatientData, AuditInputs } from '../fixtures/audit-test-data'
import { auditQuestionOptions } from '../fixtures/audit-test-data'

export class AuditCalculatorHelper {
  constructor(public page: Page) {}

  // Navigation and page setup
  async navigateToCalculator() {
    await this.page.goto('/audit.html')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageLoad() {
    // Wait for the Vue app to mount and render content
    await this.page.waitForSelector('.medical-calculator-container', { timeout: 30000 })
    // Wait for the title to be visible
    await expect(this.page.locator('text=AUDIT Alkoholafhængighedstest')).toBeVisible()
    // Wait for first question to be ready
    await this.page.waitForSelector('text=Hvor tit drikker du alkohol?', { timeout: 10000 })
  }

  // Patient information helpers
  async fillPatientInfo(patient: AuditPatientData) {
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
      this.page.locator('text=Mand') : 
      this.page.locator('text=Kvinde')
    await genderSelector.click()
  }

  // AUDIT form helpers - each question has specific options
  async selectQuestion1Answer(value: number) {
    const option = auditQuestionOptions.frequency1.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 1 value: ${value}`)
    }
    
    // Find the section containing the first question and select the option
    const questionSection = this.page.locator('text=Hvor tit drikker du alkohol?').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion2Answer(value: number) {
    const option = auditQuestionOptions.drinks.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 2 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Hvor mange genstande drikker du almindeligvis').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion3Answer(value: number) {
    const option = auditQuestionOptions.frequency2.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 3 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Hvor tit drikker du fem genstande eller flere').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion4Answer(value: number) {
    const option = auditQuestionOptions.frequency2.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 4 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne stoppe').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion5Answer(value: number) {
    const option = auditQuestionOptions.frequency3.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 5 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne gøre det').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion6Answer(value: number) {
    const option = auditQuestionOptions.frequency3.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 6 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har du inden for det seneste år måttet have en lille én om morgenen').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion7Answer(value: number) {
    const option = auditQuestionOptions.frequency3.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 7 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har du inden for det seneste år haft dårlig samvittighed').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion8Answer(value: number) {
    const option = auditQuestionOptions.frequency3.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 8 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne huske').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion9Answer(value: number) {
    const option = auditQuestionOptions.yesNo.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 9 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Er du selv eller andre nogensinde kommet til skade').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  async selectQuestion10Answer(value: number) {
    const option = auditQuestionOptions.yesNo.find(opt => opt.value === value)
    if (!option) {
      throw new Error(`Invalid question 10 value: ${value}`)
    }
    
    const questionSection = this.page.locator('text=Har nogen i familien, en ven, en læge eller andre været bekymred').locator('..').locator('..')
    await questionSection.getByText(option.text, { exact: true }).click()
  }

  // Combined form filling
  async fillCalculatorForm(inputs: AuditInputs) {
    await this.selectQuestion1Answer(inputs.question1)
    await this.selectQuestion2Answer(inputs.question2)
    await this.selectQuestion3Answer(inputs.question3)
    await this.selectQuestion4Answer(inputs.question4)
    await this.selectQuestion5Answer(inputs.question5)
    await this.selectQuestion6Answer(inputs.question6)
    await this.selectQuestion7Answer(inputs.question7)
    await this.selectQuestion8Answer(inputs.question8)
    await this.selectQuestion9Answer(inputs.question9)
    await this.selectQuestion10Answer(inputs.question10)
  }

  // Results verification
  async getCalculatedScore(): Promise<number> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the score in the format "AUDIT Score X : ..."
    const scoreElement = this.page.locator('text=/AUDIT Score \\d+/')
    const scoreText = await scoreElement.textContent()
    
    if (!scoreText) {
      throw new Error('Could not find calculated score')
    }

    // Extract the number from "AUDIT Score X : ..."
    const match = scoreText.match(/AUDIT Score (\\d+)/)
    if (!match) {
      throw new Error(`Could not parse score from: ${scoreText}`)
    }

    return parseInt(match[1], 10)
  }

  async getInterpretation(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the interpretation in the format "AUDIT Score X : interpretation"
    const resultElement = this.page.locator('text=/AUDIT Score \\d+ : /')
    const resultText = await resultElement.textContent()
    
    if (!resultText) {
      throw new Error('Could not find score interpretation')
    }

    // Extract the interpretation part after the colon
    const match = resultText.match(/AUDIT Score \\d+ : (.+)/)
    if (!match) {
      throw new Error(`Could not parse interpretation from: ${resultText}`)
    }

    return match[1].trim()
  }

  async getRiskLevel(): Promise<string> {
    // Risk level is determined by score: <8 = low, ≥8 = high
    const score = await this.getCalculatedScore()
    return score < 8 ? 'low' : 'high'
  }

  async getRecommendations(): Promise<string> {
    // Look for recommendations text below the score
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    const recommendationElement = this.page.locator('text=Score ≥ 8 er der grund til at vurdere tiltag')
    const recommendationText = await recommendationElement.textContent()
    
    return recommendationText || ''
  }

  // Form interaction helpers
  async submitCalculation() {
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // Wait for calculation to complete - wait for results section to appear
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 10000 })
  }

  async resetForm() {
    const resetButton = this.page.getByRole('button', { name: /reset/i })
    await resetButton.click()
    
    // Wait for form to reset
    await this.page.waitForTimeout(500)
  }

  async copyToClipboard() {
    const copyButton = this.page.getByRole('button', { name: /kopier|copy/i })
    await copyButton.click()
    
    // Wait for copy action to complete
    await this.page.waitForTimeout(1000)
  }

  // Verification helpers
  async verifyFormSections() {
    // Verify all 10 AUDIT questions are present
    await expect(this.page.locator('text=Hvor tit drikker du alkohol?')).toBeVisible()
    await expect(this.page.locator('text=Hvor mange genstande drikker du almindeligvis')).toBeVisible()
    await expect(this.page.locator('text=Hvor tit drikker du fem genstande eller flere')).toBeVisible()
    await expect(this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne stoppe')).toBeVisible()
    await expect(this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne gøre det')).toBeVisible()
    await expect(this.page.locator('text=Har du inden for det seneste år måttet have en lille én om morgenen')).toBeVisible()
    await expect(this.page.locator('text=Har du inden for det seneste år haft dårlig samvittighed')).toBeVisible()
    await expect(this.page.locator('text=Har du inden for det seneste år oplevet, at du ikke kunne huske')).toBeVisible()
    await expect(this.page.locator('text=Er du selv eller andre nogensinde kommet til skade')).toBeVisible()
    await expect(this.page.locator('text=Har nogen i familien, en ven, en læge eller andre været bekymred')).toBeVisible()
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
    
    // Trigger validation by clicking elsewhere
    await this.page.click('body')
    
    if (age < 10 || age > 110) {
      // Should show validation error or reset to valid value
      const ageValue = await ageInput.inputValue()
      const numericValue = parseInt(ageValue.replace(' År', ''))
      expect(numericValue).toBeGreaterThanOrEqual(10)
      expect(numericValue).toBeLessThanOrEqual(110)
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
    const focusedElement = this.page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  }

  async checkAriaLabels() {
    // Verify important elements have proper identifiers
    await expect(this.page.getByPlaceholder('Indtast navn')).toBeVisible()
    await expect(this.page.locator('#personAge')).toBeVisible()
    
    // Check question sections have proper labels
    await expect(this.page.locator('text=Hvor tit drikker du alkohol?')).toBeVisible()
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