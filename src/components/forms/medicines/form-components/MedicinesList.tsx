import { Icon, Icons } from '@/components';
import { MedicinesListProps } from '../types';

export function MedicinesList({
  medicines,
  loading,
  searchTerm,
  onEdit,
  onDelete,
  onAddSheet,
  onAddMedicine
}: MedicinesListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Medicines ({medicines.length})
        </h2>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-green-600 rounded-full"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading medicines...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Icon name={Icons.MEDICINE} size="xl" className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medicines found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'No medicines match your search criteria.' : 'No medicines are available in the inventory.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddMedicine}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
            >
              <Icon name={Icons.ADD} size="sm" className="mr-2" />
              Add Medicine
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <Icon name={Icons.MEDICINE} size="md" className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {medicine.name}
                      </h3>
                      {medicine.strength && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                          {medicine.strength}
                        </span>
                      )}
                      {medicine.expired_sheets > 0 && (
                        <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                          {medicine.expired_sheets} Expired
                        </span>
                      )}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                      {medicine.generic_name && (
                        <p><span className="font-medium">Generic:</span> {medicine.generic_name}</p>
                      )}
                      {medicine.brand_name && (
                        <p><span className="font-medium">Brand:</span> {medicine.brand_name}</p>
                      )}
                      <p><span className="font-medium">Tablets per sheet:</span> {medicine.tablets_per_sheet}</p>
                      {medicine.additional_details && (
                        <p><span className="font-medium">Details:</span> {medicine.additional_details}</p>
                      )}
                    </div>

                    {/* Inventory Summary */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {medicine.total_sheets}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Sheets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {medicine.sheets_in_use}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">In Use</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {medicine.available_tablets}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Available Tablets</div>
                      </div>
                      <div className="text-center">
                        <button
                          onClick={() => onAddSheet(medicine)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Add Sheet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(medicine)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                    title="Edit medicine"
                  >
                    <Icon name={Icons.EDIT} size="xs" />
                  </button>
                  <button
                    onClick={() => onDelete(medicine.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Delete medicine"
                  >
                    <Icon name={Icons.DELETE} size="xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
