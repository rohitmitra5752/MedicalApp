import { parsePhoneNumber } from '@/lib/utils';
import { Patient, PatientFormData } from './types';

// API Functions for Patient Modal
export const savePatient = async (
  patientForm: PatientFormData,
  editingPatient: Patient | null
): Promise<boolean> => {
  try {
    const url = editingPatient
      ? `/api/patients/${editingPatient.id}`
      : '/api/patients';
    const method = editingPatient ? 'PATCH' : 'POST';

    // Combine country code with phone number
    const formData = {
      name: patientForm.name,
      phone_number: `${patientForm.country_code} ${patientForm.phone_number}`,
      medical_id_number: patientForm.medical_id_number,
      gender: patientForm.gender,
      is_taking_medicines: patientForm.is_taking_medicines
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving patient:', error);
    return false;
  }
};

// Form Helper Functions
export const createEmptyPatientForm = (): PatientFormData => ({
  name: '',
  phone_number: '',
  medical_id_number: '',
  country_code: '+91', // Default to India
  gender: 'male',
  is_taking_medicines: false
});

export const createPatientFormFromPatient = (patient: Patient): PatientFormData => {
  // Parse existing phone number to separate country code and number
  const parsed = parsePhoneNumber(patient.phone_number);
  
  return {
    name: patient.name,
    phone_number: parsed.number,
    medical_id_number: patient.medical_id_number,
    country_code: parsed.countryCode,
    gender: patient.gender,
    is_taking_medicines: patient.is_taking_medicines
  };
};
