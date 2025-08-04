import type { Prescription } from '@/lib';

export interface PrescriptionFormData {
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string;
}

export interface PatientMedicinePageContentProps {
  patientId: string;
}

export interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrescriptionFormData) => void;
  patientName: string;
  prescriptionData?: Prescription | null;
  mode: 'create' | 'edit';
}

export interface PrescriptionCardProps {
  prescription: Prescription;
  patientId: string;
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescription: Prescription) => void;
}
