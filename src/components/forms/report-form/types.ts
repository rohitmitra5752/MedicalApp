export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
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

export interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

export interface ReportFormProps {
  patientId: string;
  editDate?: string;
  mode: 'add' | 'edit';
}
