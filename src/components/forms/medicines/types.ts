import { Medicine, MedicineWithInventory } from '@/lib/db';

export interface MedicineFormData {
  name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  tablets_per_sheet: number;
  additional_details: string;
}

export interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingMedicine: Medicine | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export interface SheetData {
  expiry_date: string;
  number_of_sheets: number;
  is_in_use: boolean;
  tablets_remaining: number;
}

export interface SheetFormData {
  sheets: SheetData[];
}

export interface AddSheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedicine: MedicineWithInventory | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export interface ImportSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  onError: (error: string) => void;
}

export interface ImportResults {
  medicinesImported: number;
  medicinesSkipped: number;
  errors: string[];
}

export interface ActionListProps {
  onImportClick: () => void;
  onAddMedicine: () => void;
  onError: (error: string) => void;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}

export interface MedicinesListProps {
  medicines: MedicineWithInventory[];
  loading: boolean;
  searchTerm: string;
  onEdit: (medicine: MedicineWithInventory) => void;
  onDelete: (id: number) => void;
  onAddSheet: (medicine: MedicineWithInventory) => void;
  onAddMedicine: () => void;
}
