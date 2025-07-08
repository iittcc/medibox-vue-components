import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotifications } from '@/composables/useNotifications';
import { ErrorType } from '@/utils/errorBoundary';
import { useToast } from 'primevue/usetoast';

// Mock the useToast composable
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(),
}));

describe('useNotifications', () => {
  let toastMock: any;

  beforeEach(() => {
    toastMock = {
      add: vi.fn(),
    };
    (useToast as any).mockReturnValue(toastMock);
  });

  it('should show success toast', () => {
    const { showSuccess } = useNotifications();
    showSuccess('Success', 'Details');
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Details',
      life: 3000,
    });
  });

  it('should show info toast', () => {
    const { showInfo } = useNotifications();
    showInfo('Info', 'Details');
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info',
      detail: 'Details',
      life: 5000,
    });
  });

  it('should show warning toast', () => {
    const { showWarning } = useNotifications();
    showWarning('Warning', 'Details');
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Details',
      life: 7000,
    });
  });

  it('should show error toast for network error', () => {
    const { showErrorToast } = useNotifications();
    showErrorToast(ErrorType.NETWORK, 'Network error', true);
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Netværksfejl',
      detail: 'Network error',
      life: 5000,
      closable: true,
    });
  });

  it('should show error toast for validation error', () => {
    const { showErrorToast } = useNotifications();
    showErrorToast(ErrorType.VALIDATION, 'Validation error', false);
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Valideringsfejl',
      detail: 'Validation error',
      life: 10000,
      closable: true,
    });
  });

  it('should show error toast for calculation error', () => {
    const { showErrorToast } = useNotifications();
    showErrorToast(ErrorType.CALCULATION, 'Calculation error', false);
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Beregningsfejl',
      detail: 'Calculation error',
      life: 10000,
      closable: true,
    });
  });

  it('should show error toast for unknown error', () => {
    const { showErrorToast } = useNotifications();
    showErrorToast(ErrorType.UNKNOWN, 'Unknown error', false);
    expect(toastMock.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Systemfejl',
      detail: 'Unknown error',
      life: 10000,
      closable: true,
    });
  });
});
