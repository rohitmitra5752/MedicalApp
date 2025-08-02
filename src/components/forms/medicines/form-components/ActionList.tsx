import { useState } from 'react';
import { Icon, Icons } from '@/components';
import { exportMedicines, downloadExportFile } from '../utils';
import { ActionListProps } from '../types';

export function ActionList({ 
  onImportClick, 
  onAddMedicine, 
  onError 
}: ActionListProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportMedicines();
      downloadExportFile(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to export medicines');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
      >
        <Icon name={Icons.DOWNLOAD} size="sm" className="mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
      <button
        onClick={onImportClick}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
      >
        <Icon name={Icons.UPLOAD} size="sm" className="mr-2" />
        Import
      </button>
      <button
        onClick={onAddMedicine}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
      >
        <Icon name={Icons.ADD} size="sm" className="mr-2" />
        Add Medicine
      </button>
    </div>
  );
}
