import type { Prescription } from '@/lib';
import type { PrescriptionFormData } from './types';

// API Functions
export const fetchPatientData = async (patientId: string) => {
  try {
    const [patientResponse, prescriptionsResponse] = await Promise.all([
      fetch(`/api/patients/${patientId}`),
      fetch(`/api/patients/${patientId}/prescriptions`)
    ]);
    
    const patientData = await patientResponse.json();
    const prescriptionsData = await prescriptionsResponse.json();
    
    return {
      patient: patientData.success ? patientData.patient : null,
      prescriptions: prescriptionsData.success ? prescriptionsData.prescriptions : [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      patient: null,
      prescriptions: [],
      error: error as Error
    };
  }
};

export const createPrescription = async (patientId: string, formData: PrescriptionFormData) => {
  const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create prescription');
  }
  
  return result.prescription;
};

export const updatePrescription = async (patientId: string, prescriptionId: number, formData: PrescriptionFormData) => {
  const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update prescription');
  }
  
  return result.prescription;
};

export const deletePrescription = async (patientId: string, prescriptionId: number) => {
  const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete prescription');
  }
  
  return result;
};

// Helper Functions
export const isPrescriptionActive = (prescription: Prescription): boolean => {
  if (!prescription.valid_till) return true; // No expiry means always active
  return new Date(prescription.valid_till) >= new Date();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTypeLabel = (type: string): string => {
  return type === 'daily_monitoring' ? 'Daily Consumption' : 'Weekly Refill';
};

export const getTypeColor = (type: string): string => {
  return type === 'daily_monitoring' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
};

// Business Logic Functions
export const handlePrescriptionSubmit = async (
  patientId: string,
  modalMode: 'create' | 'edit',
  formData: PrescriptionFormData,
  editingPrescription: Prescription | null
): Promise<Prescription> => {
  try {
    if (modalMode === 'create') {
      return await createPrescription(patientId, formData);
    } else if (modalMode === 'edit' && editingPrescription) {
      return await updatePrescription(patientId, editingPrescription.id, formData);
    } else {
      throw new Error('Invalid mode or missing prescription data');
    }
  } catch (error) {
    console.error('Error submitting prescription:', error);
    throw error; // Re-throw to show error in modal
  }
};

export const handlePrescriptionDelete = async (
  patientId: string,
  prescriptionId: number
): Promise<void> => {
  try {
    console.log('Proceeding with delete...');
    const result = await deletePrescription(patientId, prescriptionId);
    console.log('Delete response:', result);
    console.log('Prescription deleted successfully');
  } catch (error) {
    console.error('Error deleting prescription:', error);
    throw error;
  }
};

// Import/Export Functions
export const exportPrescriptions = async (patientId: string, patientName: string) => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/import-export`);
    const result = await response.json();
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `prescriptions_${patientName.replace(/\s+/g, '_')}_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to export prescriptions' 
    };
  }
};

export const exportSinglePrescription = async (patientId: string, prescriptionId: number, patientName: string) => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/import-export`);
    const result = await response.json();
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `prescription_${prescriptionId}_${patientName.replace(/\s+/g, '_')}_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to export prescription' 
    };
  }
};

export const importPrescriptions = async (
  patientId: string, 
  file: File, 
  overwriteExisting: boolean = false
) => {
  try {
    // Parse the JSON file
    const fileContent = await file.text();
    const importData = JSON.parse(fileContent);
    
    // Send to API
    const response = await fetch(`/api/patients/${patientId}/prescriptions/import-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: importData,
        overwriteExisting
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { 
      success: true, 
      results: result.results 
    };
  } catch (error) {
    console.error('Import error:', error);
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON file format' };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to import prescriptions' 
    };
  }
};
