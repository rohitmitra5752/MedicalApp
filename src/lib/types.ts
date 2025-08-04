// Core database entity interfaces
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

export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  patient_id: number;
  parameter_id: number;
  value: number;
  report_date: string;
  created_at: string;
}

export interface ReportWithDetails extends Report {
  patient_name: string;
  parameter_name: string;
  unit: string;
}

export interface Medicine {
  id: number;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  tablets_per_sheet: number;
  additional_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineSheet {
  id: number;
  medicine_id: number;
  expiry_date: string;
  consumed_tablets: number;
  is_in_use: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineWithInventory extends Medicine {
  sheets: MedicineSheet[];
  total_sheets: number;
  sheets_in_use: number;
  available_tablets: number;
  expired_sheets: number;
}

export interface Prescription {
  id: number;
  patient_id: number;
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicine {
  id: number;
  prescription_id: number;
  medicine_id: number;
  morning_count: number;
  afternoon_count: number;
  evening_count: number;
  recurrence_type: 'daily' | 'weekly' | 'interval';
  recurrence_interval: number;
  recurrence_day_of_week: number | null; // 0=Sunday, 1=Monday, ..., 6=Saturday
  last_executed_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionWithDetails extends Prescription {
  patient_name: string;
  medicines: PrescriptionMedicineWithDetails[];
}

export interface PrescriptionMedicineWithDetails extends PrescriptionMedicine {
  medicine_name: string;
  medicine_strength: string | null;
  medicine_generic_name: string | null;
}

// Medicine instruction interfaces for frontend display
export interface MedicineInstruction {
  medicine_id: number;
  medicine_name: string;
  medicine_strength: string | null;
  morning_count: number;
  afternoon_count: number;
  evening_count: number;
  total_tablets: number;
  timing: string[];
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  prescription_id: number;
  prescription_medicine_id: number;
}

export interface PrescriptionInstructions {
  patient_id: number;
  instructions: MedicineInstruction[];
  has_instructions: boolean;
}

// Additional report interfaces
export interface ReportWithCategory extends Report {
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
