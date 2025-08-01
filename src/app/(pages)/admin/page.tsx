'use client';

import { useState, useEffect } from 'react';
import { Modal, ConfirmationModal, SortableParameterList, BackButton, Icon, Icons } from '@/components';

interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

interface Parameter {
  id: number;
  parameter_name: string;
  minimum_male: number;
  maximum_male: number;
  minimum_female: number;
  maximum_female: number;
  unit: string;
  description: string;
  category_id: number;
  sort_order: number;
  created_at: string;
}

interface CategoryWithParameters extends ParameterCategory {
  parameters: Parameter[];
}

interface ImportResults {
  categoriesImported: number;
  parametersImported: number;
  categoriesSkipped: number;
  parametersSkipped: number;
  errors: string[];
}

interface ImportExportSectionProps {
  onDataUpdate: () => void;
}

function ImportExportSection({ onDataUpdate }: ImportExportSectionProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/import-export', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Export failed');
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResults(null);

    try {
      const fileContent = await importFile.text();
      let importData;
      
      try {
        importData = JSON.parse(fileContent);
      } catch {
        throw new Error('Invalid JSON file');
      }

      const response = await fetch('/api/import-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: importData,
          skipDuplicates,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResults(result.results);
      setImportFile(null);
      onDataUpdate(); // Refresh the admin panel data
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setError(null);
    setImportResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Export Data</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Export all parameter categories and parameters as a JSON file.
          </p>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                     text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Import Data</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Import parameter categories and parameters from a JSON file.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipDuplicates"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="skipDuplicates" className="text-sm text-gray-700 dark:text-gray-300">
                Skip duplicates (otherwise fail on duplicates)
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 
                       text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 
                      dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 
                      dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
          <h4 className="font-semibold mb-2">Import Results:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div>Categories imported: {importResults.categoriesImported}</div>
              <div>Parameters imported: {importResults.parametersImported}</div>
            </div>
            <div>
              {importResults.categoriesSkipped > 0 && (
                <div>Categories skipped: {importResults.categoriesSkipped}</div>
              )}
              {importResults.parametersSkipped > 0 && (
                <div>Parameters skipped: {importResults.parametersSkipped}</div>
              )}
            </div>
          </div>
          
          {importResults.errors.length > 0 && (
            <div className="mt-3">
              <h5 className="font-medium">Errors:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                {importResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
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
  const [categoryForm, setCategoryForm] = useState({ category_name: '' });
  const [parameterForm, setParameterForm] = useState({
    parameter_name: '',
    minimum_male: '',
    maximum_male: '',
    minimum_female: '',
    maximum_female: '',
    unit: '',
    description: '',
    category_id: 0,
    sort_order: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, parametersRes] = await Promise.all([
        fetch('/api/parameter-categories'),
        fetch('/api/parameters')
      ]);

      const [categoriesData, parametersData] = await Promise.all([
        categoriesRes.json(),
        parametersRes.json()
      ]);

      if (categoriesData.success && parametersData.success) {
        const categoriesWithParams = categoriesData.categories.map((category: ParameterCategory) => ({
          ...category,
          parameters: parametersData.parameters.filter((param: Parameter) => param.category_id === category.id)
        }));
        setCategories(categoriesWithParams);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    setCategoryForm({ category_name: '' });
    setEditingCategory(null);
    setCategoryError(''); // Clear any previous errors
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: ParameterCategory) => {
    setCategoryForm({ category_name: category.category_name });
    setEditingCategory(category);
    setCategoryError(''); // Clear any previous errors
    setShowCategoryModal(true);
  };

  const handleAddParameter = (categoryId: number) => {
    setParameterForm({
      parameter_name: '',
      minimum_male: '',
      maximum_male: '',
      minimum_female: '',
      maximum_female: '',
      unit: '',
      description: '',
      category_id: categoryId,
      sort_order: ''
    });
    setEditingParameter(null);
    setParameterError(''); // Clear any previous errors
    setShowParameterModal(true);
  };

  const handleEditParameter = (parameter: Parameter) => {
    setParameterForm({
      parameter_name: parameter.parameter_name,
      minimum_male: parameter.minimum_male.toString(),
      maximum_male: parameter.maximum_male.toString(),
      minimum_female: parameter.minimum_female.toString(),
      maximum_female: parameter.maximum_female.toString(),
      unit: parameter.unit,
      description: parameter.description,
      category_id: parameter.category_id,
      sort_order: parameter.sort_order.toString()
    });
    setEditingParameter(parameter);
    setParameterError(''); // Clear any previous errors
    setShowParameterModal(true);
  };

  const submitCategoryForm = async (e: React.FormEvent) => {
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
      const url = editingCategory
        ? `/api/parameter-categories/${editingCategory.id}`
        : '/api/parameter-categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      console.log(`Making ${method} request to ${url} with data:`, categoryForm);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      console.log('Category response received:', response.status);

      if (response.ok) {
        console.log('Category saved successfully');
        setShowCategoryModal(false);
        setCategoryError('');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Category save failed:', errorData);
        setCategoryError(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setCategoryError('Failed to save category. Please try again.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const submitParameterForm = async (e: React.FormEvent) => {
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
      const formData = {
        ...parameterForm,
        minimum_male: parseFloat(parameterForm.minimum_male),
        maximum_male: parseFloat(parameterForm.maximum_male),
        minimum_female: parseFloat(parameterForm.minimum_female),
        maximum_female: parseFloat(parameterForm.maximum_female),
        sort_order: parameterForm.sort_order ? parseInt(parameterForm.sort_order) : 0
      };

      console.log('Submitting parameter data:', formData);

      const url = editingParameter
        ? `/api/parameters/${editingParameter.id}`
        : '/api/parameters';
      const method = editingParameter ? 'PATCH' : 'POST';

      console.log(`Making ${method} request to ${url}`);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('Response received:', response.status);

      if (response.ok) {
        console.log('Parameter saved successfully, closing modal and refreshing data');
        setShowParameterModal(false);
        setParameterError('');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Parameter save failed:', errorData);
        setParameterError(errorData.error || 'Failed to save parameter');
      }
    } catch (error) {
      console.error('Error saving parameter:', error);
      setParameterError('Failed to save parameter. Please try again.');
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
      console.log(`Frontend: Attempting to delete category with ID: ${categoryToDelete.id}`);
      const response = await fetch(`/api/parameter-categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });
      console.log(`Frontend: Response status: ${response.status}`);
      
      const responseData = await response.json();
      console.log('Frontend: Response data:', responseData);
      
      if (response.ok) {
        console.log('Frontend: Category deleted successfully');
        setShowDeleteCategoryConfirm(false);
        setCategoryToDelete(null);
        fetchData();
      } else {
        console.error('Frontend: Failed to delete category:', responseData.error);
      }
    } catch (error) {
      console.error('Frontend: Error deleting category:', error);
    }
  };

  const confirmDeleteParameter = async () => {
    if (!parameterToDelete) return;

    try {
      const response = await fetch(`/api/parameters/${parameterToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setShowDeleteParameterConfirm(false);
        setParameterToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting parameter:', error);
    }
  };

  const handleParameterReorder = async (newOrder: Parameter[]) => {
    try {
      const parametersToUpdate = newOrder.map((param, index) => ({
        id: param.id,
        sort_order: index + 1
      }));

      const response = await fetch('/api/parameters/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: parametersToUpdate })
      });

      if (response.ok) {
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
      } else {
        console.error('Failed to update parameter order');
        // Optionally, you could show an error message to the user
      }
    } catch (error) {
      console.error('Error updating parameter order:', error);
    }
  };

  const handleSortOrderChange = async (parameterId: number, newSortOrder: number) => {
    try {
      const response = await fetch('/api/parameters/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          parameters: [{ id: parameterId, sort_order: newSortOrder }] 
        })
      });

      if (response.ok) {
        // Refresh data to get updated sort order
        fetchData();
      } else {
        console.error('Failed to update parameter sort order');
      }
    } catch (error) {
      console.error('Error updating parameter sort order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <BackButton href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
              Back to Home
            </BackButton>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Administration Panel
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Manage medical parameter categories, parameters, and system settings
            </p>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
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
                    onClick={() => toggleCategory(category.id)}
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

          {/* Future Admin Sections Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Icon name={Icons.INFO} size="lg" className="mr-3 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">System Settings</h2>
            </div>
            
            <ImportExportSection onDataUpdate={fetchData} />
          </div>
        </div>

        {/* Category Modal */}
        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setCategoryError(''); // Clear errors when closing
          }}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
        >
          <form onSubmit={submitCategoryForm}>
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
            {categoryError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
                <div className="flex items-start">
                  <Icon name={Icons.ERROR} size="sm" className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>{categoryError}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryError(''); // Clear errors when canceling
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingCategory}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmittingCategory ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Parameter Modal */}
        <Modal
          isOpen={showParameterModal}
          onClose={() => {
            setShowParameterModal(false);
            setParameterError(''); // Clear errors when closing
          }}
          title={editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={submitParameterForm}>
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
            {parameterError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
                <div className="flex items-start">
                  <Icon name={Icons.ERROR} size="sm" className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>{parameterError}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowParameterModal(false);
                  setParameterError(''); // Clear errors when canceling
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingParameter}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmittingParameter ? 'Saving...' : (editingParameter ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </Modal>

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
      </div>
    </div>
  );
}
