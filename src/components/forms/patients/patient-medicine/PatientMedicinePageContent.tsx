'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal, BackButton, Icon, Icons } from '@/components';
import { PrescriptionModal, PrescriptionCard, PrescriptionImportExport } from './form-components';
import type { Patient, Prescription } from '@/lib';
import type { PrescriptionFormData, PatientMedicinePageContentProps } from './types';
import { 
  fetchPatientData, 
  handlePrescriptionSubmit, 
  handlePrescriptionDelete,
  isPrescriptionActive,
  formatDate,
  getTypeLabel
} from './utils';

export function PatientMedicinePageContent({ patientId }: PatientMedicinePageContentProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      const { patient, prescriptions, error } = await fetchPatientData(patientId);
      
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setPatient(patient);
        setPrescriptions(prescriptions);
      }
      
      setIsLoading(false);
    };

    loadPatientData();
  }, [patientId]);

  // Helper function to determine if prescription is active

  // Modal handlers
  const handleCreatePrescription = () => {
    setModalMode('create');
    setEditingPrescription(null);
    setIsModalOpen(true);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setModalMode('edit');
    setEditingPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPrescription(null);
  };

  const handleSubmitPrescription = async (formData: PrescriptionFormData) => {
    const updatedPrescription = await handlePrescriptionSubmit(
      patientId, 
      modalMode, 
      formData, 
      editingPrescription
    );

    // Update the local state based on the mode
    if (modalMode === 'create') {
      setPrescriptions(prev => [...prev, updatedPrescription]);
    } else if (modalMode === 'edit' && editingPrescription) {
      setPrescriptions(prev => 
        prev.map(p => p.id === editingPrescription.id ? updatedPrescription : p)
      );
    }
    
    // Reset modal state after successful submission
    setIsModalOpen(false);
    setEditingPrescription(null);
  };

  const handleDeletePrescription = (prescription: Prescription) => {
    console.log('Delete button clicked for prescription:', prescription.id);
    setPrescriptionToDelete(prescription);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!prescriptionToDelete) return;
    
    try {
      await handlePrescriptionDelete(patientId, prescriptionToDelete.id);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionToDelete.id));
      setIsDeleteModalOpen(false);
      setPrescriptionToDelete(null);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPrescriptionToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          <BackButton href={`/patients/${patientId}`}>Back to {patient.name}</BackButton>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                  <Icon name={Icons.MEDICINE} size="xl" className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Medicine Prescription - {patient.name}
                  </h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                    <p>Medical ID: {patient.medical_id_number}</p>
                    <p>Phone: {patient.phone_number}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PrescriptionImportExport
                  patientId={patientId}
                  patientName={patient.name}
                  onDataUpdate={() => {
                    // Refresh prescriptions
                    fetchPatientData(patientId).then(({ prescriptions }) => {
                      setPrescriptions(prescriptions);
                    });
                  }}
                />
                <button
                  onClick={handleCreatePrescription}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <Icon name={Icons.ADD} size="xs" />
                  <span>Create Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Active Prescriptions ({prescriptions.filter(p => isPrescriptionActive(p)).length})
            </h2>

            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Icon name={Icons.DOCUMENT} size="xl" className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This patient has no active prescriptions.
                </p>
                <button
                  onClick={handleCreatePrescription}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <Icon name={Icons.ADD} size="xs" className="mr-2" />
                  Create First Prescription
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {prescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    patientId={patientId}
                    patientName={patient.name}
                    onEdit={handleEditPrescription}
                    onDelete={handleDeletePrescription}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPrescription}
        patientName={patient.name}
        prescriptionData={editingPrescription}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Prescription"
        isDestructive={true}
        confirmText="Delete"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this prescription? This action cannot be undone.
        </p>
        {prescriptionToDelete && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Type:</span> {getTypeLabel(prescriptionToDelete.prescription_type)}
            </p>
            {prescriptionToDelete.valid_till && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Valid until:</span> {formatDate(prescriptionToDelete.valid_till)}
              </p>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
