import type { Patient, Parameter } from '@/lib';

export interface ReportFormProps {
  patientId: string;
  editDate?: string;
  mode: 'add' | 'edit';
}

export interface ParameterInputCardProps {
  parameter: Parameter;
  patient: Patient | null;
  value: string;
  hasExistingValue: boolean;
  onChange: (parameterId: number, value: string) => void;
}
