import { getDatabase, initializeDatabase } from './db';

export interface Report {
  id: number;
  patient_id: number;
  parameter_id: number;
  value: number;
  report_date: string;
  created_at: string;
}

export interface ReportWithDetails extends Report {
  patient_name: string;
  parameter_name: string;
  unit: string;
}

export interface ReportWithCategory extends Report {
  patient_name: string;
  parameter_name: string;
  unit: string;
  parameter_minimum: number;
  parameter_maximum: number;
  parameter_description: string;
  category_id: number;
  category_name: string;
}

// Report operations
export function getAllReports(): ReportWithDetails[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      SELECT 
        r.*,
        p.name as patient_name,
        param.parameter_name,
        param.unit
      FROM reports r
      JOIN patients p ON r.patient_id = p.id
      JOIN parameters param ON r.parameter_id = param.id
      ORDER BY r.report_date DESC, p.name
    `);
    return stmt.all() as ReportWithDetails[];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export function addReport(reportData: Omit<Report, 'id' | 'created_at'>): Report | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      INSERT INTO reports (patient_id, parameter_id, value, report_date) 
      VALUES (?, ?, ?, ?) RETURNING *
    `);
    return stmt.get(
      reportData.patient_id,
      reportData.parameter_id,
      reportData.value,
      reportData.report_date
    ) as Report;
  } catch (error) {
    console.error('Error adding report:', error);
    return null;
  }
}

export function deleteReport(id: number): boolean {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('DELETE FROM reports WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting report:', error);
    return false;
  }
}

export function getReportsByPatient(patientId: number): ReportWithDetails[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      SELECT 
        r.*,
        p.name as patient_name,
        param.parameter_name,
        param.unit
      FROM reports r
      JOIN patients p ON r.patient_id = p.id
      JOIN parameters param ON r.parameter_id = param.id
      WHERE r.patient_id = ?
      ORDER BY r.report_date DESC
    `);
    return stmt.all(patientId) as ReportWithDetails[];
  } catch (error) {
    console.error('Error fetching reports by patient:', error);
    return [];
  }
}

export function updateReport(id: number, reportData: Partial<Omit<Report, 'id' | 'created_at'>>): Report | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Build dynamic UPDATE query based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number)[] = [];
    
    if (reportData.patient_id !== undefined) {
      updateFields.push('patient_id = ?');
      updateValues.push(reportData.patient_id);
    }
    
    if (reportData.parameter_id !== undefined) {
      updateFields.push('parameter_id = ?');
      updateValues.push(reportData.parameter_id);
    }
    
    if (reportData.value !== undefined) {
      updateFields.push('value = ?');
      updateValues.push(reportData.value);
    }
    
    if (reportData.report_date !== undefined) {
      updateFields.push('report_date = ?');
      updateValues.push(reportData.report_date);
    }
    
    if (updateFields.length === 0) {
      console.error('No fields to update');
      return null;
    }
    
    // Add the id to the end of values array
    updateValues.push(id);
    
    const stmt = database.prepare(`
      UPDATE reports 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `);
    
    return stmt.get(...updateValues) as Report;
  } catch (error) {
    console.error('Error updating report:', error);
    return null;
  }
}

export function getReportsByPatientWithCategories(patientId: number): ReportWithCategory[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      SELECT 
        r.*,
        p.name as patient_name,
        param.parameter_name,
        param.unit,
        param.minimum as parameter_minimum,
        param.maximum as parameter_maximum,
        param.description as parameter_description,
        param.category_id,
        pc.category_name
      FROM reports r
      JOIN patients p ON r.patient_id = p.id
      JOIN parameters param ON r.parameter_id = param.id
      JOIN parameter_categories pc ON param.category_id = pc.id
      WHERE r.patient_id = ?
      ORDER BY pc.category_name, param.parameter_name, r.report_date DESC
    `);
    return stmt.all(patientId) as ReportWithCategory[];
  } catch (error) {
    console.error('Error fetching reports by patient with categories:', error);
    return [];
  }
}
