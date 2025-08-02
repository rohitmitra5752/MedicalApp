import { useState, useEffect } from 'react';
import { Icon, Icons } from '@/components';
import { submitMedicine, getInitialMedicineFormData, medicineToFormData } from '../utils';
import { MedicineFormData, MedicineFormProps } from '../types';

export function MedicineForm({
  isOpen,
  onClose,
  editingMedicine,
  onSuccess,
  onError
}: MedicineFormProps) {
  const [formData, setFormData] = useState<MedicineFormData>(getInitialMedicineFormData());

  useEffect(() => {
    if (editingMedicine) {
      setFormData(medicineToFormData(editingMedicine));
    } else {
      setFormData(getInitialMedicineFormData());
    }
  }, [editingMedicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitMedicine(formData, editingMedicine);
      setFormData(getInitialMedicineFormData());
      onSuccess();
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Network error occurred');
    }
  };

  const handleClose = () => {
    setFormData(getInitialMedicineFormData());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon name={Icons.CLOSE} size="md" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generic Name
          </label>
          <input
            type="text"
            value={formData.generic_name}
            onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brand_name}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Strength
          </label>
          <input
            type="text"
            value={formData.strength}
            onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tablets per Sheet *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.tablets_per_sheet}
            onChange={(e) => setFormData({ ...formData, tablets_per_sheet: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Details
          </label>
          <textarea
            rows={3}
            value={formData.additional_details}
            onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            {editingMedicine ? (
              <>
                <Icon name={Icons.EDIT} size="sm" className="mr-2" />
                Update Medicine
              </>
            ) : (
              <>
                <Icon name={Icons.ADD} size="sm" className="mr-2" />
                Add Medicine
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
