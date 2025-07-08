import { type ErrorInfo } from '@/utils/errorBoundary';
import type { ErrorRecoveryStrategy, RecoveryResult } from './strategies/RecoveryStrategy';
import { NetworkErrorStrategy } from './strategies/NetworkErrorStrategy';
import { ValidationErrorStrategy } from './strategies/ValidationErrorStrategy';
import { CalculationErrorStrategy } from './strategies/CalculationErrorStrategy';

export class RecoveryManager {
  private strategies: ErrorRecoveryStrategy[];

  constructor() {
    this.strategies = [
      new NetworkErrorStrategy(),
      new ValidationErrorStrategy(),
      new CalculationErrorStrategy(),
    ];
  }

  async attemptRecovery(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult> {
    const strategy = this.strategies.find(s => s.canRecover(errorInfo));

    if (!strategy) {
      return { success: false, shouldRetry: false };
    }

    return strategy.recover(errorInfo, context);
  }
}
