export interface ImportResults {
  categoriesImported: number;
  parametersImported: number;
  categoriesSkipped: number;
  parametersSkipped: number;
  errors: string[];
}

export interface ImportExportParametersProps {
  onDataUpdate: () => void;
}
