import { parsePhoneNumber, formatDate } from '@/lib/utils';
import type { Patient, ReportWithCategory } from '@/lib';
import type { 
  CategoryData,
  ImportResults,
  PatientForm 
} from './types';

// Default patient form values
export const defaultPatientForm: PatientForm = {
  name: '',
  phone_number: '',
  medical_id_number: '',
  country_code: '+91',
  gender: 'male',
  is_taking_medicines: false
};

// Patient Data API Functions
export const fetchPatientData = async (patientId: string): Promise<Patient | null> => {
  try {
    const response = await fetch(`/api/patients/${patientId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.patient;
    } else {
      console.error('Failed to fetch patient:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

export const fetchPatientReports = async (patientId: string): Promise<ReportWithCategory[]> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/reports`);
    const data = await response.json();
    
    if (data.success) {
      return data.reports;
    } else {
      console.error('Failed to fetch reports:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

// Report Processing Functions
export const processReportsIntoCategories = (reports: ReportWithCategory[]): CategoryData[] => {
  const categoryMap = new Map<string, CategoryData>();
  
  reports.forEach(report => {
    if (!categoryMap.has(report.category_name)) {
      categoryMap.set(report.category_name, {
        categoryName: report.category_name,
        parameters: [],
        reports: []
      });
    }
    
    const categoryData = categoryMap.get(report.category_name)!;
    categoryData.reports.push(report);
    
    if (!categoryData.parameters.includes(report.parameter_name)) {
      categoryData.parameters.push(report.parameter_name);
    }
  });

  // Sort parameters within each category by sort_order, then alphabetically
  categoryMap.forEach(categoryData => {
    categoryData.parameters.sort((a, b) => {
      // Find the sort_order for each parameter
      const paramA = reports.find(r => r.parameter_name === a);
      const paramB = reports.find(r => r.parameter_name === b);
      
      const sortOrderA = paramA?.parameter_sort_order ?? 0;
      const sortOrderB = paramB?.parameter_sort_order ?? 0;
      
      // Sort by sort_order first, then alphabetically if sort_order is the same
      if (sortOrderA !== sortOrderB) {
        return sortOrderA - sortOrderB;
      }
      return a.localeCompare(b);
    });
  });

  return Array.from(categoryMap.values()).sort((a, b) => 
    a.categoryName.localeCompare(b.categoryName)
  );
};

export const getAllDates = (reports: ReportWithCategory[]): string[] => {
  const dates = [...new Set(reports.map(r => r.report_date))].sort().reverse();
  return dates;
};

export const getCategoriesForDate = (reports: ReportWithCategory[], date: string): string[] => {
  const dateReports = reports.filter(r => r.report_date === date);
  const categories = [...new Set(dateReports.map(r => r.category_name))].sort();
  return categories;
};

export const getParametersForDateAndCategory = (
  reports: ReportWithCategory[], 
  date: string, 
  categoryName: string
) => {
  const dateReports = reports.filter(r => 
    r.report_date === date && r.category_name === categoryName
  );
  return dateReports.map(report => ({
    parameter_name: report.parameter_name,
    value: report.value,
    unit: report.unit,
    minimum: report.parameter_minimum,
    maximum: report.parameter_maximum,
    isOutOfRange: report.value < report.parameter_minimum || report.value > report.parameter_maximum
  }));
};

// Patient Form Functions
export const initializePatientForm = (patient: Patient): PatientForm => {
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

export const validatePatientForm = (form: PatientForm): { isValid: boolean; error?: string } => {
  if (!form.gender) {
    return { isValid: false, error: 'Please select a gender' };
  }
  
  return { isValid: true };
};

export const savePatient = async (
  patientId: string, 
  form: PatientForm
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name.trim(),
        phone_number: `${form.country_code} ${form.phone_number}`.trim(),
        medical_id_number: form.medical_id_number.trim(),
        gender: form.gender,
        is_taking_medicines: form.is_taking_medicines
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update patient' };
    }
  } catch {
    return { success: false, error: 'Network error occurred' };
  }
};

// Report Management Functions
export const deleteReportsByDate = async (
  patientId: string, 
  date: string
): Promise<{ success: boolean; deletedCount?: number; error?: string }> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/reports/date/${date}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, deletedCount: result.deletedCount };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error deleting reports:', error);
    return { success: false, error: 'Failed to delete reports. Please try again.' };
  }
};

// Import/Export Functions
export const exportPatientData = async (
  patientId: string, 
  patientName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/import-export`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to export patient data');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Export failed');
    }

    // Create and download the file
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName.replace(/\s+/g, '_')}-reports-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Export failed' 
    };
  }
};

export const importPatientData = async (
  patientId: string,
  file: File,
  overwriteExisting: boolean
): Promise<{ success: boolean; results?: ImportResults; error?: string }> => {
  try {
    const fileContent = await file.text();
    let importData;
    
    try {
      importData = JSON.parse(fileContent);
    } catch {
      throw new Error('Invalid JSON file');
    }

    const response = await fetch(`/api/patients/${patientId}/import-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: importData,
        overwriteExisting,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Import failed');
    }

    return { success: true, results: result.results };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Import failed' 
    };
  }
};

// Navigation Functions
export const getEditReportUrl = (patientId: string, date: string): string => {
  return `/patients/${patientId}/report?mode=edit&date=${date}`;
};

export const getAddReportUrl = (patientId: number): string => {
  return `/patients/${patientId}/report?mode=add`;
};

export const getMedicinesUrl = (patientId: number): string => {
  return `/patients/${patientId}/medicines`;
};

// Alert Helper Functions
export const createSuccessAlert = (message: string) => ({
  title: 'Success',
  message,
  type: 'success' as const
});

export const createErrorAlert = (message: string) => ({
  title: 'Error',
  message,
  type: 'error' as const
});

export const createValidationErrorAlert = (message: string) => ({
  title: 'Validation Error',
  message,
  type: 'error' as const
});

// Format helper function
export const formatDeleteSuccessMessage = (deletedCount: number, date: string): string => {
  return `Successfully deleted ${deletedCount} report(s) for ${formatDate(date)}`;
};
