import { Modal, Icon, Icons } from '@/components';
import { ParameterModalProps } from '../types';

export default function ParameterModal({
  isOpen,
  onClose,
  onSubmit,
  parameterForm,
  setParameterForm,
  editingParameter,
  isSubmitting,
  error
}: ParameterModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parameter Name
            </label>
            <input
              type="text"
              value={parameterForm.parameter_name}
              onChange={(e) => setParameterForm({ ...parameterForm, parameter_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              autoFocus
            />
          </div>
          
          {/* Male Range Section */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-blue-600 dark:text-blue-400 text-lg">♂</span>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Male Reference Range</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={parameterForm.minimum_male}
                  onChange={(e) => setParameterForm({ ...parameterForm, minimum_male: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={parameterForm.maximum_male}
                  onChange={(e) => setParameterForm({ ...parameterForm, maximum_male: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Female Range Section */}
          <div className="space-y-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-pink-600 dark:text-pink-400 text-lg">♀</span>
              <h4 className="text-sm font-semibold text-pink-800 dark:text-pink-300">Female Reference Range</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={parameterForm.minimum_female}
                  onChange={(e) => setParameterForm({ ...parameterForm, minimum_female: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={parameterForm.maximum_female}
                  onChange={(e) => setParameterForm({ ...parameterForm, maximum_female: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unit
            </label>
            <input
              type="text"
              value={parameterForm.unit}
              onChange={(e) => setParameterForm({ ...parameterForm, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., mmHg, bpm, mg/dL"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={parameterForm.sort_order}
              onChange={(e) => setParameterForm({ ...parameterForm, sort_order: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower numbers appear first. Leave blank for default (0).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={parameterForm.description}
              onChange={(e) => setParameterForm({ ...parameterForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
            <div className="flex items-start">
              <Icon name={Icons.ERROR} size="sm" className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Saving...' : (editingParameter ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
