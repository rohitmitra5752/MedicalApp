import { ImportResultsDisplayProps } from '../types';

export default function ImportResultsDisplay({ importResults }: ImportResultsDisplayProps) {
  return (
    <div className="bg-green-100 dark:bg-green-900 border border-green-400 
                  dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
      <h4 className="font-semibold mb-2">Import Results:</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div>Categories imported: {importResults.categoriesImported}</div>
          <div>Parameters imported: {importResults.parametersImported}</div>
        </div>
        <div>
          {importResults.categoriesSkipped > 0 && (
            <div>Categories skipped: {importResults.categoriesSkipped}</div>
          )}
          {importResults.parametersSkipped > 0 && (
            <div>Parameters skipped: {importResults.parametersSkipped}</div>
          )}
        </div>
      </div>
      
      {importResults.errors.length > 0 && (
        <div className="mt-3">
          <h5 className="font-medium">Errors:</h5>
          <ul className="list-disc list-inside text-sm space-y-1">
            {importResults.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
