// Base interface for all patient-related data
interface PatientBase {
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
}

// Patient entity with database ID
export interface Patient extends PatientBase {
  id: number;
  created_at: string;
}

// Form data for patient creation/editing
export interface PatientFormData extends PatientBase {
  country_code: string; // Additional field for form handling
}

export interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
  onSave: () => void; // Callback when save is successful
}

// Form component interfaces
export interface SexSelectorProps {
  value: 'male' | 'female' | '';
  onChange: (sex: 'male' | 'female') => void;
  className?: string;
}

export interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export interface FlagIconProps {
  countryCode: string;
  className?: string;
}
