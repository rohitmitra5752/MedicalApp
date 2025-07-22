'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DateReportCard from '@/components/DateReportCard';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { AlertModal } from '@/components/AlertModal';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  created_at: string;
}

interface ReportWithCategory {
  id: number;
  patient_id: number;
  parameter_id: number;
  value: number;
  report_date: string;
  created_at: string;
  patient_name: string;
  parameter_name: string;
  unit: string;
  parameter_minimum: number;
  parameter_maximum: number;
  parameter_description: string;
  category_id: number;
  category_name: string;
}

interface CategoryData {
  categoryName: string;
  parameters: string[];
  reports: ReportWithCategory[];
}

interface ImportResults {
  reportsImported: number;
  reportsUpdated: number;
  reportsSkipped: number;
  errors: string[];
}

interface PatientImportExportProps {
  patientId: string;
  patientName: string;
  onDataUpdate: () => void;
}

function PatientImportExport({ patientId, patientName, onDataUpdate }: PatientImportExportProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
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
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResults(null);

    try {
      const fileContent = await importFile.text();
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

      setImportResults(result.results);
      setImportFile(null);
      setShowModal(false);
      onDataUpdate(); // Refresh patient data
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setError(null);
    setImportResults(null);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Import
        </button>
      </div>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Import Patient Reports
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="overwriteExisting"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="overwriteExisting" className="text-sm text-gray-700 dark:text-gray-300">
                  Overwrite existing reports (otherwise skip duplicates)
                </label>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 
                              dark:border-red-600 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 
                           text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Import Results
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reports imported:</span>
                <span className="font-medium">{importResults.reportsImported}</span>
              </div>
              <div className="flex justify-between">
                <span>Reports updated:</span>
                <span className="font-medium">{importResults.reportsUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span>Reports skipped:</span>
                <span className="font-medium">{importResults.reportsSkipped}</span>
              </div>
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Errors:</h4>
                <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg max-h-32 overflow-y-auto">
                  <ul className="text-sm text-red-700 dark:text-red-200 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setImportResults(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<ReportWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDate, setDeleteDate] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [alertTitle, setAlertTitle] = useState('');

  const fetchPatientData = useCallback(async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setPatient(data.patient);
      } else {
        console.error('Failed to fetch patient:', data.error);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  }, [patientId]);

  const fetchPatientReports = useCallback(async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/reports`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        console.error('Failed to fetch reports:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  const processReportsIntoCategories = useCallback(() => {
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

    // Sort parameters within each category
    categoryMap.forEach(categoryData => {
      categoryData.parameters.sort();
    });

    const categoriesArray = Array.from(categoryMap.values()).sort((a, b) => 
      a.categoryName.localeCompare(b.categoryName)
    );
    
    setCategories(categoriesArray);
    
    if (categoriesArray.length > 0 && !activeTab) {
      setActiveTab(categoriesArray[0].categoryName);
    }
  }, [reports, activeTab]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchPatientReports();
    }
  }, [patientId, fetchPatientData, fetchPatientReports]);

  useEffect(() => {
    if (reports.length > 0) {
      processReportsIntoCategories();
    }
  }, [reports, processReportsIntoCategories]);

  const getAllDates = () => {
    const dates = [...new Set(reports.map(r => r.report_date))].sort().reverse();
    return dates;
  };

  const getCategoriesForDate = (date: string) => {
    const dateReports = reports.filter(r => r.report_date === date);
    const categories = [...new Set(dateReports.map(r => r.category_name))].sort();
    return categories;
  };

  const getParametersForDateAndCategory = (date: string, categoryName: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper functions for modals
  const showAlertModal = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const handleDeleteReportClick = (date: string) => {
    setDeleteDate(date);
    setShowDeleteConfirm(true);
  };

  const handleEditReport = (date: string) => {
    router.push(`/patients/${patientId}/edit-report?date=${date}`);
  };

  const handleDeleteReport = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/reports/date/${deleteDate}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the reports data
        fetchPatientReports();
        showAlertModal(
          'Success', 
          `Successfully deleted ${result.deletedCount} report(s) for ${formatDate(deleteDate)}`, 
          'success'
        );
      } else {
        showAlertModal('Error', `Failed to delete reports: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting reports:', error);
      showAlertModal('Error', 'Failed to delete reports. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteDate('');
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
            href="/patients"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patients
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {patient.name}
                  </h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                    <p>Medical ID: {patient.medical_id_number}</p>
                    <p>Phone: {patient.phone_number}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PatientImportExport 
                  patientId={patientId}
                  patientName={patient.name}
                  onDataUpdate={() => {
                    fetchPatientData();
                    fetchPatientReports();
                  }}
                />
                <Link
                  href={`/patients/${patient.id}/add-report`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Report
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Medical History
            </h2>
          </div>

          {getAllDates().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medical records found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                This patient has no recorded medical measurements.
              </p>
            </div>
          ) : (
            getAllDates().map((date) => (
              <DateReportCard 
                key={date} 
                date={date} 
                categories={getCategoriesForDate(date)}
                getParametersForDateAndCategory={getParametersForDateAndCategory}
                formatDate={formatDate}
                patientId={patientId}
                onEdit={handleEditReport}
                onDelete={handleDeleteReportClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteDate('');
        }}
        onConfirm={handleDeleteReport}
        title="Delete Reports"
        isDestructive={true}
        confirmText="Delete"
      >
        <p>Are you sure you want to delete all reports for {deleteDate ? formatDate(deleteDate) : ''}?</p>
        <p className="text-red-600 dark:text-red-400 font-medium mt-2">This action cannot be undone.</p>
      </ConfirmationModal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
}
