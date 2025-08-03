export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

export interface Medicine {
  id: number;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  tablets_per_sheet: number;
  additional_details: string | null;
}

export interface PrescriptionMedicine {
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
}

export interface PatientPrescriptionProps {
  patientId: string;
  prescriptionId: string;
}

export interface MedicineTableProps {
  tableData: MedicineTableRow[];
  onDeleteMedicine: (medicineId: number, medicineName: string) => void;
  onAddMedicine: () => void;
  showAddButton?: boolean;
}
