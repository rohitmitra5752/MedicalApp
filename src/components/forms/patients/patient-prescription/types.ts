export interface MedicineTableRow {
  medicine_id: number;
  medicine_name: string;
  medicine_strength: string | null;
  recurrence: string;
  morning: number;
  afternoon: number;
  evening: number;
  prescription_medicine_id: number;
}

export interface AddMedicineForm {
  medicine_id: number | null;
  medicine_name: string;
  medicine_strength: string;
  recurrence_type: 'daily' | 'interval';
  recurrence_interval: number;
  morning: number;
  afternoon: number;
  evening: number;
  prescription_medicine_id?: number; // For edit mode
  isEditMode?: boolean;
}

export interface PatientPrescriptionProps {
  patientId: string;
  prescriptionId: string;
}

export interface MedicineTableProps {
  tableData: MedicineTableRow[];
  onDeleteMedicine: (medicineId: number, medicineName: string) => void;
  onAddMedicine: () => void;
  onEditMedicine?: (medicineData: MedicineTableRow) => void;
  showAddButton?: boolean;
}
