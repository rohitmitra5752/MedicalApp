export interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

export interface Parameter {
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

export interface CategoryWithParameters extends ParameterCategory {
  parameters: Parameter[];
}

export interface ParameterManagementProps {
  onDataUpdate?: () => void;
}

export interface CategoryForm {
  category_name: string;
}

export interface ParameterForm {
  parameter_name: string;
  minimum_male: string;
  maximum_male: string;
  minimum_female: string;
  maximum_female: string;
  unit: string;
  description: string;
  category_id: number;
  sort_order: string;
}
