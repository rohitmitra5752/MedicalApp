import type { Medicine, MedicineWithInventory } from '@/lib';
import { MedicineFormData, SheetFormData, SheetData, ImportResults, ImportData, ExportData } from './types';

// API utility functions
export const fetchMedicines = async (search?: string) => {
  const url = search 
    ? `/api/medicines?search=${encodeURIComponent(search)}&includeInventory=true`
    : '/api/medicines?includeInventory=true';
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch medicines');
  }
  
  return data.medicines;
};

export const submitMedicine = async (formData: MedicineFormData, editingMedicine?: Medicine | null) => {
  const url = editingMedicine 
    ? `/api/medicines/${editingMedicine.id}`
    : '/api/medicines';
  
  const method = editingMedicine ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...formData,
      tablets_per_sheet: Number(formData.tablets_per_sheet),
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save medicine');
  }
  
  return data;
};

export const deleteMedicine = async (id: number) => {
  const response = await fetch(`/api/medicines/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete medicine');
  }
  
  return true;
};

export const exportMedicines = async () => {
  const response = await fetch('/api/medicines/import-export');
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to export medicines');
  }

  return result.data;
};

export const parseImportFile = async (file: File): Promise<ImportData> => {
  const fileContent = await file.text();
  return JSON.parse(fileContent);
};

export const importMedicines = async (importData: ImportData, skipDuplicates: boolean): Promise<ImportResults> => {
  const response = await fetch('/api/medicines/import-export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: importData,
      skipDuplicates
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to import medicines');
  }

  return result.results;
};

export const submitSheets = async (selectedMedicine: MedicineWithInventory, sheetFormData: SheetFormData) => {
  // Submit each sheet in the form
  for (const sheet of sheetFormData.sheets) {
    if (!sheet.expiry_date) continue;

    // If in use, add only one sheet with consumed tablets
    if (sheet.is_in_use) {
      const response = await fetch(`/api/medicines/${selectedMedicine.id}/sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiry_date: sheet.expiry_date
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the sheet to mark as in use and set consumed tablets
        await fetch(`/api/medicines/sheets/${data.sheet.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consumed_tablets: selectedMedicine.tablets_per_sheet - sheet.tablets_remaining,
            is_in_use: true
          }),
        });
      }
    } else {
      // Add multiple unused sheets
      for (let i = 0; i < sheet.number_of_sheets; i++) {
        await fetch(`/api/medicines/${selectedMedicine.id}/sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expiry_date: sheet.expiry_date
          }),
        });
      }
    }
  }
};

// Utility functions
export const downloadExportFile = (data: ExportData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medicines_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Form data utilities
export const getInitialMedicineFormData = (): MedicineFormData => ({
  name: '',
  generic_name: '',
  brand_name: '',
  strength: '',
  tablets_per_sheet: 10,
  additional_details: '',
});

export const getInitialSheetFormData = (): SheetFormData => ({
  sheets: [
    {
      expiry_date: '',
      number_of_sheets: 1,
      is_in_use: false,
      tablets_remaining: 0
    }
  ]
});

export const createEmptySheetData = (): SheetData => ({
  expiry_date: '',
  number_of_sheets: 1,
  is_in_use: false,
  tablets_remaining: 0
});

export const medicineToFormData = (medicine: Medicine): MedicineFormData => ({
  name: medicine.name,
  generic_name: medicine.generic_name || '',
  brand_name: medicine.brand_name || '',
  strength: medicine.strength || '',
  tablets_per_sheet: medicine.tablets_per_sheet,
  additional_details: medicine.additional_details || '',
});

// Sheet form utilities
export const addSheetRow = (sheetFormData: SheetFormData): SheetFormData => ({
  ...sheetFormData,
  sheets: [
    ...sheetFormData.sheets,
    createEmptySheetData()
  ]
});

export const removeSheetRow = (sheetFormData: SheetFormData, index: number): SheetFormData => ({
  ...sheetFormData,
  sheets: sheetFormData.sheets.filter((_, i) => i !== index)
});

export const updateSheetRow = (
  sheetFormData: SheetFormData, 
  index: number, 
  field: string, 
  value: string | number | boolean | Date,
  selectedMedicine?: MedicineWithInventory | null
): SheetFormData => {
  const newSheets = [...sheetFormData.sheets];
  const sheet = { ...newSheets[index] };
  
  if (field === 'is_in_use' && value) {
    // If marking as in use, force number of sheets to 1
    sheet.number_of_sheets = 1;
    sheet.tablets_remaining = selectedMedicine?.tablets_per_sheet || 0;
  } else if (field === 'is_in_use' && !value) {
    // If unmarking as in use, reset tablets remaining
    sheet.tablets_remaining = 0;
  }
  
  (sheet as Record<string, string | number | boolean | Date>)[field] = value;
  newSheets[index] = sheet;
  
  return {
    ...sheetFormData,
    sheets: newSheets
  };
};

// Medicine utilities
export const findMedicineById = (medicines: MedicineWithInventory[], id: number): MedicineWithInventory | undefined => {
  return medicines.find(m => m.id === id);
};
