'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal, BackButton, Icon, Icons } from '@/components';
import type { Patient } from '@/lib';
import { 
  fetchPatients, 
  deletePatient
} from './utils';
import { PatientCard } from './form-components';
import { PatientModal } from '../common';

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const fetchedPatients = await fetchPatients();
      setPatients(fetchedPatients);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientModal(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    const success = await deletePatient(patientToDelete.id);
    if (success) {
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
      loadPatients();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <BackButton href="/">Back to Home</BackButton>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Patient Records
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Select a patient to view their medical history
            </p>
          </div>
          <button
            onClick={handleAddPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Icon name={Icons.ADD} size="sm" className="mr-2" />
            Add Patient
          </button>
        </div>

        {/* Patients List */}
        {patients.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Icon name={Icons.USERS} size="2xl" className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No patients found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No patient records are available in the system.
            </p>
            <button
              onClick={handleAddPatient}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Patient
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Patient Modal */}
      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        editingPatient={editingPatient}
        onSave={loadPatients}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        confirmText="Delete Patient"
        isDestructive={true}
      >
        <div className="flex items-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full mr-4">
            <Icon name={Icons.WARNING} size="md" className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Delete Patient Record
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the patient record for{' '}
          <span className="font-semibold">{patientToDelete?.name}</span>?
          This will also delete all associated medical reports.
        </p>
      </ConfirmationModal>
    </div>
  );
}
