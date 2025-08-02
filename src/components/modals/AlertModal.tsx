import React from 'react';
import { Modal } from './Modal';
import { Icon, Icons } from '../icons';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info' 
}: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Icon name={Icons.CHECK} className="text-green-600" size="lg" />
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Icon name={Icons.CLOSE} className="text-red-600" size="lg" />
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <Icon name={Icons.WARNING} className="text-yellow-600" size="lg" />
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Icon name={Icons.INFO} className="text-blue-600" size="lg" />
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="text-center">
        {getIcon()}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
