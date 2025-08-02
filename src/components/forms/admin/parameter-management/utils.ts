import { ParameterCategory, Parameter, CategoryWithParameters, CategoryForm, ParameterForm } from './types';

export const fetchData = async (): Promise<CategoryWithParameters[]> => {
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
    return categoriesWithParams;
  }
  
  throw new Error('Failed to fetch data');
};

export const submitCategoryForm = async (
  categoryForm: CategoryForm,
  editingCategory: ParameterCategory | null
): Promise<void> => {
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

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Category save failed:', errorData);
    throw new Error(errorData.error || 'Failed to save category');
  }

  console.log('Category saved successfully');
};

export const submitParameterForm = async (
  parameterForm: ParameterForm,
  editingParameter: Parameter | null
): Promise<void> => {
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

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Parameter save failed:', errorData);
    throw new Error(errorData.error || 'Failed to save parameter');
  }

  console.log('Parameter saved successfully, closing modal and refreshing data');
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  console.log(`Frontend: Attempting to delete category with ID: ${categoryId}`);
  const response = await fetch(`/api/parameter-categories/${categoryId}`, {
    method: 'DELETE'
  });
  console.log(`Frontend: Response status: ${response.status}`);
  
  const responseData = await response.json();
  console.log('Frontend: Response data:', responseData);
  
  if (!response.ok) {
    console.error('Frontend: Failed to delete category:', responseData.error);
    throw new Error(responseData.error || 'Failed to delete category');
  }

  console.log('Frontend: Category deleted successfully');
};

export const deleteParameter = async (parameterId: number): Promise<void> => {
  const response = await fetch(`/api/parameters/${parameterId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete parameter');
  }
};

export const reorderParameters = async (newOrder: Parameter[]): Promise<void> => {
  const parametersToUpdate = newOrder.map((param, index) => ({
    id: param.id,
    sort_order: index + 1
  }));

  const response = await fetch('/api/parameters/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parameters: parametersToUpdate })
  });

  if (!response.ok) {
    console.error('Failed to update parameter order');
    throw new Error('Failed to update parameter order');
  }
};

export const updateParameterSortOrder = async (parameterId: number, newSortOrder: number): Promise<void> => {
  const response = await fetch('/api/parameters/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      parameters: [{ id: parameterId, sort_order: newSortOrder }] 
    })
  });

  if (!response.ok) {
    console.error('Failed to update parameter sort order');
    throw new Error('Failed to update parameter sort order');
  }
};

export const toggleCategoryExpansion = (
  categoryId: number,
  expandedCategories: Set<number>
): Set<number> => {
  const newExpanded = new Set(expandedCategories);
  if (newExpanded.has(categoryId)) {
    newExpanded.delete(categoryId);
  } else {
    newExpanded.add(categoryId);
  }
  return newExpanded;
};

export const initializeCategoryForm = (): CategoryForm => ({
  category_name: ''
});

export const initializeParameterForm = (categoryId: number): ParameterForm => ({
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

export const populateCategoryForm = (category: ParameterCategory): CategoryForm => ({
  category_name: category.category_name
});

export const populateParameterForm = (parameter: Parameter): ParameterForm => ({
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
