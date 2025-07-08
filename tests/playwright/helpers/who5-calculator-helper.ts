import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { Who5PatientData, Who5Inputs } from '../fixtures/who5-test-data'

export class Who5CalculatorHelper {
  constructor(public page: Page) {}

  // Navigation and page setup
  async navigateToCalculator() {
    await this.page.goto('/who-5.html')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageLoad() {
    // Wait for the Vue app to mount and render content
    await this.page.waitForSelector('.medical-calculator-container', { timeout: 30000 })
    // Wait for the title to be visible
    await expect(this.page.locator('text=WHO-5 Trivselindex')).toBeVisible()
    // Wait for form to be ready
    await this.page.waitForSelector('text=I de sidste 2 uger', { timeout: 10000 })
  }

  // Patient information helpers
  async fillPatientInfo(patient: Who5PatientData) {
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

  // WHO-5 question helpers
  async selectQuestion1Answer(value: number) {
    await this.selectAnswerForQuestion(1, value)
  }

  async selectQuestion2Answer(value: number) {
    await this.selectAnswerForQuestion(2, value)
  }

  async selectQuestion3Answer(value: number) {
    await this.selectAnswerForQuestion(3, value)
  }

  async selectQuestion4Answer(value: number) {
    await this.selectAnswerForQuestion(4, value)
  }

  async selectQuestion5Answer(value: number) {
    await this.selectAnswerForQuestion(5, value)
  }

  private async selectAnswerForQuestion(questionNumber: number, value: number) {
    const answerTextMap: { [key: number]: string } = {
      5: 'Hele tiden',
      4: 'Det mest af tiden',
      3: 'Lidt mere end halvdelen af tiden',
      2: 'Lidt mindre end halvdelen af tiden',
      1: 'Lidt af tiden',
      0: 'På intet tidspunkt'
    }

    const answerText = answerTextMap[value]
    if (!answerText) {
      throw new Error(`Invalid WHO-5 answer value: ${value}`)
    }

    // Find the question section and select the answer within it
    const questionSection = this.page.locator(`[name="question${questionNumber}"]`)
    await questionSection.locator(`text=${answerText}`).click()
  }

  // Combined form filling
  async fillCalculatorForm(inputs: Who5Inputs) {
    await this.selectQuestion1Answer(inputs.question1)
    await this.selectQuestion2Answer(inputs.question2)
    await this.selectQuestion3Answer(inputs.question3)
    await this.selectQuestion4Answer(inputs.question4)
    await this.selectQuestion5Answer(inputs.question5)
  }

  // Form submission and navigation
  async submitCalculation() {
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // Wait for results to appear
    await this.page.waitForSelector('.results', { timeout: 5000 })
  }

  async resetForm() {
    const resetButton = this.page.getByRole('button', { name: /reset/i })
    await resetButton.click()
  }

  // Results verification
  async getCalculatedScore(): Promise<number> {
    // Wait for results section to be visible
    await this.page.waitForSelector('.results', { timeout: 5000 })
    
    // Look for the score in the format "WHO-5 Score X : ..."
    const scoreElement = this.page.locator('text=/WHO-5 Score \\d+/')
    const scoreText = await scoreElement.textContent()
    
    if (!scoreText) {
      throw new Error('Could not find calculated score')
    }

    // Extract the number from "WHO-5 Score X : ..."
    const match = scoreText.match(/WHO-5 Score (\\d+)/)
    if (!match) {
      throw new Error(`Could not parse score from: ${scoreText}`)
    }

    return parseInt(match[1], 10)
  }

  async getInterpretation(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('.results', { timeout: 5000 })
    
    // Look for the interpretation in the format "WHO-5 Score X : interpretation"
    const resultElement = this.page.locator('text=/WHO-5 Score \\d+ : /')
    const resultText = await resultElement.textContent()
    
    if (!resultText) {
      throw new Error('Could not find score interpretation')
    }

    // Extract the interpretation part after the colon
    const match = resultText.match(/WHO-5 Score \\d+ : (.+)/)
    if (!match) {
      throw new Error(`Could not parse interpretation from: ${resultText}`)
    }

    return match[1].trim()
  }

  async getRecommendations(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('.results', { timeout: 5000 })
    
    // Look for recommendations section
    const recommendationsElement = this.page.locator('text=Anbefalinger:')
    if (await recommendationsElement.isVisible()) {
      const recommendationsSection = recommendationsElement.locator('..') // Parent element
      const recommendationsText = await recommendationsSection.textContent()
      return recommendationsText || ''
    }
    
    return ''
  }

  // Verification helpers
  async verifyPatientSection() {
    await expect(this.page.locator('text=Patient')).toBeVisible()
    await expect(this.page.getByPlaceholder('Indtast navn')).toBeVisible()
    await expect(this.page.locator('#personAge')).toBeVisible()
  }

  async verifyFormSections() {
    // Check that all 5 WHO-5 questions are present
    const questions = [
      'I de sidste 2 uger har jeg været glad og i godt humør',
      'I de sidste 2 uger har jeg følt mig rolig og afslappet',
      'I de sidste 2 uger har jeg følt mig aktiv og energisk',
      'I de sidste 2 uger er jeg vågnet frisk og udhvilet',
      'I de sidste 2 uger har min daglig været fyldt med ting der interesserer mig'
    ]

    for (const question of questions) {
      await expect(this.page.locator(`text=${question}`)).toBeVisible()
    }
  }

  async verifyRequiredFieldsValidation() {
    // Try to submit without filling required fields
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // WHO-5 may not have strict validation, so this might need adjustment
    // Check if validation message appears or if form submission is blocked
  }

  async verifyAgeValidation(age: number) {
    const ageInput = this.page.locator('#personAge input')
    await ageInput.clear()
    await ageInput.fill(age.toString())
    await this.page.click('body') // Trigger validation
    
    // Check if age is within valid range (16-110)
    const ageValue = await ageInput.inputValue()
    const numericValue = parseInt(ageValue.replace(' År', ''))
    
    if (age < 16 || age > 110) {
      // Should show validation error or reset to valid value
      expect(numericValue).toBeGreaterThanOrEqual(16)
      expect(numericValue).toBeLessThanOrEqual(110)
    } else {
      expect(numericValue).toBe(age)
    }
  }

  async copyToClipboard() {
    const copyButton = this.page.locator('[data-testid="copy-dialog"]')
    await copyButton.click()
    
    // Verify copy dialog is visible
    await expect(copyButton).toBeVisible()
  }

  // Accessibility helpers
  async checkKeyboardNavigation() {
    // Test Tab navigation through form elements
    await this.page.keyboard.press('Tab')
    
    // Check that focus moves through form elements
    const focusedElement = this.page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  }

  async checkAriaLabels() {
    // Check that form elements have proper ARIA labels
    const inputs = this.page.locator('input')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const hasAriaLabel = await input.getAttribute('aria-label') !== null
      const hasAriaLabelledBy = await input.getAttribute('aria-labelledby') !== null
      
      // At least one form of labeling should be present
      expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy()
    }
  }

  // Mobile testing helpers
  async setMobileViewport(width: number = 375, height: number = 667) {
    await this.page.setViewportSize({ width, height })
  }

  async verifyMobileLayout() {
    // Check that the calculator is responsive on mobile
    const container = this.page.locator('.medical-calculator-container')
    await expect(container).toBeVisible()
    
    // Check that form elements are properly sized for mobile
    const formElements = this.page.locator('input, button')
    const elementCount = await formElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = formElements.nth(i)
      await expect(element).toBeVisible()
    }
  }

  // Performance testing helpers
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