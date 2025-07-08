import { describe, it, expect } from 'vitest';
import { useErrorState } from '@/composables/error-handling/useErrorState';
import { ErrorType, ErrorInfo } from '@/utils/errorBoundary';

describe('useErrorState', () => {
  it('should initialize with empty errors', () => {
    const { errors, hasErrors } = useErrorState();
    expect(errors.value).toEqual([]);
    expect(hasErrors.value).toBe(false);
  });

  it('should add an error', () => {
    const { errors, addError, hasErrors } = useErrorState();
    const error: ErrorInfo = { errorMessage: 'Test Error', errorType: ErrorType.UNKNOWN, recoverable: false, timestamp: new Date() };
    addError(error);
    expect(errors.value).toEqual([error]);
    expect(hasErrors.value).toBe(true);
  });

  it('should clear all errors', () => {
    const { errors, addError, clearErrors, hasErrors } = useErrorState();
    const error: ErrorInfo = { errorMessage: 'Test Error', errorType: ErrorType.UNKNOWN, recoverable: false, timestamp: new Date() };
    addError(error);
    clearErrors();
    expect(errors.value).toEqual([]);
    expect(hasErrors.value).toBe(false);
  });

  it('should clear an error by index', () => {
    const { errors, addError, clearError } = useErrorState();
    const error1: ErrorInfo = { errorMessage: 'Error 1', errorType: ErrorType.UNKNOWN, recoverable: false, timestamp: new Date() };
    const error2: ErrorInfo = { errorMessage: 'Error 2', errorType: ErrorType.UNKNOWN, recoverable: false, timestamp: new Date() };
    addError(error1);
    addError(error2);
    clearError(0);
    expect(errors.value).toEqual([error2]);
  });

  it('should clear errors by type', () => {
    const { errors, addError, clearErrorsByType } = useErrorState();
    const error1: ErrorInfo = { errorMessage: 'Network Error', errorType: ErrorType.NETWORK, recoverable: true, timestamp: new Date() };
    const error2: ErrorInfo = { errorMessage: 'Validation Error', errorType: ErrorType.VALIDATION, recoverable: false, timestamp: new Date() };
    addError(error1);
    addError(error2);
    clearErrorsByType(ErrorType.NETWORK);
    expect(errors.value).toEqual([error2]);
  });

  it('should correctly filter network errors', () => {
    const { addError, networkErrors } = useErrorState();
    const error: ErrorInfo = { errorMessage: 'Network Error', errorType: ErrorType.NETWORK, recoverable: true, timestamp: new Date() };
    addError(error);
    expect(networkErrors.value).toEqual([error]);
  });

  it('should correctly filter validation errors', () => {
    const { addError, validationErrors } = useErrorState();
    const error: ErrorInfo = { errorMessage: 'Validation Error', errorType: ErrorType.VALIDATION, recoverable: false, timestamp: new Date() };
    addError(error);
    expect(validationErrors.value).toEqual([error]);
  });

  it('should correctly filter calculation errors', () => {
    const { addError, calculationErrors } = useErrorState();
    const error: ErrorInfo = { errorMessage: 'Calculation Error', errorType: ErrorType.CALCULATION, recoverable: false, timestamp: new Date() };
    addError(error);
    expect(calculationErrors.value).toEqual([error]);
  });
});
