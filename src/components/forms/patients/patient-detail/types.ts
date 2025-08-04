import type { ReportWithCategory } from '@/lib';

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

// Form component interfaces
export interface DateReportCardProps {
  date: string;
  categories: string[];
  getParametersForDateAndCategory: (date: string, categoryName: string) => Array<{
    parameter_name: string;
    value: number;
    unit: string;
    minimum: number;
    maximum: number;
    isOutOfRange: boolean;
  }>;
  formatDate: (date: string) => string;
  patientId: string;
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
}

export interface MedicineInstructionsProps {
  patientId: number;
}

export interface ParameterChartProps {
  reports: ReportWithCategory[];
}

export interface ParameterOption {
  value: string;
  label: string;
  unit: string;
  minimum: number;
  maximum: number;
  isAbnormal: boolean;
}
