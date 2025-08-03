import { useState } from 'react';
import type { AddMedicineFormProps } from './types';
import {
  getInitialAddMedicineForm,
  handleMedicineSelection,
  handleRecurrenceChange,
  handleIntervalChange,
  handleDosageChange
} from '../utils';

export function AddMedicineForm({ 
  isVisible, 
  onClose, 
  onSubmit, 
  availableMedicines}: AddMedicineFormProps) {
  const [addForm, setAddForm] = useState(getInitialAddMedicineForm());

  const handleSubmit = async () => {
    await onSubmit(addForm);
    setAddForm(getInitialAddMedicineForm());
  };

  const handleCancel = () => {
    setAddForm(getInitialAddMedicineForm());
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Medicine to Prescription</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Medicine
          </label>
          <select
            value={addForm.medicine_id || ''}
            onChange={(e) => setAddForm(handleMedicineSelection(e.target.value, availableMedicines, addForm))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a medicine</option>
            {availableMedicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.name} {medicine.strength ? `(${medicine.strength})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recurrence
          </label>
          <select
            value={addForm.recurrence_type}
            onChange={(e) => setAddForm(handleRecurrenceChange(e.target.value, addForm))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="daily">Daily</option>
            <option value="interval">Every X days</option>
          </select>
        </div>

        {addForm.recurrence_type === 'interval' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interval (days)
            </label>
            <input
              type="number"
              min="1"
              value={addForm.recurrence_interval}
              onChange={(e) => setAddForm(handleIntervalChange(e.target.value, addForm))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Morning
          </label>
          <input
            type="number"
            min="0"
            value={addForm.morning}
            onChange={(e) => setAddForm(handleDosageChange('morning', e.target.value, addForm))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Afternoon
          </label>
          <input
            type="number"
            min="0"
            value={addForm.afternoon}
            onChange={(e) => setAddForm(handleDosageChange('afternoon', e.target.value, addForm))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Evening
          </label>
          <input
            type="number"
            min="0"
            value={addForm.evening}
            onChange={(e) => setAddForm(handleDosageChange('evening', e.target.value, addForm))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Medicine
        </button>
      </div>
    </div>
  );
}
