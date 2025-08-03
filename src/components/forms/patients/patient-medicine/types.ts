export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string | null;
  created_at: string;
  updated_at: string;
}

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
