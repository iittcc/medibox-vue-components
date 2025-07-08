import { useToast } from 'primevue/usetoast';
import { ErrorType } from '@/utils/errorBoundary';

export function useNotifications() {
  const toast = useToast();

  const getSeverity = (errorType: ErrorType): 'success' | 'info' | 'warn' | 'error' => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'warn';
      case ErrorType.VALIDATION:
        return 'info';
      case ErrorType.CALCULATION:
      case ErrorType.UNKNOWN:
      default:
        return 'error';
    }
  };

  const getToastSummary = (errorType: ErrorType): string => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'Netværksfejl';
      case ErrorType.VALIDATION:
        return 'Valideringsfejl';
      case ErrorType.CALCULATION:
        return 'Beregningsfejl';
      case ErrorType.UNKNOWN:
      default:
        return 'Systemfejl';
    }
  };

  const showErrorToast = (errorType: ErrorType, message: string, recoverable: boolean) => {
    const severity = getSeverity(errorType);
    toast.add({
      severity,
      summary: getToastSummary(errorType),
      detail: message,
      life: recoverable ? 5000 : 10000,
      closable: true,
    });
  };

  const showSuccess = (message: string, detail?: string) => {
    toast.add({
      severity: 'success',
      summary: message,
      detail,
      life: 3000,
    });
  };

  const showInfo = (message: string, detail?: string) => {
    toast.add({
      severity: 'info',
      summary: message,
      detail,
      life: 5000,
    });
  };

  const showWarning = (message: string, detail?: string) => {
    toast.add({
      severity: 'warn',
      summary: message,
      detail,
      life: 7000,
    });
  };

  return {
    showErrorToast,
    showSuccess,
    showInfo,
    showWarning,
  };
}
