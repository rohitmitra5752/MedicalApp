import type {
  Patient,
  Medicine,
  PrescriptionMedicine,
  MedicineTableRow,
  AddMedicineForm
} from './types';

// API Functions
export const fetchPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    const response = await fetch(`/api/patients/${patientId}`);
    const data = await response.json();
    return data.success ? data.patient : null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

export const fetchPrescriptionMedicines = async (
  patientId: string,
  prescriptionId: string
): Promise<PrescriptionMedicine[]> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`);
    const data = await response.json();
    return data.success ? data.medicines : [];
  } catch (error) {
    console.error('Error fetching prescription medicines:', error);
    return [];
  }
};

export const fetchAvailableMedicines = async (): Promise<Medicine[]> => {
  try {
    const response = await fetch('/api/medicines');
    const data = await response.json();
    return data.medicines || [];
  } catch (error) {
    console.error('Error fetching available medicines:', error);
    return [];
  }
};

export const addMedicineToPresciption = async (
  patientId: string,
  prescriptionId: string,
  medicineData: {
    medicine_id: number;
    morning_count: number;
    afternoon_count: number;
    evening_count: number;
    recurrence_type: 'daily' | 'interval';
    recurrence_interval: number;
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });

    const responseData = await response.json();
    return responseData.success;
  } catch (error) {
    console.error('Error adding medicine to prescription:', error);
    return false;
  }
};

export const updateMedicineInPrescription = async (
  patientId: string,
  prescriptionId: string,
  prescriptionMedicineId: number,
  medicineData: {
    morning_count: number;
    afternoon_count: number;
    evening_count: number;
    recurrence_type: 'daily' | 'interval';
    recurrence_interval: number;
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines/${prescriptionMedicineId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });

    const responseData = await response.json();
    return responseData.success;
  } catch (error) {
    console.error('Error updating medicine in prescription:', error);
    return false;
  }
};

export const deleteMedicineFromPrescription = async (
  patientId: string,
  prescriptionId: string,
  prescriptionMedicineId: number
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/patients/${patientId}/prescriptions/${prescriptionId}/medicines/${prescriptionMedicineId}`, {
      method: 'DELETE'
    });

    const responseData = await response.json();
    return responseData.success;
  } catch (error) {
    console.error('Error removing medicine from prescription:', error);
    return false;
  }
};

// Utility Functions
export const getRecurrenceDisplay = (type: string, interval: number): string => {
  if (type === 'daily') return 'Daily';
  if (type === 'interval') return `Once every ${interval} days`;
  return type;
};

export const processPrescriptionMedicines = (
  prescriptionMedicines: PrescriptionMedicine[]
): MedicineTableRow[] => {
  return prescriptionMedicines.map(pm => ({
    medicine_id: pm.medicine_id,
    medicine_name: pm.medicine_name,
    medicine_strength: pm.medicine_strength,
    recurrence: getRecurrenceDisplay(pm.recurrence_type, pm.recurrence_interval),
    morning: pm.morning_count,
    afternoon: pm.afternoon_count,
    evening: pm.evening_count,
    prescription_medicine_id: pm.id
  }));
};

export const getInitialAddMedicineForm = (): AddMedicineForm => ({
  medicine_id: null,
  medicine_name: '',
  medicine_strength: '',
  recurrence_type: 'daily',
  recurrence_interval: 1,
  morning: 0,
  afternoon: 0,
  evening: 0
});

export const convertTableRowToEditForm = (
  row: MedicineTableRow,
  prescriptionMedicines: PrescriptionMedicine[]
): AddMedicineForm => {
  // Find the original prescription medicine to get detailed information
  const prescriptionMedicine = prescriptionMedicines.find(
    pm => pm.medicine_id === row.medicine_id
  );

  // Parse recurrence string to determine type and interval
  const recurrenceType = row.recurrence === 'Daily' ? 'daily' : 'interval';
  const recurrenceInterval = row.recurrence === 'Daily' ? 1 : parseInt(row.recurrence.replace('Every ', '').replace(' days', '')) || 1;

  return {
    medicine_id: row.medicine_id,
    medicine_name: row.medicine_name,
    medicine_strength: row.medicine_strength || '',
    recurrence_type: recurrenceType as 'daily' | 'interval',
    recurrence_interval: recurrenceInterval,
    morning: row.morning,
    afternoon: row.afternoon,
    evening: row.evening,
    prescription_medicine_id: row.prescription_medicine_id,
    isEditMode: true
  };
};

// Form Handler Functions
export const handleMedicineSelection = (
  medicineId: string,
  availableMedicines: Medicine[],
  currentForm: AddMedicineForm
): AddMedicineForm => {
  const parsedId = parseInt(medicineId);
  const medicine = availableMedicines.find(m => m.id === parsedId);
  
  return {
    ...currentForm,
    medicine_id: parsedId || null,
    medicine_name: medicine?.name || '',
    medicine_strength: medicine?.strength || ''
  };
};

export const handleRecurrenceChange = (
  recurrenceType: string,
  currentForm: AddMedicineForm
): AddMedicineForm => {
  return {
    ...currentForm,
    recurrence_type: recurrenceType as 'daily' | 'interval'
  };
};

export const handleIntervalChange = (
  interval: string,
  currentForm: AddMedicineForm
): AddMedicineForm => {
  return {
    ...currentForm,
    recurrence_interval: parseInt(interval) || 1
  };
};

export const handleDosageChange = (
  dosageType: 'morning' | 'afternoon' | 'evening',
  value: string,
  currentForm: AddMedicineForm
): AddMedicineForm => {
  return {
    ...currentForm,
    [dosageType]: parseInt(value) || 0
  };
};

// Validation Functions
export const validateAddMedicineForm = (form: AddMedicineForm): string | null => {
  if (!form.medicine_id) {
    return 'Please select a medicine.';
  }
  
  if (form.morning === 0 && form.afternoon === 0 && form.evening === 0) {
    return 'Please set at least one dosage time.';
  }
  
  return null;
};

export const checkMedicineAlreadyExists = (
  form: AddMedicineForm,
  availableMedicines: Medicine[],
  tableData: MedicineTableRow[]
): boolean => {
  const selectedMedicine = availableMedicines.find(m => m.id === form.medicine_id);
  if (!selectedMedicine) return false;
  
  const medicineKey = `${selectedMedicine.name}_${selectedMedicine.strength || ''}`;
  
  return tableData.some(row => {
    const rowKey = `${row.medicine_name}_${row.medicine_strength || ''}`;
    return rowKey === medicineKey;
  });
};

export const performAddMedicine = async (
  form: AddMedicineForm,
  availableMedicines: Medicine[],
  tableData: MedicineTableRow[],
  patientId: string,
  prescriptionId: string
): Promise<{ success: boolean; message: string; selectedMedicine?: Medicine }> => {
  // Check if this is edit mode
  if (form.isEditMode && form.prescription_medicine_id) {
    return performEditMedicine(form, availableMedicines, patientId, prescriptionId);
  }

  // Validate form
  const validationError = validateAddMedicineForm(form);
  if (validationError) {
    return { success: false, message: validationError };
  }

  // Check if medicine already exists
  if (checkMedicineAlreadyExists(form, availableMedicines, tableData)) {
    return { success: false, message: 'This medicine and strength combination is already in the prescription.' };
  }

  // Add medicine to prescription
  const success = await addMedicineToPresciption(patientId, prescriptionId, {
    medicine_id: form.medicine_id!,
    morning_count: form.morning,
    afternoon_count: form.afternoon,
    evening_count: form.evening,
    recurrence_type: form.recurrence_type,
    recurrence_interval: form.recurrence_interval
  });

  const selectedMedicine = availableMedicines.find(m => m.id === form.medicine_id);

  if (success) {
    return { 
      success: true, 
      message: `Successfully added ${selectedMedicine?.name} to prescription`,
      selectedMedicine
    };
  } else {
    return { success: false, message: 'Failed to add medicine to prescription' };
  }
};

export const performEditMedicine = async (
  form: AddMedicineForm,
  availableMedicines: Medicine[],
  patientId: string,
  prescriptionId: string
): Promise<{ success: boolean; message: string; selectedMedicine?: Medicine }> => {
  // Validate form
  const validationError = validateAddMedicineForm(form);
  if (validationError) {
    return { success: false, message: validationError };
  }

  if (!form.prescription_medicine_id) {
    return { success: false, message: 'Invalid prescription medicine ID' };
  }

  // Update medicine in prescription
  const success = await updateMedicineInPrescription(patientId, prescriptionId, form.prescription_medicine_id, {
    morning_count: form.morning,
    afternoon_count: form.afternoon,
    evening_count: form.evening,
    recurrence_type: form.recurrence_type,
    recurrence_interval: form.recurrence_interval
  });

  const selectedMedicine = availableMedicines.find(m => m.id === form.medicine_id);

  if (success) {
    return { 
      success: true, 
      message: `Successfully updated ${selectedMedicine?.name} in prescription`,
      selectedMedicine
    };
  } else {
    return { success: false, message: 'Failed to update medicine in prescription' };
  }
};

export const performDeleteMedicine = async (
  medicineId: number,
  tableData: MedicineTableRow[],
  patientId: string,
  prescriptionId: string
): Promise<{ success: boolean; message: string }> => {
  const medicineRow = tableData.find(row => row.medicine_id === medicineId);
  if (!medicineRow) {
    return { success: false, message: 'Medicine not found in prescription' };
  }

  const success = await deleteMedicineFromPrescription(
    patientId,
    prescriptionId,
    medicineRow.prescription_medicine_id
  );

  if (success) {
    return { success: true, message: 'Medicine removed successfully' };
  } else {
    return { success: false, message: 'Failed to remove medicine from prescription' };
  }
};
