'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

interface ExistingReport {
  parameter_id: number;
  value: number;
}

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const editDate = searchParams.get('date');
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<ParameterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reportDate, setReportDate] = useState(editDate || new Date().toISOString().split('T')[0]);
  const [parameterValues, setParameterValues] = useState<Record<number, string>>({});
  const [existingReports, setExistingReports] = useState<ExistingReport[]>([]);

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
      if (editDate) {
        const reportsRes = await fetch(`/api/patients/${patientId}/reports`);
        const reportsData = await reportsRes.json();
        
        if (reportsData.success) {
          const dateReports = reportsData.reports.filter((report: any) => 
            report.report_date === editDate
          );
          
          const existingValues: Record<number, string> = {};
          dateReports.forEach((report: any) => {
            existingValues[report.parameter_id] = report.value.toString();
          });
          
          setParameterValues(existingValues);
          setExistingReports(dateReports.map((report: any) => ({
            parameter_id: report.parameter_id,
            value: report.value
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, editDate]);

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
      alert('Please select a report date');
      return;
    }

    const filledValues = Object.entries(parameterValues).filter(([_, value]) => value.trim() !== '');
    
    if (filledValues.length === 0) {
      alert('Please enter at least one parameter value');
      return;
    }

    setIsSubmitting(true);

    try {
      // If editing existing date, first delete all existing reports for that date
      if (editDate && existingReports.length > 0) {
        await fetch(`/api/patients/${patientId}/reports/date/${editDate}`, {
          method: 'DELETE',
        });
      }

      // Add all the new/updated reports
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
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`Failed to save ${failed.length} report(s)`);
      }

      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving reports:', error);
      alert('Failed to save reports. Please try again.');
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
            href={`/patients/${patient.id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patient Details
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editDate ? 'Edit Medical Report' : 'Add Medical Report'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {editDate ? `Editing report for ${patient.name} on ${new Date(editDate).toLocaleDateString()}` : `Adding new report for ${patient.name}`}
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
                        {categoryParameters.map((parameter) => (
                          <div key={parameter.id}>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {parameter.parameter_name}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="any"
                                value={parameterValues[parameter.id] || ''}
                                onChange={(e) => handleParameterValueChange(parameter.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-16"
                                placeholder={`${parameter.minimum}-${parameter.maximum}`}
                              />
                              <span className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
                                {parameter.unit}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Normal range: {parameter.minimum} - {parameter.maximum} {parameter.unit}
                            </p>
                          </div>
                        ))}
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
                {isSubmitting ? 'Saving...' : (editDate ? 'Update Report' : 'Save Report')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
