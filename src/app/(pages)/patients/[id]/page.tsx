'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateReportCard, ParameterChart, BackButton, ConfirmationModal, AlertModal, Modal, CountrySelector, SexSelector, Icon, Icons } from '@/components';
import { parsePhoneNumber, formatDate } from '@/lib/utils';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
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
  parameter_sort_order: number;
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

interface PatientForm {
  name: string;
  phone_number: string;
  medical_id_number: string;
  country_code: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
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
          <Icon name={Icons.DOWNLOAD} size="xs" className="mr-1" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <Icon name={Icons.UPLOAD} size="xs" className="mr-1" />
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
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDate, setDeleteDate] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [alertTitle, setAlertTitle] = useState('');
  
  // Edit patient modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientForm>({
    name: '',
    phone_number: '',
    medical_id_number: '',
    country_code: '+91',
    gender: 'male',
    is_taking_medicines: false
  });
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

    const categoriesArray = Array.from(categoryMap.values()).sort((a, b) => 
      a.categoryName.localeCompare(b.categoryName)
    );
    
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

  // Helper functions for modals
  const showAlertModal = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  // Edit patient functions
  const handleEditPatient = () => {
    if (!patient) return;
    
    // Parse existing phone number to separate country code and number
    const parsed = parsePhoneNumber(patient.phone_number);
    
    setPatientForm({
      name: patient.name,
      phone_number: parsed.number,
      medical_id_number: patient.medical_id_number,
      country_code: parsed.countryCode,
      gender: patient.gender,
      is_taking_medicines: patient.is_taking_medicines
    });
    setShowEditModal(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate gender selection
    if (!patientForm.gender) {
      showAlertModal('Validation Error', 'Please select a gender', 'error');
      return;
    }
    
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: patientForm.name.trim(),
          phone_number: `${patientForm.country_code} ${patientForm.phone_number}`.trim(),
          medical_id_number: patientForm.medical_id_number.trim(),
          gender: patientForm.gender,
          is_taking_medicines: patientForm.is_taking_medicines
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        fetchPatientData(); // Refresh patient data
        showAlertModal('Success', 'Patient updated successfully', 'success');
      } else {
        showAlertModal('Error', data.error || 'Failed to update patient', 'error');
      }
    } catch {
      showAlertModal('Error', 'Network error occurred', 'error');
    }
  };

  const handleDeleteReportClick = (date: string) => {
    setDeleteDate(date);
    setShowDeleteConfirm(true);
  };

  const handleEditReport = (date: string) => {
    router.push(`/patients/${patientId}/report?mode=edit&date=${date}`);
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
            <BackButton href="/patients">
              Back to Patients
            </BackButton>
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
          <BackButton href="/patients">
            Back to Patients
          </BackButton>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="relative bg-blue-100 dark:bg-blue-900 p-4 rounded-full cursor-pointer group transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                  onClick={handleEditPatient}
                  title="Click to edit patient"
                >
                  <Icon name={Icons.USER} size="xl" className="text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200" />
                  {/* Edit icon overlay - centered on the avatar */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Icon name={Icons.EDIT} size="xs" className="text-white" />
                  </div>
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
                  href={`/patients/${patient.id}/report?mode=add`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Icon name={Icons.ADD} size="sm" className="mr-2" />
                  Add Report
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Instructions Section - Only show if patient is taking medicines */}
        {patient.is_taking_medicines && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <Icon name={Icons.MEDICINE} size="sm" className="text-green-600 dark:text-green-400" />
                  </div>
                  Medicine Instructions
                </h2>
                <Link
                  href={`/patients/${patient.id}/medicines`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  title="Edit prescription"
                >
                  <Icon name={Icons.EDIT} size="xs" className="mr-2" />
                  Edit Prescription
                </Link>
              </div>
              
              {/* Placeholder content */}
              <div className="text-center py-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Medicine instructions will be displayed here.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Click &quot;Edit Prescription&quot; to manage this patient&apos;s medicine schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Medical History
            </h2>
          </div>

          {/* Parameter Chart */}
          <ParameterChart reports={reports} />

          {/* Individual Date Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Individual Reports
            </h3>
          </div>

          {getAllDates().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Icon name={Icons.DOCUMENT} size="2xl" className="mx-auto" />
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
      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Patient"
      >
        <form onSubmit={handleSavePatient}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                value={patientForm.name}
                onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         dark:bg-gray-700 dark:text-white"
                placeholder="Enter patient name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <div className="flex">
                <CountrySelector
                  value={patientForm.country_code}
                  onChange={(code) => setPatientForm({...patientForm, country_code: code})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white w-[100px] flex-shrink-0"
                />
                <input
                  type="tel"
                  value={patientForm.phone_number}
                  onChange={(e) => setPatientForm({...patientForm, phone_number: e.target.value})}
                  placeholder="123-456-7890"
                  className="flex-1 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the phone number without the country code
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medical ID Number *
              </label>
              <input
                type="text"
                value={patientForm.medical_id_number}
                onChange={(e) => setPatientForm({...patientForm, medical_id_number: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         dark:bg-gray-700 dark:text-white"
                placeholder="Enter medical ID number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <SexSelector
                value={patientForm.gender}
                onChange={(gender) => setPatientForm({...patientForm, gender})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Taking Medicines
              </label>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patientForm.is_taking_medicines}
                    onChange={(e) => setPatientForm({...patientForm, is_taking_medicines: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

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
