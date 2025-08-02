'use client';

import { useState } from 'react';
import { ImportResults, ImportExportParametersProps } from './types';
import { exportData, importData } from './utils';
import { ImportResultsDisplay } from './form-components';

export default function ImportExportParameters({ onDataUpdate }: ImportExportParametersProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      await exportData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResults(null);

    try {
      const results = await importData(importFile, skipDuplicates);
      setImportResults(results);
      setImportFile(null);
      onDataUpdate(); // Refresh the admin panel data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setError(null);
    setImportResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Export Data</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Export all parameter categories and parameters as a JSON file.
          </p>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                     text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Import Data</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Import parameter categories and parameters from a JSON file.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipDuplicates"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="skipDuplicates" className="text-sm text-gray-700 dark:text-gray-300">
                Skip duplicates (otherwise fail on duplicates)
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 
                       text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 
                      dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <ImportResultsDisplay importResults={importResults} />
      )}
    </div>
  );
}
