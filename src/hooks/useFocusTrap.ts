import { useEffect, useRef } from 'react';
import { modalFocusManager } from './modalFocusManager';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only run on client side
    if (!isActive || typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    // Register with global focus manager
    modalFocusManager.registerModal(container);

    // Store the previously focused element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    };

    // Focus the first focusable element initially
    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    };

    // Initial focus with a small delay to ensure modal is fully rendered
    setTimeout(focusFirstElement, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Let the parent component handle the escape key
        // by dispatching a custom event
        container.dispatchEvent(new CustomEvent('modal-escape'));
      }
    };

    const handleCtrlEnter = (event: KeyboardEvent) => {
      // Handle Ctrl+Enter (or Cmd+Enter on Mac) to submit modal forms
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        
        // Priority 1: Look for explicit submit buttons
        const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
          return;
        }

        // Priority 2: Look for common action buttons by text content
        const buttons = container.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        for (const button of buttons) {
          const buttonText = button.textContent?.toLowerCase() || '';
          const isActionButton = buttonText.includes('submit') || 
                               buttonText.includes('save') || 
                               buttonText.includes('create') || 
                               buttonText.includes('update') || 
                               buttonText.includes('confirm') ||
                               buttonText.includes('add') ||
                               buttonText.includes('ok') ||
                               button.type === 'submit';
          
          // Skip negative actions and disabled buttons
          const isNegativeAction = buttonText.includes('cancel') || 
                                  buttonText.includes('close') ||
                                  buttonText.includes('delete') ||
                                  buttonText.includes('remove');
          
          if (isActionButton && !isNegativeAction && !button.disabled) {
            button.click();
            return;
          }
        }

        // Priority 3: Fallback to form submission if no suitable button found
        const form = container.querySelector('form') as HTMLFormElement;
        if (form) {
          const submitEvent = new Event('submit', { 
            bubbles: true, 
            cancelable: true 
          });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    // Handle focus events that might escape the modal
    const handleDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      // If focus moves outside the modal, bring it back
      if (!container.contains(target)) {
        event.preventDefault();
        focusFirstElement();
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleCtrlEnter);
    document.addEventListener('focusin', handleDocumentFocusIn);

    // Cleanup function
    return () => {
      // Unregister from global focus manager
      modalFocusManager.unregisterModal();

      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleCtrlEnter);
      document.removeEventListener('focusin', handleDocumentFocusIn);

      // Restore focus to the previously focused element
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
