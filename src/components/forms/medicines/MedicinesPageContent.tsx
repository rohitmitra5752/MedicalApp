import React, { useState, useEffect } from 'react';
import type { MedicineWithInventory, Medicine } from '@/lib';
import { BackButton, ConfirmationModal } from '@/components';
import { MedicineForm, AddSheetForm, ImportSection, SearchBar, MedicinesList, ActionList } from './form-components';
import {
  fetchMedicines as fetchMedicinesAPI,
  deleteMedicine,
  findMedicineById
} from './utils';

export default function MedicinesPageContent() {
  const [medicines, setMedicines] = useState<MedicineWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSheetForm, setShowAddSheetForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithInventory | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingMedicineId, setDeletingMedicineId] = useState<number | null>(null);
  const [deletingMedicineName, setDeletingMedicineName] = useState<string>('');

  // Import/Export state
  const [showImportSection, setShowImportSection] = useState(false);

  const fetchMedicines = async (search?: string) => {
    try {
      setLoading(true);
      const medicines = await fetchMedicinesAPI(search);
      setMedicines(medicines);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
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

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddForm(true);
  };

  const handleMedicineSuccess = () => {
    fetchMedicines(searchTerm);
  };

  const handleDelete = async (id: number) => {
    const medicine = findMedicineById(medicines, id);
    if (medicine) {
      setDeletingMedicineId(id);
      setDeletingMedicineName(medicine.name);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMedicineId) return;

    try {
      await deleteMedicine(deletingMedicineId);
      fetchMedicines(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setShowDeleteConfirmation(false);
      setDeletingMedicineId(null);
      setDeletingMedicineName('');
    }
  };

  const handleImportClick = () => {
    setShowImportSection(true);
    setError(null);
  };

  const handleImportComplete = () => {
    fetchMedicines(searchTerm);
  };

  const resetImportForm = () => {
    setShowImportSection(false);
    setError(null);
  };

  const handleAddMedicineClick = () => {
    setShowAddForm(true);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    fetchMedicines();
  };

  const handleDeleteModalClose = () => {
    setShowDeleteConfirmation(false);
    setDeletingMedicineId(null);
    setDeletingMedicineName('');
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingMedicine(null);
    setError(null);
  };

  const handleAddSheet = (medicine: MedicineWithInventory) => {
    setSelectedMedicine(medicine);
    setShowAddSheetForm(true);
  };

  const handleSheetSuccess = () => {
    fetchMedicines(searchTerm);
  };

  const resetSheetForm = () => {
    setShowAddSheetForm(false);
    setSelectedMedicine(null);
    setError(null);
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
          <ActionList
            onImportClick={handleImportClick}
            onAddMedicine={handleAddMedicineClick}
            onError={setError}
          />
        </div>

        {/* Search */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleSearchClear}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Import Section */}
        <ImportSection
          isOpen={showImportSection}
          onClose={resetImportForm}
          onImportComplete={handleImportComplete}
          onError={setError}
        />

        {/* Add/Edit Form */}
        <MedicineForm
          isOpen={showAddForm}
          onClose={resetForm}
          editingMedicine={editingMedicine}
          onSuccess={handleMedicineSuccess}
          onError={setError}
        />

        {/* Add Sheet Form */}
        <AddSheetForm
          isOpen={showAddSheetForm}
          onClose={resetSheetForm}
          selectedMedicine={selectedMedicine}
          onSuccess={handleSheetSuccess}
          onError={setError}
        />

        {/* Medicines List */}
        <MedicinesList
          medicines={medicines}
          loading={loading}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSheet={handleAddSheet}
          onAddMedicine={handleAddMedicineClick}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteModalClose}
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
