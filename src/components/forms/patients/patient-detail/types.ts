export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

export interface ReportWithCategory {
  id: number;
  patient_id: number;
  parameter_id: number;
  value: number;
  report_date: string;
  created_at: string;
  patient_name: string;
  parameter_name: string;
  unit: string;
  parameter_minimum: number;
  parameter_maximum: number;
  parameter_description: string;
  category_id: number;
  category_name: string;
  parameter_sort_order: number;
}

export interface CategoryData {
  categoryName: string;
  parameters: string[];
  reports: ReportWithCategory[];
}

export interface ImportResults {
  reportsImported: number;
  reportsUpdated: number;
  reportsSkipped: number;
  errors: string[];
}

export interface PatientImportExportProps {
  patientId: string;
  patientName: string;
  onDataUpdate: () => void;
}

export interface PatientForm {
  name: string;
  phone_number: string;
  medical_id_number: string;
  country_code: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
}

export interface PatientDetailContentProps {
  patientId: string;
}
