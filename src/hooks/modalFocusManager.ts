// Global focus manager for modal dialogs
class ModalFocusManager {
  private activeModal: HTMLElement | null = null;
  private isWindowFocused = true;
  private focusCheckInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeEventListeners();
    }
  }

  private initializeEventListeners() {
    if (this.isInitialized) return;
    
    // Track window focus state
    window.addEventListener('focus', () => {
      this.isWindowFocused = true;
      this.restoreModalFocus();
    });

    window.addEventListener('blur', () => {
      this.isWindowFocused = false;
    });

    // Also handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => this.restoreModalFocus(), 100);
      }
    });

    this.isInitialized = true;
  }

  registerModal(modalElement: HTMLElement) {
    // Ensure we're on client side and initialized
    if (typeof window === 'undefined') return;
    
    if (!this.isInitialized) {
      this.initializeEventListeners();
    }

    this.activeModal = modalElement;
    this.startFocusMonitoring();
  }

  unregisterModal() {
    this.activeModal = null;
    this.stopFocusMonitoring();
  }

  private startFocusMonitoring() {
    // Only start monitoring on client side
    if (typeof window === 'undefined') return;

    // Check focus every 500ms to ensure it stays in modal
    this.focusCheckInterval = setInterval(() => {
      if (this.activeModal && this.isWindowFocused) {
        this.ensureFocusInModal();
      }
    }, 500);
  }

  private stopFocusMonitoring() {
    if (this.focusCheckInterval) {
      clearInterval(this.focusCheckInterval);
      this.focusCheckInterval = null;
    }
  }

  private ensureFocusInModal() {
    if (!this.activeModal || typeof document === 'undefined') return;

    const currentFocus = document.activeElement;
    
    // If focus is outside the modal, bring it back
    if (!this.activeModal.contains(currentFocus)) {
      this.restoreModalFocus();
    }
  }

  private restoreModalFocus() {
    if (!this.activeModal || typeof document === 'undefined') return;

    const focusableElement = this.activeModal.querySelector(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (focusableElement) {
      console.log('ModalFocusManager: Restoring focus to modal');
      focusableElement.focus();
    }
  }
}

// Create global instance
export const modalFocusManager = new ModalFocusManager();
