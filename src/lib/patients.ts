import { getDatabase, initializeDatabase } from './db';
import { convertSQLitePatient, booleanToSQLiteInteger } from './utils';
import type { Patient } from './types';

// Patient operations
export function getAllPatients(): Patient[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('SELECT * FROM patients ORDER BY name');
    const patients = stmt.all();
    return patients.map((patient) => convertSQLitePatient(patient as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

export function addPatient(patientData: Omit<Patient, 'id' | 'created_at'>): Patient | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      INSERT INTO patients (name, phone_number, medical_id_number, gender, is_taking_medicines) 
      VALUES (?, ?, ?, ?, ?) RETURNING *
    `);
    
    // Convert boolean to integer for SQLite (true -> 1, false -> 0)
    const medicineStatus = booleanToSQLiteInteger(patientData.is_taking_medicines);
    
    const result = stmt.get(
      patientData.name,
      patientData.phone_number,
      patientData.medical_id_number,
      patientData.gender,
      medicineStatus
    );
    
    return convertSQLitePatient(result as Record<string, unknown>);
  } catch (error) {
    console.error('Error adding patient:', error);
    return null;
  }
}

export function deletePatient(id: number): boolean {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Use a transaction to ensure atomicity
    const transaction = database.transaction(() => {
      // First, delete all reports associated with this patient
      const deleteReportsStmt = database.prepare('DELETE FROM reports WHERE patient_id = ?');
      deleteReportsStmt.run(id);
      
      // Then, delete the patient
      const deletePatientStmt = database.prepare('DELETE FROM patients WHERE id = ?');
      const result = deletePatientStmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Patient not found');
      }
      
      return result.changes > 0;
    });
    
    return transaction();
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
}

export function getPatientByMedicalId(medicalId: string): Patient | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('SELECT * FROM patients WHERE medical_id_number = ?');
    const result = stmt.get(medicalId);
    return result ? convertSQLitePatient(result as Record<string, unknown>) : null;
  } catch (error) {
    console.error('Error fetching patient by medical ID:', error);
    return null;
  }
}

export function updatePatient(id: number, patientData: Partial<Omit<Patient, 'id' | 'created_at'>>): Patient | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Build dynamic UPDATE query based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];
    
    if (patientData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(patientData.name);
    }
    
    if (patientData.phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(patientData.phone_number);
    }
    
    if (patientData.medical_id_number !== undefined) {
      updateFields.push('medical_id_number = ?');
      updateValues.push(patientData.medical_id_number);
    }
    
    if (patientData.gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(patientData.gender);
    }
    
    if (patientData.is_taking_medicines !== undefined) {
      updateFields.push('is_taking_medicines = ?');
      // Convert boolean to integer for SQLite (true -> 1, false -> 0)
      const value = booleanToSQLiteInteger(patientData.is_taking_medicines);
      updateValues.push(value);
    }
    
    if (updateFields.length === 0) {
      console.error('No fields to update');
      return null;
    }
    
    // Add the id to the end of values array
    updateValues.push(id);
    
    const stmt = database.prepare(`
      UPDATE patients 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `);
    
    const result = stmt.get(...updateValues);
    return convertSQLitePatient(result as Record<string, unknown>);
  } catch (error) {
    console.error('Error updating patient:', error);
    return null;
  }
}

export function getPatientById(id: number): Patient | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('SELECT * FROM patients WHERE id = ?');
    const result = stmt.get(id);
    return result ? convertSQLitePatient(result as Record<string, unknown>) : null;
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    return null;
  }
}
