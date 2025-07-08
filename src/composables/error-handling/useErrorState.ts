import { ref, computed, readonly } from 'vue';
import { ErrorType, type ErrorInfo } from '@/utils/errorBoundary';

export function useErrorState() {
  const errors = ref<ErrorInfo[]>([]);

  const hasErrors = computed(() => errors.value.length > 0);
  const networkErrors = computed(() =>
    errors.value.filter(error => error.errorType === ErrorType.NETWORK)
  );
  const validationErrors = computed(() =>
    errors.value.filter(error => error.errorType === ErrorType.VALIDATION)
  );
  const calculationErrors = computed(() =>
    errors.value.filter(error => error.errorType === ErrorType.CALCULATION)
  );

  const addError = (error: ErrorInfo) => {
    errors.value.push(error);
  };

  const clearErrors = () => {
    errors.value = [];
  };

  const clearError = (index: number) => {
    if (index >= 0 && index < errors.value.length) {
      errors.value.splice(index, 1);
    }
  };

  const clearErrorsByType = (errorType: ErrorType) => {
    errors.value = errors.value.filter(error => error.errorType !== errorType);
  };

  return {
    errors: readonly(errors),
    hasErrors,
    networkErrors,
    validationErrors,
    calculationErrors,
    addError,
    clearErrors,
    clearError,
    clearErrorsByType,
  };
}
