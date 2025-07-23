import { getDatabase, initializeDatabase } from './db';

export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  created_at: string;
}

// Patient operations
export function getAllPatients(): Patient[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('SELECT * FROM patients ORDER BY name');
    return stmt.all() as Patient[];
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
      INSERT INTO patients (name, phone_number, medical_id_number, gender) 
      VALUES (?, ?, ?, ?) RETURNING *
    `);
    return stmt.get(
      patientData.name,
      patientData.phone_number,
      patientData.medical_id_number,
      patientData.gender
    ) as Patient;
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
    return stmt.get(medicalId) as Patient | null;
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
    const updateValues: string[] = [];
    
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
    
    if (updateFields.length === 0) {
      console.error('No fields to update');
      return null;
    }
    
    // Add the id to the end of values array
    updateValues.push(id.toString());
    
    const stmt = database.prepare(`
      UPDATE patients 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `);
    
    return stmt.get(...updateValues) as Patient;
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
    return stmt.get(id) as Patient | null;
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    return null;
  }
}
