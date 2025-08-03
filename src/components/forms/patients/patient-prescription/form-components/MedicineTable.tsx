import { Icon, Icons } from '@/components';
import type { MedicineTableProps } from '../types';

export function MedicineTable({ 
  tableData, 
  onDeleteMedicine, 
  onAddMedicine, 
  onEditMedicine,
  showAddButton = true 
}: MedicineTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Medicine Schedule
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-800 dark:text-white"></th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Recurrence</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Morning</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Afternoon</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Evening</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.medicine_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{row.medicine_name}</div>
                    {row.medicine_strength && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{row.medicine_strength}</div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                  {row.recurrence}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                  {row.morning || 0}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                  {row.afternoon || 0}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                  {row.evening || 0}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {onEditMedicine && (
                      <button
                        onClick={() => onEditMedicine(row)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit medicine"
                      >
                        <Icon name={Icons.EDIT} size="xs" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteMedicine(row.medicine_id, row.medicine_name)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove medicine"
                    >
                      <Icon name={Icons.DELETE} size="xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {tableData.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No medicines added to this prescription yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add More Medicines Button */}
      {showAddButton && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onAddMedicine}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <Icon name={Icons.ADD} size="xs" className="mr-2" />
            Add More Medicines
          </button>
        </div>
      )}
    </div>
  );
}
