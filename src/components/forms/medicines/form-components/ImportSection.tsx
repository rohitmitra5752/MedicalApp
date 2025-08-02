import { useState } from 'react';
import { Icon, Icons } from '@/components';
import { parseImportFile, importMedicines } from '../utils';
import { ImportResults, ImportSectionProps } from '../types';

export function ImportSection({
  isOpen,
  onClose,
  onImportComplete,
  onError
}: ImportSectionProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsImporting(true);
      setImportResults(null);
      const importData = await parseImportFile(importFile);
      const results = await importMedicines(importData, skipDuplicates);
      setImportResults(results);
      setImportFile(null);
      onImportComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to parse import file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setImportResults(null);
    setSkipDuplicates(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Import Medicines</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon name={Icons.CLOSE} size="md" />
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
  );
}
