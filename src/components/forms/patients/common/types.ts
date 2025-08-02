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
