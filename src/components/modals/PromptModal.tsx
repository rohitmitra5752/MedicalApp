import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'email' | 'password' | 'number';
}

export function PromptModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  inputType = 'text'
}: PromptModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    onConfirm(inputValue);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {message}
        </p>
        <input
          type={inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          autoFocus
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
