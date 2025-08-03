'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal, BackButton, Icon, Icons } from '@/components';
import type {
  Patient,
  Medicine,
  PrescriptionMedicine,
  MedicineTableRow,
  PatientPrescriptionProps
} from './types';
import type { AddMedicineForm as AddMedicineFormData } from './types';
import {
  fetchPatient,
  fetchPrescriptionMedicines,
  fetchAvailableMedicines,
  processPrescriptionMedicines,
  performAddMedicine,
  performDeleteMedicine
} from './utils';
import { AddMedicineForm, MedicineTable } from './form-components';

export function PatientPrescriptionContent({ patientId, prescriptionId }: PatientPrescriptionProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [tableData, setTableData] = useState<MedicineTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add medicine form state
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    medicineId: number | null;
    medicineName: string;
  }>({
    isOpen: false,
    medicineId: null,
    medicineName: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data concurrently
        const [patientData, medicinesData, availableData] = await Promise.all([
          fetchPatient(patientId),
          fetchPrescriptionMedicines(patientId, prescriptionId),
          fetchAvailableMedicines()
        ]);
        
        setPatient(patientData);
        setPrescriptionMedicines(medicinesData);
        setAvailableMedicines(availableData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId && prescriptionId) {
      fetchData();
    }
  }, [patientId, prescriptionId]);

  // Process prescription medicines into table format
  useEffect(() => {
    const processedData = processPrescriptionMedicines(prescriptionMedicines);
    setTableData(processedData);
  }, [prescriptionMedicines]);

  const handleAddMedicine = async (form: AddMedicineFormData) => {
    const result = await performAddMedicine(
      form,
      availableMedicines,
      tableData,
      patientId,
      prescriptionId
    );

    if (result.success) {
      // Refresh prescription medicines
      const updatedMedicines = await fetchPrescriptionMedicines(patientId, prescriptionId);
      setPrescriptionMedicines(updatedMedicines);

      setShowAddForm(false);
      
      // Show success message
      console.log(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteMedicine = async (medicineId: number) => {
    const result = await performDeleteMedicine(
      medicineId,
      tableData,
      patientId,
      prescriptionId
    );

    if (result.success) {
      // Refresh prescription medicines
      const updatedMedicines = await fetchPrescriptionMedicines(patientId, prescriptionId);
      setPrescriptionMedicines(updatedMedicines);
    } else {
      alert(result.message);
    }
    
    setDeleteConfirmation({ isOpen: false, medicineId: null, medicineName: '' });
  };

  const handleDeleteConfirmation = (medicineId: number, medicineName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      medicineId,
      medicineName
    });
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
          <BackButton href={`/patients/${patientId}/medicines`}>Back to Prescriptions</BackButton>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                  <Icon name={Icons.MEDICINE} size="xl" className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Prescription Medicines - {patient.name}
                  </h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                    <p>Medical ID: {patient.medical_id_number}</p>
                    <p>Phone: {patient.phone_number}</p>
                    <p>Prescription ID: {prescriptionId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Table */}
        <MedicineTable
          tableData={tableData}
          onDeleteMedicine={handleDeleteConfirmation}
          onAddMedicine={() => setShowAddForm(true)}
          showAddButton={!showAddForm}
        />

        {/* Add Medicine Form */}
        <AddMedicineForm
          isVisible={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddMedicine}
          availableMedicines={availableMedicines}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, medicineId: null, medicineName: '' })}
        onConfirm={() => deleteConfirmation.medicineId && handleDeleteMedicine(deleteConfirmation.medicineId)}
        title="Remove Medicine"
        isDestructive={true}
        confirmText="Remove"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to remove <strong>{deleteConfirmation.medicineName}</strong> from this prescription? 
          This will remove all dosing times for this medicine.
        </p>
      </ConfirmationModal>
    </div>
  );
}
