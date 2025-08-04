'use client';

import { useState } from 'react';
import { Icon, Icons, Modal } from '@/components';
import type { PrescriptionImportExportProps, ImportResults } from '../types';
import { exportPrescriptions, importPrescriptions } from '../utils';

export function PrescriptionImportExport({ patientId, patientName, onDataUpdate }: PrescriptionImportExportProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    const result = await exportPrescriptions(patientId, patientName);
    
    if (!result.success) {
      setError(result.error || 'Export failed');
    }
    
    setIsExporting(false);
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResults(null);

    const result = await importPrescriptions(patientId, importFile, overwriteExisting);
    
    if (result.success) {
      setImportResults(result.results!);
      setImportFile(null);
      setShowModal(false);
      onDataUpdate(); // Refresh prescription data
    } else {
      setError(result.error || 'Import failed');
    }
    
    setIsImporting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setError(null);
    setImportResults(null);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <Icon name={Icons.DOWNLOAD} size="xs" className="mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <Icon name={Icons.UPLOAD} size="xs" className="mr-2" />
          Import
        </button>
      </div>

      {/* Import Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Import Prescriptions">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select JSON file
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300
                dark:hover:file:bg-blue-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="overwriteExisting"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="overwriteExisting" className="text-sm text-gray-700 dark:text-gray-300">
              Overwrite existing prescriptions (when IDs match)
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {importResults && (
            <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Import Results</h4>
              <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <p>Prescriptions imported: {importResults.prescriptionsImported}</p>
                <p>Prescriptions updated: {importResults.prescriptionsUpdated}</p>
                <p>Prescriptions skipped: {importResults.prescriptionsSkipped}</p>
                <p>Medicines imported: {importResults.medicinesImported}</p>
                <p>Medicines updated: {importResults.medicinesUpdated}</p>
                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
            >
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
