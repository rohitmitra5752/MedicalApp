'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertModal, BackButton, Icon, Icons } from './';
import { formatDate } from '@/lib/utils';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  created_at: string;
}

interface Parameter {
  id: number;
  parameter_name: string;
  minimum_male: number;
  maximum_male: number;
  minimum_female: number;
  maximum_female: number;
  unit: string;
  description: string;
  category_id: number;
  sort_order: number;
  created_at: string;
}

interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

interface ReportFormProps {
  patientId: string;
  editDate?: string;
  mode: 'add' | 'edit';
}

export default function ReportForm({ patientId, editDate, mode }: ReportFormProps) {
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<ParameterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reportDate, setReportDate] = useState(editDate || new Date().toISOString().split('T')[0]);
  const [parameterValues, setParameterValues] = useState<Record<number, string>>({});

  // Helper functions to get sex-specific ranges
  const getParameterMinimum = (parameter: Parameter) => {
    if (!patient) return 0;
    return patient.gender === 'male' ? parameter.minimum_male : parameter.minimum_female;
  };

  const getParameterMaximum = (parameter: Parameter) => {
    if (!patient) return 0;
    return patient.gender === 'male' ? parameter.maximum_male : parameter.maximum_female;
  };
  const [existingReportIds, setExistingReportIds] = useState<Record<number, number>>({});

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [patientRes, parametersRes, categoriesRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`),
        fetch('/api/parameters'),
        fetch('/api/parameter-categories')
      ]);

      const [patientData, parametersData, categoriesData] = await Promise.all([
        patientRes.json(),
        parametersRes.json(),
        categoriesRes.json()
      ]);

      if (patientData.success) {
        setPatient(patientData.patient);
      }
      if (parametersData.success) {
        setParameters(parametersData.parameters);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      // If editing an existing date, fetch existing reports
      if (mode === 'edit' && editDate) {
        const reportsRes = await fetch(`/api/patients/${patientId}/reports`);
        const reportsData = await reportsRes.json();
        
        if (reportsData.success) {
          const dateReports = reportsData.reports.filter((report: { report_date: string }) => 
            report.report_date === editDate
          );
          
          const existingValues: Record<number, string> = {};
          const existingIds: Record<number, number> = {};
          
          dateReports.forEach((report: { parameter_id: number; value: number; id: number }) => {
            existingValues[report.parameter_id] = report.value.toString();
            existingIds[report.parameter_id] = report.id;
          });
          
          setParameterValues(existingValues);
          setExistingReportIds(existingIds);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, editDate, mode]);

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId, fetchData]);

  const handleParameterValueChange = (parameterId: number, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportDate) {
      setErrorMessage('Please select a report date');
      setShowErrorModal(true);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const filledValues = Object.entries(parameterValues).filter(([_key, value]) => value.trim() !== '');
    
    if (filledValues.length === 0) {
      setErrorMessage('Please enter at least one parameter value');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // If editing existing date, first delete all existing reports for that date
      if (mode === 'edit' && editDate && Object.keys(existingReportIds).length > 0) {
        await fetch(`/api/patients/${patientId}/reports/date/${editDate}`, {
          method: 'DELETE',
        });
      }

      // Create all the new/updated reports
      const reportPromises = filledValues.map(([parameterId, value]) => 
        fetch('/api/reports', {
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
        })
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
          setErrorMessage(`A report for the date ${reportDate} already exists. Please choose a different date or edit the existing report.`);
          setShowErrorModal(true);
        } else {
          setErrorMessage(`Failed to save ${failedResponses.length} report(s): ${failedResponses.map(f => f.error).join(', ')}`);
          setShowErrorModal(true);
        }
        return;
      }

      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving reports:', error);
      setErrorMessage('Failed to save reports. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Patient Not Found</h1>
            <BackButton href="/patients">Back to Patients</BackButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton href={`/patients/${patient.id}`}>Back to Patient Details</BackButton>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <Icon name={Icons.DOCUMENT} size="xl" className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {mode === 'edit' ? 'Edit Medical Report' : 'Add Medical Report'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {mode === 'edit' 
                    ? `Editing report for ${patient.name} on ${formatDate(editDate!)}` 
                    : `Adding new report for ${patient.name}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Parameters by Category */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Medical Parameters
              </h3>
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryParameters = parameters.filter(param => param.category_id === category.id);
                  if (categoryParameters.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {category.category_name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryParameters.map((parameter) => {
                          const hasExistingValue = existingReportIds[parameter.id];
                          return (
                            <div key={parameter.id}>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {parameter.parameter_name}
                                {hasExistingValue && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                    existing
                                  </span>
                                )}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={parameterValues[parameter.id] || ''}
                                  onChange={(e) => handleParameterValueChange(parameter.id, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-16"
                                  placeholder={`${getParameterMinimum(parameter)}-${getParameterMaximum(parameter)}`}
                                />
                                <span className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
                                  {parameter.unit}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Normal range: {getParameterMinimum(parameter)} - {getParameterMaximum(parameter)} {parameter.unit}
                              </p>
                              
                              {/* Visual indicator for out-of-range values */}
                              {parameterValues[parameter.id] && (
                                (() => {
                                  const value = parseFloat(parameterValues[parameter.id]);
                                  if (isNaN(value)) return null;
                                  
                                  const isOutOfRange = value < getParameterMinimum(parameter) || value > getParameterMaximum(parameter);
                                  
                                  if (isOutOfRange) {
                                    return (
                                      <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        <Icon name={Icons.WARNING_TRIANGLE} size="xs" className="mr-1" />
                                        Value outside normal range
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                                      <Icon name={Icons.SUCCESS_CIRCLE} size="xs" className="mr-1" />
                                      Within normal range
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/patients/${patient.id}`}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Report' : 'Save Report')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        type="error"
      />
    </div>
  );
}
