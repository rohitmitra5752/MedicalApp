'use client';

import { useState, useEffect } from 'react';
import { Modal, ConfirmationModal, Icon, Icons } from '@/components';
import { 
  ParameterCategory, 
  Parameter, 
  CategoryWithParameters, 
  ParameterManagementProps,
  CategoryForm,
  ParameterForm 
} from './types';
import {
  fetchData,
  submitCategoryForm,
  submitParameterForm,
  deleteCategory,
  deleteParameter,
  reorderParameters,
  updateParameterSortOrder,
  toggleCategoryExpansion,
  initializeCategoryForm,
  initializeParameterForm,
  populateCategoryForm,
  populateParameterForm
} from './utils';
import { ParameterModal, CategoryModal, SortableParameterList } from './form-components';

export default function ParameterManagement({ onDataUpdate }: ParameterManagementProps) {
  const [categories, setCategories] = useState<CategoryWithParameters[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  const [showDeleteParameterConfirm, setShowDeleteParameterConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ParameterCategory | null>(null);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithParameters | null>(null);
  const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(null);
  
  // Add submission state to prevent double submissions
  const [isSubmittingParameter, setIsSubmittingParameter] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  
  // Error states
  const [parameterError, setParameterError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initializeCategoryForm());
  const [parameterForm, setParameterForm] = useState<ParameterForm>(initializeParameterForm(0));

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    try {
      setIsLoading(true);
      const categoriesWithParams = await fetchData();
      setCategories(categoriesWithParams);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    const newExpanded = toggleCategoryExpansion(categoryId, expandedCategories);
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    setCategoryForm(initializeCategoryForm());
    setEditingCategory(null);
    setCategoryError(''); // Clear any previous errors
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: ParameterCategory) => {
    setCategoryForm(populateCategoryForm(category));
    setEditingCategory(category);
    setCategoryError(''); // Clear any previous errors
    setShowCategoryModal(true);
  };

  const handleAddParameter = (categoryId: number) => {
    setParameterForm(initializeParameterForm(categoryId));
    setEditingParameter(null);
    setParameterError(''); // Clear any previous errors
    setShowParameterModal(true);
  };

  const handleEditParameter = (parameter: Parameter) => {
    setParameterForm(populateParameterForm(parameter));
    setEditingParameter(parameter);
    setParameterError(''); // Clear any previous errors
    setShowParameterModal(true);
  };

  const handleSubmitCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingCategory) {
      console.log('Category submission already in progress, ignoring');
      return;
    }
    
    // Clear any previous errors
    setCategoryError('');
    setIsSubmittingCategory(true);
    console.log('Category form submission started');
    
    try {
      await submitCategoryForm(categoryForm, editingCategory);
      setShowCategoryModal(false);
      setCategoryError('');
      handleFetchData();
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Error saving category:', error);
      setCategoryError(error instanceof Error ? error.message : 'Failed to save category. Please try again.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleSubmitParameterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingParameter) {
      console.log('Parameter submission already in progress, ignoring');
      return;
    }
    
    // Clear any previous errors
    setParameterError('');
    setIsSubmittingParameter(true);
    console.log('Parameter form submission started');
    
    try {
      await submitParameterForm(parameterForm, editingParameter);
      setShowParameterModal(false);
      setParameterError('');
      handleFetchData();
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Error saving parameter:', error);
      setParameterError(error instanceof Error ? error.message : 'Failed to save parameter. Please try again.');
    } finally {
      setIsSubmittingParameter(false);
    }
  };

  const handleDeleteCategory = (category: CategoryWithParameters) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryConfirm(true);
  };

  const handleDeleteParameter = (parameter: Parameter) => {
    setParameterToDelete(parameter);
    setShowDeleteParameterConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      setShowDeleteCategoryConfirm(false);
      setCategoryToDelete(null);
      handleFetchData();
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Frontend: Error deleting category:', error);
    }
  };

  const confirmDeleteParameter = async () => {
    if (!parameterToDelete) return;

    try {
      await deleteParameter(parameterToDelete.id);
      setShowDeleteParameterConfirm(false);
      setParameterToDelete(null);
      handleFetchData();
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Error deleting parameter:', error);
    }
  };

  const handleParameterReorder = async (newOrder: Parameter[]) => {
    try {
      await reorderParameters(newOrder);
      // Update local state to reflect the new order
      setCategories(prevCategories => 
        prevCategories.map(category => {
          if (category.id === newOrder[0].category_id) {
            return {
              ...category,
              parameters: newOrder
            };
          }
          return category;
        })
      );
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Error updating parameter order:', error);
      // Optionally, you could show an error message to the user
    }
  };

  const handleSortOrderChange = async (parameterId: number, newSortOrder: number) => {
    try {
      await updateParameterSortOrder(parameterId, newSortOrder);
      // Refresh data to get updated sort order
      handleFetchData();
      onDataUpdate?.(); // Notify parent of data change
    } catch (error) {
      console.error('Error updating parameter sort order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Parameter Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Icon name={Icons.CHART} size="lg" className="mr-3 text-purple-600 dark:text-purple-400" />
              Parameter Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Manage medical parameter categories and individual parameters
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Icon name={Icons.ADD} size="sm" className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Categories Accordion */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {/* Accordion Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-lg"
                onClick={() => handleToggleCategory(category.id)}
              >
                <div className="flex items-center">
                  <Icon 
                    name={Icons.CHEVRON_RIGHT} 
                    size="sm" 
                    className={`mr-3 transform transition-transform ${expandedCategories.has(category.id) ? 'rotate-90' : ''}`}
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {category.category_name}
                  </h3>
                  <span className="ml-3 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-sm">
                    {category.parameters.length} parameters
                  </span>
                </div>
                
                {expandedCategories.has(category.id) && (
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="Edit category"
                    >
                      <Icon name={Icons.EDIT} size="sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete category"
                    >
                      <Icon name={Icons.DELETE} size="sm" />
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion Content */}
              {expandedCategories.has(category.id) && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Parameters</h4>
                    <button
                      onClick={() => handleAddParameter(category.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
                    >
                      <Icon name={Icons.ADD} size="sm" className="mr-1" />
                      Add Parameter
                    </button>
                  </div>

                  {category.parameters.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No parameters in this category yet.
                    </p>
                  ) : (
                    <SortableParameterList
                      parameters={category.parameters}
                      onEdit={handleEditParameter}
                      onDelete={handleDeleteParameter}
                      onReorder={handleParameterReorder}
                      onSortOrderChange={handleSortOrderChange}
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Icon name={Icons.TABLE} size="2xl" className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No categories found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first parameter category to get started.
              </p>
              <button
                onClick={handleAddCategory}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryError(''); // Clear errors when closing
        }}
        onSubmit={handleSubmitCategoryForm}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        editingCategory={editingCategory}
        isSubmitting={isSubmittingCategory}
        error={categoryError}
      />

      {/* Parameter Modal */}
      <ParameterModal
        isOpen={showParameterModal}
        onClose={() => {
          setShowParameterModal(false);
          setParameterError(''); // Clear errors when closing
        }}
        onSubmit={handleSubmitParameterForm}
        parameterForm={parameterForm}
        setParameterForm={setParameterForm}
        editingParameter={editingParameter}
        isSubmitting={isSubmittingParameter}
        error={parameterError}
      />

      {/* Delete Category Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteCategoryConfirm}
        onClose={() => setShowDeleteCategoryConfirm(false)}
        onConfirm={confirmDeleteCategory}
        title="Confirm Delete Category"
        confirmText="Delete Category"
        isDestructive={true}
      >
        <div className="flex items-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full mr-4">
            <Icon name={Icons.WARNING} size="lg" className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Delete Parameter Category
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Are you sure you want to delete the category{' '}
          <span className="font-semibold">&ldquo;{categoryToDelete?.category_name}&rdquo;</span>?
        </p>
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">
          This will permanently delete all {categoryToDelete?.parameters.length || 0} parameter(s) in this category:
        </p>
        {categoryToDelete && categoryToDelete.parameters.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
            {categoryToDelete.parameters.map((param) => (
              <li key={param.id}>{param.parameter_name}</li>
            ))}
          </ul>
        )}
      </ConfirmationModal>

      {/* Delete Parameter Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteParameterConfirm}
        onClose={() => setShowDeleteParameterConfirm(false)}
        onConfirm={confirmDeleteParameter}
        title="Confirm Delete Parameter"
        confirmText="Delete Parameter"
        isDestructive={true}
      >
        <div className="flex items-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full mr-4">
            <Icon name={Icons.WARNING} size="lg" className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Delete Parameter
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Are you sure you want to delete the parameter{' '}
          <span className="font-semibold">&ldquo;{parameterToDelete?.parameter_name}&rdquo;</span>?
        </p>
        {parameterToDelete && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Description:</span> {parameterToDelete.description}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-medium">Male Range:</span> {parameterToDelete.minimum_male} - {parameterToDelete.maximum_male} {parameterToDelete.unit}
              <br />
              <span className="font-medium">Female Range:</span> {parameterToDelete.minimum_female} - {parameterToDelete.maximum_female} {parameterToDelete.unit}
            </p>
          </div>
        )}
        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-3">
          This will also delete all associated medical reports using this parameter.
        </p>
      </ConfirmationModal>
    </>
  );
}
