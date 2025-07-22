'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  created_at: string;
}

interface Parameter {
  id: number;
  parameter_name: string;
  minimum: number;
  maximum: number;
  unit: string;
  description: string;
  category_id: number;
  created_at: string;
}

interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

export default function AddReportPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<ParameterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [parameterValues, setParameterValues] = useState<Record<number, string>>({});

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty parameter values
      const reportsToCreate = Object.entries(parameterValues)
        .filter(([_, value]) => value.trim() !== '')
        .map(([parameterId, value]) => ({
          patient_id: parseInt(patientId),
          parameter_id: parseInt(parameterId),
          value: parseFloat(value),
          report_date: reportDate
        }));

      if (reportsToCreate.length === 0) {
        alert('Please enter at least one parameter value');
        setIsSubmitting(false);
        return;
      }

      // Create reports in parallel
      const responses = await Promise.all(
        reportsToCreate.map(report =>
          fetch('/api/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(report)
          })
        )
      );

      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        router.push(`/patients/${patientId}`);
      } else {
        console.error('Failed to create some reports');
        alert('Failed to create some reports. Please try again.');
      }
    } catch (error) {
      console.error('Error creating reports:', error);
      alert('An error occurred while creating reports. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParameterValueChange = (parameterId: number, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
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
            <Link href="/patients" className="text-blue-600 hover:text-blue-800">
              Back to Patients
            </Link>
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
          <Link 
            href={`/patients/${patientId}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {patient.name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Add Medical Report
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add a new medical measurement for {patient.name}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">
                          {category.category_name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryParameters.map((parameter) => (
                            <div key={parameter.id} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                                {parameter.parameter_name}
                                <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                                  ({parameter.unit})
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={parameterValues[parameter.id] || ''}
                                  onChange={(e) => handleParameterValueChange(parameter.id, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12"
                                  placeholder={`${parameter.minimum}-${parameter.maximum}`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    {parameter.unit}
                                  </span>
                                </div>
                              </div>
                              {parameter.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {parameter.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Normal range: {parameter.minimum} - {parameter.maximum} {parameter.unit}
                              </p>
                              
                              {/* Visual indicator for out-of-range values */}
                              {parameterValues[parameter.id] && (
                                (() => {
                                  const value = parseFloat(parameterValues[parameter.id]);
                                  if (isNaN(value)) return null;
                                  
                                  const isOutOfRange = value < parameter.minimum || value > parameter.maximum;
                                  
                                  if (isOutOfRange) {
                                    return (
                                      <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Value outside normal range
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Within normal range
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <Link
                href={`/patients/${patientId}`}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Reports...
                  </>
                ) : (
                  'Create Reports'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
