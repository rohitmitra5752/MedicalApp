import { Modal, Icon, Icons } from '@/components';
import { CategoryForm, ParameterCategory } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  categoryForm: CategoryForm;
  setCategoryForm: (form: CategoryForm) => void;
  editingCategory: ParameterCategory | null;
  isSubmitting: boolean;
  error: string;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categoryForm,
  setCategoryForm,
  editingCategory,
  isSubmitting,
  error
}: CategoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Add New Category'}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={categoryForm.category_name}
            onChange={(e) => setCategoryForm({ category_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
            autoFocus
          />
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
        
        <div className="flex justify-end space-x-3">
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
            {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
