export const exportData = async (): Promise<void> => {
  const response = await fetch('/api/import-export', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to export data');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Export failed');
  }

  // Create and download the file
  const blob = new Blob([JSON.stringify(result.data, null, 2)], {
    type: 'application/json',
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (file: File, skipDuplicates: boolean) => {
  if (!file) {
    throw new Error('Please select a file to import');
  }

  const fileContent = await file.text();
  let importData;
  
  try {
    importData = JSON.parse(fileContent);
  } catch {
    throw new Error('Invalid JSON file');
  }

  const response = await fetch('/api/import-export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: importData,
      skipDuplicates,
    }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Import failed');
  }

  return result.results;
};
