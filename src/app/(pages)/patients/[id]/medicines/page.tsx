'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PrescriptionModal } from '@/components/PrescriptionModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { BackButton } from '@/components/BackButton';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

interface Prescription {
  id: number;
  patient_id: number;
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string | null;
  created_at: string;
  updated_at: string;
}

interface PrescriptionFormData {
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string;
}

export default function PatientMedicinesPage() {
  const params = useParams();
  const patientId = params.id as string;
  
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
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const [patientResponse, prescriptionsResponse] = await Promise.all([
          fetch(`/api/patients/${patientId}`),
          fetch(`/api/patients/${patientId}/prescriptions`)
        ]);
        
        const patientData = await patientResponse.json();
        const prescriptionsData = await prescriptionsResponse.json();
        
        if (patientData.success) {
          setPatient(patientData.patient);
        }
        
        if (prescriptionsData.success) {
          setPrescriptions(prescriptionsData.prescriptions);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // Helper function to determine if prescription is active
  const isPrescriptionActive = (prescription: Prescription): boolean => {
    if (!prescription.valid_till) return true; // No expiry means always active
    return new Date(prescription.valid_till) >= new Date();
  };

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
    try {
      if (modalMode === 'create') {
        // Create new prescription
        const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPrescriptions(prev => [...prev, result.prescription]);
        } else {
          throw new Error(result.error || 'Failed to create prescription');
        }
        
      } else if (modalMode === 'edit' && editingPrescription) {
        // Update existing prescription
        const response = await fetch(`/api/patients/${patientId}/prescriptions/${editingPrescription.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPrescriptions(prev => 
            prev.map(p => p.id === editingPrescription.id ? result.prescription : p)
          );
        } else {
          throw new Error(result.error || 'Failed to update prescription');
        }
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  const handleDeletePrescription = (prescription: Prescription) => {
    console.log('Delete button clicked for prescription:', prescription.id);
    setPrescriptionToDelete(prescription);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!prescriptionToDelete) return;
    
    console.log('Proceeding with delete...');
    try {
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionToDelete.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.success) {
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionToDelete.id));
        console.log('Prescription deleted successfully');
        setIsDeleteModalOpen(false);
        setPrescriptionToDelete(null);
      } else {
        throw new Error(result.error || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPrescriptionToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type: string) => {
    return type === 'daily_monitoring' ? 'Daily Consumption' : 'Weekly Refill';
  };

  const getTypeColor = (type: string) => {
    return type === 'daily_monitoring' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
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
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
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
              <button
                onClick={handleCreatePrescription}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Prescription</span>
              </button>
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
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This patient has no active prescriptions.
                </p>
                <button
                  onClick={handleCreatePrescription}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Prescription
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-full ${isPrescriptionActive(prescription) ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <svg className={`w-6 h-6 ${isPrescriptionActive(prescription) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Prescription #{prescription.id}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(prescription.prescription_type)}`}>
                              {getTypeLabel(prescription.prescription_type)}
                            </span>
                            {isPrescriptionActive(prescription) ? (
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Created:</span> {formatDate(prescription.created_at)}</p>
                            <p><span className="font-medium">Last Updated:</span> {formatDate(prescription.updated_at)}</p>
                            {prescription.valid_till && (
                              <p><span className="font-medium">Valid Till:</span> {formatDate(prescription.valid_till)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/patients/${patientId}/medicines/${prescription.id}`}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                          title="Edit medicines"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleEditPrescription(prescription)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                          title="Edit prescription details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          title="Delete prescription"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
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
