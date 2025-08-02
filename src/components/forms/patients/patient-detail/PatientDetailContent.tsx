'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BackButton, ConfirmationModal, AlertModal, Icon, Icons } from '@/components';
import { formatDate } from '@/lib/utils';
import type { 
  Patient,
  ReportWithCategory,
  PatientDetailContentProps
} from './types';
import {
  fetchPatientData,
  fetchPatientReports,
  getAllDates,
  getCategoriesForDate,
  getParametersForDateAndCategory,
  deleteReportsByDate,
  getEditReportUrl,
  getAddReportUrl,
  createSuccessAlert,
  createErrorAlert,
  formatDeleteSuccessMessage
} from './utils';
import { PatientImportExport, MedicineInstructions, DateReportCard, ParameterChart } from './form-components';
import { PatientModal } from '../common';

export default function PatientDetailContent({ patientId }: PatientDetailContentProps) {
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<ReportWithCategory[]>([]);
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

  const handleFetchPatientData = useCallback(async () => {
    const patient = await fetchPatientData(patientId);
    setPatient(patient);
  }, [patientId]);

  const handleFetchPatientReports = useCallback(async () => {
    const reports = await fetchPatientReports(patientId);
    setReports(reports);
    setIsLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      handleFetchPatientData();
      handleFetchPatientReports();
    }
  }, [patientId, handleFetchPatientData, handleFetchPatientReports]);

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
    setShowEditModal(true);
  };

  const handleDeleteReportClick = (date: string) => {
    setDeleteDate(date);
    setShowDeleteConfirm(true);
  };

  const handleEditReport = (date: string) => {
    router.push(getEditReportUrl(patientId, date));
  };

  const handleDeleteReport = async () => {
    const result = await deleteReportsByDate(patientId, deleteDate);

    if (result.success) {
      // Refresh the reports data
      handleFetchPatientReports();
      const message = formatDeleteSuccessMessage(result.deletedCount!, deleteDate);
      const alert = createSuccessAlert(message);
      showAlertModal(alert.title, alert.message, alert.type);
    } else {
      const alert = createErrorAlert(`Failed to delete reports: ${result.error}`);
      showAlertModal(alert.title, alert.message, alert.type);
    }
    
    setShowDeleteConfirm(false);
    setDeleteDate('');
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
                    handleFetchPatientData();
                    handleFetchPatientReports();
                  }}
                />
                <Link
                  href={getAddReportUrl(patient.id)}
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
          <MedicineInstructions patientId={patient.id} />
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

          {getAllDates(reports).length === 0 ? (
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
            getAllDates(reports).map((date) => (
              <DateReportCard 
                key={date} 
                date={date} 
                categories={getCategoriesForDate(reports, date)}
                getParametersForDateAndCategory={(date: string, categoryName: string) => 
                  getParametersForDateAndCategory(reports, date, categoryName)
                }
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

      {/* Edit Patient Modal */}
      <PatientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editingPatient={patient}
        onSave={() => {
          handleFetchPatientData(); // Refresh patient data
          const alert = createSuccessAlert('Patient updated successfully');
          showAlertModal(alert.title, alert.message, alert.type);
        }}
      />

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
