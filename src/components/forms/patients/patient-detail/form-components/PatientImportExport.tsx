'use client';

import { useState } from 'react';
import { Icon, Icons } from '@/components';
import type { PatientImportExportProps, ImportResults } from '../types';
import { exportPatientData, importPatientData } from '../utils';

export default function PatientImportExport({ patientId, patientName, onDataUpdate }: PatientImportExportProps) {
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
    
    const result = await exportPatientData(patientId, patientName);
    
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

    const result = await importPatientData(patientId, importFile, overwriteExisting);
    
    if (result.success) {
      setImportResults(result.results!);
      setImportFile(null);
      setShowModal(false);
      onDataUpdate(); // Refresh patient data
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <Icon name={Icons.DOWNLOAD} size="xs" className="mr-1" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
        >
          <Icon name={Icons.UPLOAD} size="xs" className="mr-1" />
          Import
        </button>
      </div>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Import Patient Reports
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="overwriteExisting"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="overwriteExisting" className="text-sm text-gray-700 dark:text-gray-300">
                  Overwrite existing reports (otherwise skip duplicates)
                </label>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 
                              dark:border-red-600 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 
                           text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Import Results
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reports imported:</span>
                <span className="font-medium">{importResults.reportsImported}</span>
              </div>
              <div className="flex justify-between">
                <span>Reports updated:</span>
                <span className="font-medium">{importResults.reportsUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span>Reports skipped:</span>
                <span className="font-medium">{importResults.reportsSkipped}</span>
              </div>
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Errors:</h4>
                <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg max-h-32 overflow-y-auto">
                  <ul className="text-sm text-red-700 dark:text-red-200 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setImportResults(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
