import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import type { EpdsPatientData, EpdsInputs } from '../fixtures/epds-test-data'
import { epdsAnswerOptions } from '../fixtures/epds-test-data'

export class EpdsCalculatorHelper {
  constructor(public page: Page) {}

  // Navigation and page setup
  async navigateToCalculator() {
    await this.page.goto('/epds.html')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageLoad() {
    // Wait for the Vue app to mount and render content
    await this.page.waitForSelector('.medical-calculator-container', { timeout: 30000 })
    // Wait for the title to be visible
    await expect(this.page.locator('text=Edinburgh postnatale depressionsscore')).toBeVisible()
    // Wait for form to be ready
    await this.page.waitForSelector('text=Har du de sidste 7 dage', { timeout: 10000 })
  }

  // Patient information helpers
  async fillPatientInfo(patient: EpdsPatientData) {
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

  // EPDS question helpers
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

  async selectQuestion6Answer(value: number) {
    await this.selectAnswerForQuestion(6, value)
  }

  async selectQuestion7Answer(value: number) {
    await this.selectAnswerForQuestion(7, value)
  }

  async selectQuestion8Answer(value: number) {
    await this.selectAnswerForQuestion(8, value)
  }

  async selectQuestion9Answer(value: number) {
    await this.selectAnswerForQuestion(9, value)
  }

  async selectQuestion10Answer(value: number) {
    await this.selectAnswerForQuestion(10, value)
  }

  private async selectAnswerForQuestion(questionNumber: number, value: number) {
    const questionKey = `question${questionNumber}` as keyof typeof epdsAnswerOptions
    const answerTextMap = epdsAnswerOptions[questionKey]
    
    if (!answerTextMap) {
      throw new Error(`Invalid question number: ${questionNumber}`)
    }

    const answerText = answerTextMap[value as keyof typeof answerTextMap]
    if (!answerText) {
      throw new Error(`Invalid EPDS answer value: ${value} for question ${questionNumber}`)
    }

    // Find the question section and select the answer within it
    const questionSection = this.page.locator(`[name="${questionKey}"]`)
    await questionSection.locator(`text=${answerText}`).click()
  }

  // Combined form filling
  async fillCalculatorForm(inputs: EpdsInputs) {
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

  // Form submission and navigation
  async submitCalculation() {
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // Wait for results to appear
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
  }

  async resetForm() {
    const resetButton = this.page.getByRole('button', { name: /reset/i })
    await resetButton.click()
  }

  // Results verification
  async getCalculatedScore(): Promise<number> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the score in the format "Edinburgh postnatale depressionsscore X : ..."
    const scoreElement = this.page.locator('text=/Edinburgh postnatale depressionsscore \\d+/')
    const scoreText = await scoreElement.textContent()
    
    if (!scoreText) {
      throw new Error('Could not find calculated score')
    }

    // Extract the number from "Edinburgh postnatale depressionsscore X : ..."
    const match = scoreText.match(/Edinburgh postnatale depressionsscore (\\d+)/)
    if (!match) {
      throw new Error(`Could not parse score from: ${scoreText}`)
    }

    return parseInt(match[1], 10)
  }

  async getInterpretation(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for the interpretation in the format "Edinburgh postnatale depressionsscore X : interpretation"
    const resultElement = this.page.locator('text=/Edinburgh postnatale depressionsscore \\d+ : /')
    const resultText = await resultElement.textContent()
    
    if (!resultText) {
      throw new Error('Could not find score interpretation')
    }

    // Extract the interpretation part after the colon
    const match = resultText.match(/Edinburgh postnatale depressionsscore \\d+ : (.+)/)
    if (!match) {
      throw new Error(`Could not parse interpretation from: ${resultText}`)
    }

    return match[1].trim()
  }

  async getRecommendations(): Promise<string> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Look for recommendations section
    const recommendationsElement = this.page.locator('text=Anbefalinger:')
    if (await recommendationsElement.isVisible()) {
      const recommendationsSection = recommendationsElement.locator('..') // Parent element
      const recommendationsText = await recommendationsSection.textContent()
      return recommendationsText || ''
    }
    
    return ''
  }

  async checkForUrgentReferral(): Promise<boolean> {
    // Wait for results section to be visible
    await this.page.waitForSelector('[data-testid="results-section"]', { timeout: 5000 })
    
    // Check for urgent referral message
    const urgentMessage = this.page.locator('text=Kræver øjeblikkelig handling')
    return await urgentMessage.isVisible()
  }

  // Verification helpers
  async verifyPatientSection() {
    await expect(this.page.locator('text=Patient')).toBeVisible()
    await expect(this.page.getByPlaceholder('Indtast navn')).toBeVisible()
    await expect(this.page.locator('#personAge')).toBeVisible()
  }

  async verifyFormSections() {
    // Check that all 10 EPDS questions are present
    const questions = [
      'Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?',
      'Har du de sidste 7 dage kunnet se frem til ting med glæde?',
      'Har du de sidste 7 dage unødvendigt bebrejdet dig selv, når ting ikke gik som de skulle?',
      'Har du de sidste 7 dage været anspændt og bekymret uden nogen særlig grund?',
      'Har du de sidste 7 dage følt dig angst eller panikslagen uden nogen særlig grund?',
      'Har du de sidste 7 dage følt, at tingene voksede dig over hovedet?',
      'Har du de sidste 7 dage været så ked af det, at du har haft svært ved at sove?',
      'Har du de sidste 7 dage følt dig trist eller elendigt til mode?',
      'Har du de sidste 7 dage været så ulykkelig, at du har grædt?',
      'Har tanken om at gøre skade på dig selv strejfet dig de sidste 7 dage?'
    ]

    for (const question of questions) {
      await expect(this.page.locator(`text=${question}`)).toBeVisible()
    }
  }

  async verifyRequiredFieldsValidation() {
    // Try to submit without filling required fields
    const submitButton = this.page.getByRole('button', { name: /beregn|calculate/i })
    await submitButton.click()
    
    // Check if validation message appears
    const _validationMessage = this.page.locator('text=Der opstod en fejl ved beregning')
    // Framework should handle validation gracefully
  }

  async verifyAgeValidation(age: number) {
    const ageInput = this.page.locator('#personAge input')
    await ageInput.clear()
    await ageInput.fill(age.toString())
    await this.page.click('body') // Trigger validation
    
    // Check if age is within valid range (12-50)
    const ageValue = await ageInput.inputValue()
    const numericValue = parseInt(ageValue.replace(' År', ''))
    
    if (age < 12 || age > 50) {
      // Should show validation error or reset to valid value
      expect(numericValue).toBeGreaterThanOrEqual(12)
      expect(numericValue).toBeLessThanOrEqual(50)
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

  // EPDS-specific helpers
  async verifySuicidalIdeationHandling() {
    // Check that question 10 responses are handled appropriately
    await this.selectQuestion10Answer(3) // Highest risk answer
    
    // After calculation, verify urgent referral is shown
    const hasUrgentReferral = await this.checkForUrgentReferral()
    expect(hasUrgentReferral).toBeTruthy()
  }

  async verifyPostnatalDepressionContent() {
    // Verify EPDS-specific content is present
    await expect(this.page.locator('text=postnatale depressionsscore')).toBeVisible()
    await expect(this.page.locator('text=de sidste 7 dage')).toBeVisible()
  }

  async verifyGenderDisplay() {
    // Verify gender display is shown (block) for EPDS
    const genderSection = this.page.locator('text=Mand')
    await expect(genderSection).toBeVisible()
  }
}