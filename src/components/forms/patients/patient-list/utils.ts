import type { Patient } from '@/lib';

// API Functions
export const fetchPatients = async (): Promise<Patient[]> => {
  try {
    const response = await fetch('/api/patients');
    const data = await response.json();
    
    if (data.success) {
      return data.patients;
    } else {
      console.error('Failed to fetch patients:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

export const deletePatient = async (patientId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'DELETE'
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};
