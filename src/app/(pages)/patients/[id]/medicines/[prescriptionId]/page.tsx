'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ConfirmationModal, BackButton, Icon, Icons } from '@/components';

interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  tablets_per_sheet: number;
  additional_details: string | null;
}

interface PrescriptionMedicine {
  id: number;
  prescription_id: number;
  medicine_id: number;
  morning_count: number;
  afternoon_count: number;
  evening_count: number;
  recurrence_type: 'daily' | 'weekly' | 'interval';
  recurrence_interval: number;
  recurrence_day_of_week: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  medicine_name: string;
  medicine_strength: string | null;
  medicine_generic_name: string | null;
  medicine_brand_name: string | null;
}

interface MedicineTableRow {
  medicine_id: number;
  medicine_name: string;
  medicine_strength: string | null;
  recurrence: string;
  morning: number;
  afternoon: number;
  evening: number;
  prescription_medicine_id: number;
}

interface AddMedicineForm {
  medicine_id: number | null;
  medicine_name: string;
  medicine_strength: string;
  recurrence_type: 'daily' | 'interval';
  recurrence_interval: number;
  morning: number;
  afternoon: number;
  evening: number;
}

export default function PrescriptionMedicinesPage() {
  const params = useParams();
  const patientId = params.id as string;
  const prescriptionId = params.prescriptionId as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [tableData, setTableData] = useState<MedicineTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add medicine form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddMedicineForm>({
    medicine_id: null,
    medicine_name: '',
    medicine_strength: '',
    recurrence_type: 'daily',
    recurrence_interval: 1,
    morning: 0,
    afternoon: 0,
    evening: 0
  });
  
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
        // Fetch patient
        const patientResponse = await fetch(`/api/patients/${patientId}`);
        const patientData = await patientResponse.json();
        
        if (patientData.success) {
          setPatient(patientData.patient);
        }

        // Fetch prescription medicines
        const medicinesResponse = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`);
        const medicinesData = await medicinesResponse.json();
        
        if (medicinesData.success) {
          setPrescriptionMedicines(medicinesData.medicines);
        }

        // Fetch available medicines for dropdown
        const availableResponse = await fetch('/api/medicines');
        const availableData = await availableResponse.json();
        
        if (availableData.medicines) {
          setAvailableMedicines(availableData.medicines);
        }
        
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
    const processedData: MedicineTableRow[] = prescriptionMedicines.map(pm => ({
      medicine_id: pm.medicine_id,
      medicine_name: pm.medicine_name,
      medicine_strength: pm.medicine_strength,
      recurrence: getRecurrenceDisplay(pm.recurrence_type, pm.recurrence_interval),
      morning: pm.morning_count,
      afternoon: pm.afternoon_count,
      evening: pm.evening_count,
      prescription_medicine_id: pm.id
    }));
    
    setTableData(processedData);
  }, [prescriptionMedicines]);

  const getRecurrenceDisplay = (type: string, interval: number) => {
    if (type === 'daily') return 'Daily';
    if (type === 'interval') return `Once every ${interval} days`;
    return type;
  };

  const handleAddMedicine = async () => {
    if (!addForm.medicine_id || (addForm.morning === 0 && addForm.afternoon === 0 && addForm.evening === 0)) {
      alert('Please select a medicine and set at least one dosage time.');
      return;
    }

    try {
      // Check if medicine + strength combination already exists in prescription
      const selectedMedicine = availableMedicines.find(m => m.id === addForm.medicine_id);
      const medicineKey = `${selectedMedicine?.name}_${selectedMedicine?.strength || ''}`;
      
      const existingMedicine = tableData.find(row => {
        const rowKey = `${row.medicine_name}_${row.medicine_strength || ''}`;
        return rowKey === medicineKey;
      });
      
      if (existingMedicine) {
        alert('This medicine and strength combination is already in the prescription.');
        return;
      }

      // Single API call with all counts
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicine_id: addForm.medicine_id,
          morning_count: addForm.morning,
          afternoon_count: addForm.afternoon,
          evening_count: addForm.evening,
          recurrence_type: addForm.recurrence_type,
          recurrence_interval: addForm.recurrence_interval
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Refresh prescription medicines
        const medicinesResponse = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`);
        const medicinesData = await medicinesResponse.json();
        
        if (medicinesData.success) {
          setPrescriptionMedicines(medicinesData.medicines);
        }

        // Reset form
        setAddForm({
          medicine_id: null,
          medicine_name: '',
          medicine_strength: '',
          recurrence_type: 'daily',
          recurrence_interval: 1,
          morning: 0,
          afternoon: 0,
          evening: 0
        });
        setShowAddForm(false);
        
        // Show success message
        const selectedMedicine = availableMedicines.find(m => m.id === addForm.medicine_id);
        console.log(`Successfully added ${selectedMedicine?.name} to prescription`);
      } else {
        alert('Failed to add medicine to prescription');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine to prescription');
    }
  };

  const handleDeleteMedicine = async (medicineId: number) => {
    try {
      const medicineRow = tableData.find(row => row.medicine_id === medicineId);
      if (!medicineRow) return;

      // Single API call to delete the prescription medicine record
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines/${medicineRow.prescription_medicine_id}`, {
        method: 'DELETE'
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Refresh prescription medicines
        const medicinesResponse = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`);
        const medicinesData = await medicinesResponse.json();
        
        if (medicinesData.success) {
          setPrescriptionMedicines(medicinesData.medicines);
        }
      } else {
        alert('Failed to remove medicine from prescription');
      }
    } catch (error) {
      console.error('Error removing medicine:', error);
      alert('Failed to remove medicine from prescription');
    }
    
    setDeleteConfirmation({ isOpen: false, medicineId: null, medicineName: '' });
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Medicine Schedule
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-800 dark:text-white"></th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Recurrence</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Morning</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Afternoon</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Evening</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.medicine_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{row.medicine_name}</div>
                        {row.medicine_strength && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">{row.medicine_strength}</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                      {row.recurrence}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                      {row.morning || 0}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                      {row.afternoon || 0}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                      {row.evening || 0}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteConfirmation({
                          isOpen: true,
                          medicineId: row.medicine_id,
                          medicineName: row.medicine_name
                        })}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove medicine"
                      >
                        <Icon name={Icons.DELETE} size="xs" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No medicines added to this prescription yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add More Medicines Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              disabled={showAddForm}
            >
              <Icon name={Icons.ADD} size="xs" className="mr-2" />
              Add More Medicines
            </button>
          </div>
        </div>

        {/* Add Medicine Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Medicine to Prescription</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medicine
                </label>
                <select
                  value={addForm.medicine_id || ''}
                  onChange={(e) => {
                    const medicineId = parseInt(e.target.value);
                    const medicine = availableMedicines.find(m => m.id === medicineId);
                    setAddForm({
                      ...addForm,
                      medicine_id: medicineId,
                      medicine_name: medicine?.name || '',
                      medicine_strength: medicine?.strength || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a medicine</option>
                  {availableMedicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} {medicine.strength ? `(${medicine.strength})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recurrence
                </label>
                <select
                  value={addForm.recurrence_type}
                  onChange={(e) => setAddForm({
                    ...addForm,
                    recurrence_type: e.target.value as 'daily' | 'interval'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="interval">Every X days</option>
                </select>
              </div>

              {addForm.recurrence_type === 'interval' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interval (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.recurrence_interval}
                    onChange={(e) => setAddForm({
                      ...addForm,
                      recurrence_interval: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Morning
                </label>
                <input
                  type="number"
                  min="0"
                  value={addForm.morning}
                  onChange={(e) => setAddForm({
                    ...addForm,
                    morning: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Afternoon
                </label>
                <input
                  type="number"
                  min="0"
                  value={addForm.afternoon}
                  onChange={(e) => setAddForm({
                    ...addForm,
                    afternoon: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evening
                </label>
                <input
                  type="number"
                  min="0"
                  value={addForm.evening}
                  onChange={(e) => setAddForm({
                    ...addForm,
                    evening: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Medicine
              </button>
            </div>
          </div>
        )}
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
