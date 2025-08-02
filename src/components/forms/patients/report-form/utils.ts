import type { Patient, Parameter } from './types';

// Helper functions to get sex-specific ranges
export const getParameterMinimum = (parameter: Parameter, patient: Patient | null): number => {
  if (!patient) return 0;
  return patient.gender === 'male' ? parameter.minimum_male : parameter.minimum_female;
};

export const getParameterMaximum = (parameter: Parameter, patient: Patient | null): number => {
  if (!patient) return 0;
  return patient.gender === 'male' ? parameter.maximum_male : parameter.maximum_female;
};

// Data fetching utilities
export const fetchPatientData = async (patientId: string) => {
  const response = await fetch(`/api/patients/${patientId}`);
  return response.json();
};

export const fetchParametersData = async () => {
  const response = await fetch('/api/parameters');
  return response.json();
};

export const fetchCategoriesData = async () => {
  const response = await fetch('/api/parameter-categories');
  return response.json();
};

export const fetchExistingReports = async (patientId: string, editDate: string) => {
  const response = await fetch(`/api/patients/${patientId}/reports`);
  const data = await response.json();
  
  if (data.success) {
    const dateReports = data.reports.filter((report: { report_date: string }) => 
      report.report_date === editDate
    );
    
    const existingValues: Record<number, string> = {};
    const existingIds: Record<number, number> = {};
    
    dateReports.forEach((report: { parameter_id: number; value: number; id: number }) => {
      existingValues[report.parameter_id] = report.value.toString();
      existingIds[report.parameter_id] = report.id;
    });
    
    return { existingValues, existingIds };
  }
  
  return { existingValues: {}, existingIds: {} };
};

// Form validation utilities
export const validateReportForm = (reportDate: string, parameterValues: Record<number, string>) => {
  if (!reportDate) {
    return { isValid: false as const, error: 'Please select a report date' };
  }

  const filledValues = Object.entries(parameterValues).filter(([, value]) => value.trim() !== '');
  
  if (filledValues.length === 0) {
    return { isValid: false as const, error: 'Please enter at least one parameter value' };
  }

  return { isValid: true as const, filledValues };
};

// Report submission utilities
export const deleteExistingReports = async (patientId: string, editDate: string) => {
  return fetch(`/api/patients/${patientId}/reports/date/${editDate}`, {
    method: 'DELETE',
  });
};

export const createReportEntry = async (
  patientId: string,
  parameterId: string,
  value: string,
  reportDate: string
) => {
  return fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient_id: parseInt(patientId),
      parameter_id: parseInt(parameterId),
      value: parseFloat(value),
      report_date: reportDate,
    }),
  });
};

export const processReportSubmission = async (
  patientId: string,
  reportDate: string,
  parameterValues: Record<number, string>,
  mode: 'add' | 'edit',
  editDate?: string,
  existingReportIds?: Record<number, number>
) => {
  const validation = validateReportForm(reportDate, parameterValues);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const filledValues = validation.filledValues;

  // If editing existing date, first delete all existing reports for that date
  if (mode === 'edit' && editDate && existingReportIds && Object.keys(existingReportIds).length > 0) {
    await deleteExistingReports(patientId, editDate);
  }

  // Create all the new/updated reports
  const reportPromises = filledValues.map(([parameterId, value]) => 
    createReportEntry(patientId, parameterId, value, reportDate)
  );

  const results = await Promise.all(reportPromises);
  
  // Check for any failed requests and extract error messages
  const failedResponses = [];
  for (let i = 0; i < results.length; i++) {
    if (!results[i].ok) {
      const errorData = await results[i].json();
      failedResponses.push({
        parameterId: filledValues[i][0],
        error: errorData.error || 'Unknown error'
      });
    }
  }
  
  if (failedResponses.length > 0) {
    // Check if any errors are about duplicate reports
    const duplicateErrors = failedResponses.filter(f => 
      f.error.includes('A report for this date already exists')
    );
    
    if (duplicateErrors.length > 0) {
      throw new Error(`A report for the date ${reportDate} already exists. Please choose a different date or edit the existing report.`);
    } else {
      throw new Error(`Failed to save ${failedResponses.length} report(s): ${failedResponses.map(f => f.error).join(', ')}`);
    }
  }

  return true;
};

// Value validation utilities
export const isValueOutOfRange = (
  value: string,
  parameter: Parameter,
  patient: Patient | null
): boolean => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return false;
  
  const min = getParameterMinimum(parameter, patient);
  const max = getParameterMaximum(parameter, patient);
  
  return numValue < min || numValue > max;
};
