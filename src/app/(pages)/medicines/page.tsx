'use client';

import { useState, useEffect } from 'react';
import { MedicineWithInventory, Medicine } from '@/lib/db';
import { BackButton } from '@/components/BackButton';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface MedicineFormData {
  name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  tablets_per_sheet: number;
  additional_details: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<MedicineWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSheetForm, setShowAddSheetForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithInventory | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    generic_name: '',
    brand_name: '',
    strength: '',
    tablets_per_sheet: 10,
    additional_details: '',
  });
  const [sheetFormData, setSheetFormData] = useState({
    sheets: [
      {
        expiry_date: '',
        number_of_sheets: 1,
        is_in_use: false,
        tablets_remaining: 0
      }
    ]
  });

  // Confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingMedicineId, setDeletingMedicineId] = useState<number | null>(null);
  const [deletingMedicineName, setDeletingMedicineName] = useState<string>('');

  // Import/Export state
  const [showImportSection, setShowImportSection] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    medicinesImported: number;
    medicinesSkipped: number;
    errors: string[];
  } | null>(null);

  const fetchMedicines = async (search?: string) => {
    try {
      setLoading(true);
      const url = search 
        ? `/api/medicines?search=${encodeURIComponent(search)}&includeInventory=true`
        : '/api/medicines?includeInventory=true';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setMedicines(data.medicines);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch medicines');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
      
      if (response.ok) {
        setShowAddForm(false);
        setEditingMedicine(null);
        setFormData({
          name: '',
          generic_name: '',
          brand_name: '',
          strength: '',
          tablets_per_sheet: 10,
          additional_details: '',
        });
        fetchMedicines(searchTerm);
      } else {
        setError(data.error || 'Failed to save medicine');
      }
    } catch {
      setError('Network error occurred');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name || '',
      brand_name: medicine.brand_name || '',
      strength: medicine.strength || '',
      tablets_per_sheet: medicine.tablets_per_sheet,
      additional_details: medicine.additional_details || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
      setDeletingMedicineId(id);
      setDeletingMedicineName(medicine.name);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMedicineId) return;

    try {
      const response = await fetch(`/api/medicines/${deletingMedicineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMedicines(searchTerm);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete medicine');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setShowDeleteConfirmation(false);
      setDeletingMedicineId(null);
      setDeletingMedicineName('');
    }
  };

  // Import/Export functions
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/medicines/import-export');
      const result = await response.json();

      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medicines_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Failed to export medicines');
      }
    } catch {
      setError('Failed to export medicines');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsImporting(true);
      setImportResults(null);
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);

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

      if (result.success) {
        setImportResults(result.results);
        setImportFile(null);
        fetchMedicines(searchTerm);
      } else {
        setError(result.error || 'Failed to import medicines');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse import file');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportForm = () => {
    setShowImportSection(false);
    setImportFile(null);
    setImportResults(null);
    setSkipDuplicates(false);
    setError(null);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingMedicine(null);
    setFormData({
      name: '',
      generic_name: '',
      brand_name: '',
      strength: '',
      tablets_per_sheet: 10,
      additional_details: '',
    });
    setError(null);
  };

  const handleAddSheet = (medicine: MedicineWithInventory) => {
    setSelectedMedicine(medicine);
    setSheetFormData({
      sheets: [
        {
          expiry_date: '',
          number_of_sheets: 1,
          is_in_use: false,
          tablets_remaining: 0
        }
      ]
    });
    setShowAddSheetForm(true);
  };

  const handleSubmitSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    try {
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

      setShowAddSheetForm(false);
      setSelectedMedicine(null);
      setSheetFormData({
        sheets: [
          {
            expiry_date: '',
            number_of_sheets: 1,
            is_in_use: false,
            tablets_remaining: 0
          }
        ]
      });
      fetchMedicines(searchTerm);
    } catch {
      setError('Network error occurred');
    }
  };

  const resetSheetForm = () => {
    setShowAddSheetForm(false);
    setSelectedMedicine(null);
    setSheetFormData({
      sheets: [
        {
          expiry_date: '',
          number_of_sheets: 1,
          is_in_use: false,
          tablets_remaining: 0
        }
      ]
    });
    setError(null);
  };

  const addMoreSheets = () => {
    setSheetFormData({
      ...sheetFormData,
      sheets: [
        ...sheetFormData.sheets,
        {
          expiry_date: '',
          number_of_sheets: 1,
          is_in_use: false,
          tablets_remaining: 0
        }
      ]
    });
  };

  const removeSheetRow = (index: number) => {
    const newSheets = sheetFormData.sheets.filter((_, i) => i !== index);
    setSheetFormData({
      ...sheetFormData,
      sheets: newSheets
    });
  };

  const updateSheetRow = (index: number, field: string, value: string | number | boolean | Date) => {
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
    
    setSheetFormData({
      ...sheetFormData,
      sheets: newSheets
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <BackButton href="/" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
              Back to Home
            </BackButton>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Medicine Inventory
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Track and manage medicine stock
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={() => {
                setShowImportSection(true);
                setImportFile(null);
                setImportResults(null);
                setError(null);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medicine
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines by name, generic name, or brand..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  fetchMedicines();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Import Section */}
        {showImportSection && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Import Medicines</h2>
              <button
                onClick={resetImportForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select JSON file to import
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="skipDuplicates"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="skipDuplicates" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Skip duplicate medicines (import only new ones)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import Medicines'}
                </button>
              </div>

              {importResults && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Import Results:</h3>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Medicines imported: {importResults.medicinesImported}</li>
                    <li>• Medicines skipped: {importResults.medicinesSkipped}</li>
                    {importResults.errors.length > 0 && (
                      <li>
                        • Errors: {importResults.errors.length}
                        <ul className="ml-4 mt-1">
                          {importResults.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-red-600 dark:text-red-400">- {error}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li className="text-gray-600 dark:text-gray-400">... and {importResults.errors.length - 5} more</li>
                          )}
                        </ul>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generic Name
                </label>
                <input
                  type="text"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Strength
                </label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tablets per Sheet *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.tablets_per_sheet}
                  onChange={(e) => setFormData({ ...formData, tablets_per_sheet: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={formData.additional_details}
                  onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  {editingMedicine ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Medicine
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Medicine
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Sheet Form */}
        {showAddSheetForm && selectedMedicine && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Add New Sheet - {selectedMedicine.name}
                {selectedMedicine.strength && ` (${selectedMedicine.strength})`}
              </h2>
              <button
                onClick={resetSheetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitSheet} className="space-y-4">
              {sheetFormData.sheets.map((sheet, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  {index > 0 && (
                    <div className="flex justify-end mb-4">
                      <button
                        type="button"
                        onClick={() => removeSheetRow(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete this row"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {/* Expiry Date */}
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={sheet.expiry_date}
                        onChange={(e) => updateSheetRow(index, 'expiry_date', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Number of Sheets */}
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Sheets *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={sheet.number_of_sheets}
                        onChange={(e) => updateSheetRow(index, 'number_of_sheets', parseInt(e.target.value) || 1)}
                        disabled={sheet.is_in_use}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                      {sheet.is_in_use && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Forced to 1 when &quot;In Use&quot; is checked
                        </p>
                      )}
                    </div>

                    {/* In Use Checkbox */}
                    <div className="flex items-center h-full pt-7 min-w-0">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sheet.is_in_use}
                          onChange={(e) => updateSheetRow(index, 'is_in_use', e.target.checked)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          In Use
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Tablets Remaining (only shown when In Use is checked) */}
                  {sheet.is_in_use && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tablets Remaining *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={selectedMedicine?.tablets_per_sheet || 100}
                        value={sheet.tablets_remaining}
                        onChange={(e) => updateSheetRow(index, 'tablets_remaining', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white md:w-1/3"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Out of {selectedMedicine?.tablets_per_sheet} tablets per sheet
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Sheets Button */}
              <button
                type="button"
                onClick={addMoreSheets}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add More Sheets
              </button>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Sheets
                </button>
                <button
                  type="button"
                  onClick={resetSheetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medicines List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Medicines ({medicines.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-green-600 rounded-full"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading medicines...</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medicines found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No medicines match your search criteria.' : 'No medicines are available in the inventory.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Medicine
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {medicine.name}
                          </h3>
                          {medicine.strength && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                              {medicine.strength}
                            </span>
                          )}
                          {medicine.expired_sheets > 0 && (
                            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                              {medicine.expired_sheets} Expired
                            </span>
                          )}
                        </div>
                        
                        {/* Basic Info */}
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                          {medicine.generic_name && (
                            <p><span className="font-medium">Generic:</span> {medicine.generic_name}</p>
                          )}
                          {medicine.brand_name && (
                            <p><span className="font-medium">Brand:</span> {medicine.brand_name}</p>
                          )}
                          <p><span className="font-medium">Tablets per sheet:</span> {medicine.tablets_per_sheet}</p>
                          {medicine.additional_details && (
                            <p><span className="font-medium">Details:</span> {medicine.additional_details}</p>
                          )}
                        </div>

                        {/* Inventory Summary */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {medicine.total_sheets}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Sheets</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {medicine.sheets_in_use}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">In Use</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {medicine.available_tablets}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Available Tablets</div>
                          </div>
                          <div className="text-center">
                            <button
                              onClick={() => handleAddSheet(medicine)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                            >
                              Add Sheet
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                        title="Edit medicine"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        title="Delete medicine"
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setDeletingMedicineId(null);
          setDeletingMedicineName('');
        }}
        onConfirm={confirmDelete}
        title="Delete Medicine"
        confirmText="Delete"
        isDestructive={true}
      >
        <p>Are you sure you want to delete <strong>&quot;{deletingMedicineName}&quot;</strong>?</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone.
        </p>
      </ConfirmationModal>
    </div>
  );
}
