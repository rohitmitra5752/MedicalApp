import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Icon, Icons } from '../Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const containerRef = useFocusTrap(isOpen);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      wasOpenRef.current = true;
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
      wasOpenRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = () => {
      onClose();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('modal-escape', handleEscape as EventListener);
      return () => {
        container.removeEventListener('modal-escape', handleEscape as EventListener);
      };
    }
  }, [onClose, containerRef]);

  // Additional focus management for visibility changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      // When page becomes visible again and modal is open, ensure focus is in modal
      if (!document.hidden && isOpen && containerRef.current) {
        setTimeout(() => {
          const container = containerRef.current;
          if (container && !container.contains(document.activeElement)) {
            const firstFocusable = container.querySelector('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])') as HTMLElement;
            if (firstFocusable) {
              console.log('Page became visible, restoring focus to modal');
              firstFocusable.focus();
            }
          }
        }, 100); // Small delay to ensure visibility change is complete
      }
    };

    if (isOpen) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isOpen, containerRef]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={containerRef}
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full ${maxWidth} mx-4 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            id="modal-title"
            className="text-lg font-semibold text-gray-800 dark:text-white"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <Icon name={Icons.CLOSE} size="lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
