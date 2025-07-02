import { BaseCalculator } from '../base/calculatorBase';
import type { CalculationResult, ValidationResult } from '../base/types';
import type { CalculatorResponses } from '@/types/calculatorTypes';

export class AuditCalculator extends BaseCalculator<CalculatorResponses> {
  readonly metadata = {
    name: 'AUDIT',
    version: '2.0.0',
    description: 'Alcohol Use Disorders Identification Test',
    category: 'psychology' as const,
    estimatedDuration: 2,
    references: [
      'Babor, T. F., Higgins-Biddle, J. C., Saunders, J. B., & Monteiro, M. G. (2001). The Alcohol Use Disorders Identification Test. World Health Organization.',
    ],
  };

  readonly scoreRange = { min: 0, max: 40 };

  validate(responses: CalculatorResponses): ValidationResult {
    const errors = [];
    const baseValidation = super.validate(responses);
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    for (let i = 1; i <= 10; i++) {
      const field = `question${i}`;
      const value = responses[field];
      const fieldErrors = this.validateNumericRange(field, value, 0, 4, true);
      errors.push(...fieldErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  protected calculateScore(responses: CalculatorResponses): CalculationResult {
    const score = Object.values(responses).reduce((sum, value) => sum + (Number(value) || 0), 0);

    let interpretation = '';
    let riskLevel: 'low' | 'medium' | 'high' | 'very_high' = 'low';
    let recommendations: string[] = [];

    if (score >= 8) {
      interpretation = 'Tegn på alkoholafhængighed (AUDIT Score ≥ 8)';
      riskLevel = 'high';
      recommendations = ['Overvej at søge professionel hjælp', 'Tal med din læge om dit alkoholforbrug'];
    } else {
      interpretation = 'Ikke tegn på alkoholafhængighed (AUDIT Score < 8)';
      riskLevel = 'low';
      recommendations = ['Fortsæt med at overvåge dit alkoholforbrug'];
    }

    return {
      score,
      interpretation,
      riskLevel,
      recommendations,
    };
  }
}

export const auditCalculator = new AuditCalculator();
