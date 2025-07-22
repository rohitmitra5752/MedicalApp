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
    document.addEventListener('focusin', handleDocumentFocusIn);

    // Cleanup function
    return () => {
      // Unregister from global focus manager
      modalFocusManager.unregisterModal();

      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('focusin', handleDocumentFocusIn);

      // Restore focus to the previously focused element
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
