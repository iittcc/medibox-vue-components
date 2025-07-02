import type { CalculatorResponses, CalculationResult } from '@/types/calculatorTypes';

export const calculateAuditScore = (responses: CalculatorResponses): CalculationResult => {
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
};
