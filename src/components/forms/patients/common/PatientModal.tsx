'use client';

import { useState, useEffect } from 'react';
import { Modal, CountrySelector, SexSelector, ToggleSwitch } from '@/components';
import { Patient, PatientFormData } from './types';
import { 
  savePatient,
  createEmptyPatientForm,
  createPatientFormFromPatient
} from './utils';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
  onSave: () => void; // Callback when save is successful
}

export default function PatientModal({
  isOpen,
  onClose,
  editingPatient,
  onSave
}: PatientModalProps) {
  const [patientForm, setPatientForm] = useState<PatientFormData>(createEmptyPatientForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when editing patient changes
  useEffect(() => {
    if (editingPatient) {
      setPatientForm(createPatientFormFromPatient(editingPatient));
    } else {
      setPatientForm(createEmptyPatientForm());
    }
  }, [editingPatient, isOpen]);

  const handleClose = () => {
    setPatientForm(createEmptyPatientForm());
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Patient submission already in progress, ignoring');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await savePatient(patientForm, editingPatient);
      if (success) {
        handleClose();
        onSave(); // Notify parent to refresh data
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       dark:bg-gray-700 dark:text-white"
              placeholder="Enter patient name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="flex">
              <CountrySelector
                value={patientForm.country_code}
                onChange={(code) => setPatientForm({ ...patientForm, country_code: code })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white w-[100px] flex-shrink-0"
              />
              <input
                type="tel"
                value={patientForm.phone_number}
                onChange={(e) => setPatientForm({ ...patientForm, phone_number: e.target.value })}
                placeholder="123-456-7890"
                className="flex-1 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the phone number without the country code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medical ID Number *
            </label>
            <input
              type="text"
              value={patientForm.medical_id_number}
              onChange={(e) => setPatientForm({ ...patientForm, medical_id_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       dark:bg-gray-700 dark:text-white"
              placeholder="Enter medical ID number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender *
            </label>
            <SexSelector
              value={patientForm.gender}
              onChange={(gender) => setPatientForm({ ...patientForm, gender })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Taking Medicines
            </label>
            <ToggleSwitch
              value={patientForm.is_taking_medicines}
              onChange={(value) => setPatientForm({ ...patientForm, is_taking_medicines: value })}
              falseLabel="No"
              trueLabel="Yes"
              colors={{
                trueBg: 'bg-green-600',
                falseBg: 'bg-gray-200 dark:bg-gray-700'
              }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Saving...' : (editingPatient ? 'Save Changes' : 'Create Patient')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
