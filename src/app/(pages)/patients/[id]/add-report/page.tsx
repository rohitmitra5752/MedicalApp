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
  
  const [reportForm, setReportForm] = useState({
    parameter_id: '',
    value: '',
    report_date: new Date().toISOString().split('T')[0] // Today's date
  });

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
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          parameter_id: parseInt(reportForm.parameter_id),
          value: parseFloat(reportForm.value),
          report_date: reportForm.report_date
        })
      });

      if (response.ok) {
        router.push(`/patients/${patientId}`);
      } else {
        console.error('Failed to create report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParameterById = (id: string) => {
    return parameters.find(p => p.id === parseInt(id));
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parameter
                </label>
                <select
                  value={reportForm.parameter_id}
                  onChange={(e) => setReportForm({ ...reportForm, parameter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a parameter</option>
                  {categories.map((category) => (
                    <optgroup key={category.id} label={category.category_name}>
                      {parameters
                        .filter(param => param.category_id === category.id)
                        .map((param) => (
                          <option key={param.id} value={param.id}>
                            {param.parameter_name} ({param.unit})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {reportForm.parameter_id && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  {(() => {
                    const selectedParam = getParameterById(reportForm.parameter_id);
                    if (!selectedParam) return null;
                    
                    return (
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          {selectedParam.parameter_name}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          {selectedParam.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Normal range: {selectedParam.minimum} - {selectedParam.maximum} {selectedParam.unit}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={reportForm.value}
                    onChange={(e) => setReportForm({ ...reportForm, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                  {reportForm.parameter_id && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        {getParameterById(reportForm.parameter_id)?.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Date
                </label>
                <input
                  type="date"
                  value={reportForm.report_date}
                  onChange={(e) => setReportForm({ ...reportForm, report_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
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
                    Creating...
                  </>
                ) : (
                  'Create Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
