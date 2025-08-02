import { useState, useEffect } from 'react';
import { Icon, Icons } from '@/components';
import { MedicineWithInventory } from '@/lib/db';
import { submitSheets, getInitialSheetFormData, addSheetRow, removeSheetRow, updateSheetRow } from '../utils';
import { SheetFormData } from '../types';

interface AddSheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedicine: MedicineWithInventory | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function AddSheetForm({
  isOpen,
  onClose,
  selectedMedicine,
  onSuccess,
  onError
}: AddSheetFormProps) {
  const [sheetFormData, setSheetFormData] = useState<SheetFormData>(getInitialSheetFormData());

  useEffect(() => {
    if (isOpen && selectedMedicine) {
      setSheetFormData(getInitialSheetFormData());
    }
  }, [isOpen, selectedMedicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    try {
      await submitSheets(selectedMedicine, sheetFormData);
      setSheetFormData(getInitialSheetFormData());
      onSuccess();
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Network error occurred');
    }
  };

  const handleClose = () => {
    setSheetFormData(getInitialSheetFormData());
    onClose();
  };

  const handleAddMoreSheets = () => {
    setSheetFormData(addSheetRow(sheetFormData));
  };

  const handleRemoveSheetRow = (index: number) => {
    setSheetFormData(removeSheetRow(sheetFormData, index));
  };

  const handleUpdateSheetRow = (index: number, field: string, value: string | number | boolean | Date) => {
    setSheetFormData(updateSheetRow(sheetFormData, index, field, value, selectedMedicine));
  };

  if (!isOpen || !selectedMedicine) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add New Sheet - {selectedMedicine.name}
          {selectedMedicine.strength && ` (${selectedMedicine.strength})`}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon name={Icons.CLOSE} size="md" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {sheetFormData.sheets.map((sheet, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            {index > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => handleRemoveSheetRow(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete this row"
                >
                  <Icon name={Icons.DELETE} size="sm" />
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {/* Expiry Date */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={sheet.expiry_date}
                  onChange={(e) => handleUpdateSheetRow(index, 'expiry_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Number of Sheets */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Sheets *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sheet.number_of_sheets}
                  onChange={(e) => handleUpdateSheetRow(index, 'number_of_sheets', parseInt(e.target.value) || 1)}
                  disabled={sheet.is_in_use}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
                {sheet.is_in_use && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Forced to 1 when &quot;In Use&quot; is checked
                  </p>
                )}
              </div>

              {/* In Use Checkbox */}
              <div className="flex items-center h-full pt-7 min-w-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheet.is_in_use}
                    onChange={(e) => handleUpdateSheetRow(index, 'is_in_use', e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    In Use
                  </span>
                </label>
              </div>
            </div>

            {/* Tablets Remaining (only shown when In Use is checked) */}
            {sheet.is_in_use && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tablets Remaining *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={selectedMedicine?.tablets_per_sheet || 100}
                  value={sheet.tablets_remaining}
                  onChange={(e) => handleUpdateSheetRow(index, 'tablets_remaining', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white md:w-1/3"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Out of {selectedMedicine?.tablets_per_sheet} tablets per sheet
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Add More Sheets Button */}
        <button
          type="button"
          onClick={handleAddMoreSheets}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <Icon name={Icons.ADD} size="sm" className="inline mr-2" />
          Add More Sheets
        </button>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Sheets
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
