// Main database utilities
export { getDatabase, initializeDatabase } from './db';

// Type exports
export type { 
  Parameter, 
  Patient, 
  Report, 
  ReportWithDetails 
} from './db';

// Parameter operations
export { 
  getAllParameters, 
  addParameter, 
  updateParameter,
  deleteParameter 
} from './parameters';

// Patient operations
export { 
  getAllPatients, 
  addPatient, 
  updatePatient,
  deletePatient, 
  getPatientById,
  getPatientByMedicalId 
} from './patients';

// Report operations
export { 
  getAllReports, 
  addReport, 
  updateReport,
  deleteReport, 
  getReportsByPatient,
  getReportsByPatientWithCategories 
} from './reports';
