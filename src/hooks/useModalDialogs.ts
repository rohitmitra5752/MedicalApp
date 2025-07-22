import { useState } from 'react';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive: boolean;
  confirmText: string;
}

interface PromptState {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder: string;
  defaultValue: string;
  inputType: 'text' | 'email' | 'password' | 'number';
  onConfirm: (value: string) => void;
}

export function useModalDialogs() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
    confirmText: 'Confirm'
  });

  const [promptState, setPromptState] = useState<PromptState>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    inputType: 'text',
    onConfirm: () => {}
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Convenience methods for common alert types
  const showSuccess = (title: string, message: string) => showAlert(title, message, 'success');
  const showError = (title: string, message: string) => showAlert(title, message, 'error');
  const showInfo = (title: string, message: string) => showAlert(title, message, 'info');
  const showWarning = (title: string, message: string) => showAlert(title, message, 'warning');

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      isDestructive?: boolean;
      confirmText?: string;
    }
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDestructive: options?.isDestructive || false,
      confirmText: options?.confirmText || 'Confirm'
    });
  };

  const showPrompt = (
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    options?: {
      placeholder?: string;
      defaultValue?: string;
      inputType?: 'text' | 'email' | 'password' | 'number';
    }
  ) => {
    setPromptState({
      isOpen: true,
      title,
      message,
      placeholder: options?.placeholder || '',
      defaultValue: options?.defaultValue || '',
      inputType: options?.inputType || 'text',
      onConfirm
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const closePrompt = () => {
    setPromptState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    confirmState.onConfirm();
    closeConfirm();
  };

  const handlePromptConfirm = (value: string) => {
    promptState.onConfirm(value);
    closePrompt();
  };

  return {
    // State
    alertState,
    confirmState,
    promptState,
    
    // Actions
    showAlert,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showPrompt,
    closeAlert,
    closeConfirm,
    closePrompt,
    handleConfirm,
    handlePromptConfirm
  };
}
