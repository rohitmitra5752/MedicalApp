import type { Patient } from '@/lib';

// Form component interfaces
export interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}
