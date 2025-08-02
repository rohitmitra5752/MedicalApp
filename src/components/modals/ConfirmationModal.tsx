import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
  isDestructive?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children, 
  confirmText = 'Confirm',
  confirmButtonClass,
  isDestructive = false
}: ConfirmationModalProps) {
  const defaultConfirmClass = isDestructive 
    ? 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    : 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-6">
        {children}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={confirmButtonClass || defaultConfirmClass}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
