'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/modals';
import { ToggleSwitch } from '@/components/shared';
import { Icon, Icons } from '@/components/icons';
import type { PrescriptionFormData, PrescriptionModalProps } from '../types';

export function PrescriptionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  patientName, 
  prescriptionData, 
  mode 
}: PrescriptionModalProps) {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    prescription_type: 'daily_monitoring',
    valid_till: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or prescription data changes
  useEffect(() => {
    if (isOpen) {
      setError(null); // Clear any previous errors
      if (mode === 'edit' && prescriptionData) {
        setFormData({
          prescription_type: prescriptionData.prescription_type,
          valid_till: prescriptionData.valid_till || ''
        });
      } else {
        setFormData({
          prescription_type: 'daily_monitoring',
          valid_till: ''
        });
      }
    }
  }, [isOpen, mode, prescriptionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Only close if submission was successful
      onClose();
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PrescriptionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearDate = () => {
    setFormData(prev => ({
      ...prev,
      valid_till: ''
    }));
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'daily_monitoring' ? 'Daily Consumption' : 'Weekly Refill';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Prescription' : 'Edit Prescription'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center">
              <Icon name={Icons.ERROR} size="sm" className="text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Patient Name (Display Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Patient
          </label>
          <input
            type="text"
            value={patientName}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This field is for display purposes only
          </p>
        </div>

        {/* Prescription Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Prescription Type <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-between">
            <ToggleSwitch
              value={formData.prescription_type === 'weekly_refill'}
              onChange={(isWeekly) => handleInputChange('prescription_type', isWeekly ? 'weekly_refill' : 'daily_monitoring')}
              falseLabel={getTypeLabel('daily_monitoring')}
              trueLabel={getTypeLabel('weekly_refill')}
              disabled={isSubmitting}
              colors={{
                trueBg: 'bg-purple-600',
                falseBg: 'bg-blue-600',
                falseActiveText: 'text-blue-600 dark:text-blue-400',
                trueActiveText: 'text-purple-600 dark:text-purple-400',
                inactiveText: 'text-gray-500 dark:text-gray-400'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Toggle to switch between prescription types
          </p>
        </div>

        {/* Valid Till Date (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valid Till (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={formData.valid_till}
              onChange={(e) => handleInputChange('valid_till', e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isSubmitting}
            />
            {formData.valid_till && (
              <button
                type="button"
                onClick={handleClearDate}
                disabled={isSubmitting}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 
                         dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 
                         rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear date"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty if the prescription has no expiry date
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Icon name={Icons.SPINNER} size="sm" className="animate-spin" />
                <span>{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Create Prescription' : 'Update Prescription'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
