'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertModal, BackButton, Icon, Icons } from '@/components';
import { formatDate } from '@/lib/utils';
import type { Patient, Parameter, ParameterCategory } from '@/lib';
import type { ReportFormProps } from './types';
import {
  fetchPatientData,
  fetchParametersData,
  fetchCategoriesData,
  fetchExistingReports,
  processReportSubmission
} from './utils';
import { ParameterInputCard } from './form-components';

export default function ReportForm({ patientId, editDate, mode }: ReportFormProps) {
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<ParameterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reportDate, setReportDate] = useState(editDate || new Date().toISOString().split('T')[0]);
  const [parameterValues, setParameterValues] = useState<Record<number, string>>({});
  const [existingReportIds, setExistingReportIds] = useState<Record<number, number>>({});

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [patientData, parametersData, categoriesData] = await Promise.all([
        fetchPatientData(patientId),
        fetchParametersData(),
        fetchCategoriesData()
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
        const { existingValues, existingIds } = await fetchExistingReports(patientId, editDate);
        setParameterValues(existingValues);
        setExistingReportIds(existingIds);
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
    setIsSubmitting(true);

    try {
      await processReportSubmission(
        patientId,
        reportDate,
        parameterValues,
        mode,
        editDate,
        existingReportIds
      );
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving reports:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save reports. Please try again.');
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
                            <ParameterInputCard
                              key={parameter.id}
                              parameter={parameter}
                              patient={patient}
                              value={parameterValues[parameter.id] || ''}
                              hasExistingValue={!!hasExistingValue}
                              onChange={handleParameterValueChange}
                            />
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
