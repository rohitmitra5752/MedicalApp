// Re-export types from common to maintain backward compatibility
export type { Patient } from '../common';
import type { Patient } from '../common';

// Form component interfaces
export interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}
