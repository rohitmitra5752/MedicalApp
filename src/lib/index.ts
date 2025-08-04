// Main database utilities
export { getDatabase, initializeDatabase } from './db';

// Type exports
export type { 
  ParameterCategory,
  Parameter, 
  Patient, 
  Report, 
  ReportWithDetails,
  ReportWithCategory,
  Medicine,
  MedicineSheet,
  MedicineWithInventory,
  Prescription,
  PrescriptionMedicine,
  PrescriptionWithDetails,
  PrescriptionMedicineWithDetails,
  MedicineInstruction,
  PrescriptionInstructions
} from './types';

// Parameter operations
export { 
  getAllParameters, 
  addParameter, 
  updateParameter,
  deleteParameter 
} from './parameters';

// Prescription operations
export { prescriptionService } from './prescriptions';

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
