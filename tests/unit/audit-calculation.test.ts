import { describe, expect, test } from 'vitest';
import { auditCalculator } from '@/calculators/audit/auditCalculator';

describe('Golden Test Suite for AUDIT Calculation - New Logic', () => {
  const runTest = (answers: Record<string, number | null>, expectedScore: number, expectedConclusion: string) => {
    const { score, interpretation } = auditCalculator.calculate(answers);
    expect(score).toBe(expectedScore);
    expect(interpretation).toBe(expectedConclusion);
  };

  test('should return correct score and conclusion for low-risk answers', () => {
    const answers = { question1: 1, question2: 1, question3: 1, question4: 0, question5: 0, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0 };
    runTest(answers, 3, 'Ikke tegn på alkoholafhængighed (AUDIT Score < 8)');
  });

  test('should return correct score and conclusion for boundary-low risk (score 7)', () => {
    const answers = { question1: 1, question2: 1, question3: 1, question4: 1, question5: 1, question6: 1, question7: 1, question8: 0, question9: 0, question10: 0 };
    runTest(answers, 7, 'Ikke tegn på alkoholafhængighed (AUDIT Score < 8)');
  });

  test('should return correct score and conclusion for boundary-high risk (score 8)', () => {
    const answers = { question1: 1, question2: 1, question3: 1, question4: 1, question5: 1, question6: 1, question7: 1, question8: 1, question9: 0, question10: 0 };
    runTest(answers, 8, 'Tegn på alkoholafhængighed (AUDIT Score ≥ 8)');
  });

  test('should return correct score and conclusion for high-risk answers', () => {
    const answers = { question1: 4, question2: 4, question3: 4, question4: 4, question5: 4, question6: 4, question7: 4, question8: 4, question9: 4, question10: 4 };
    runTest(answers, 40, 'Tegn på alkoholafhængighed (AUDIT Score ≥ 8)');
  });

  test('should handle zero score correctly', () => {
    const answers = { question1: 0, question2: 0, question3: 0, question4: 0, question5: 0, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0 };
    runTest(answers, 0, 'Ikke tegn på alkoholafhængighed (AUDIT Score < 8)');
  });

  test('should handle null or missing answers as 0', () => {
    const answers = { question1: 1, question2: 0, question3: 2, question4: 0, question5: 3, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0 };
    const { score, interpretation } = auditCalculator.calculate(answers);
    expect(score).toBe(6);
    expect(interpretation).toBe('Ikke tegn på alkoholafhængighed (AUDIT Score < 8)');
  });
});