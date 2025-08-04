import { getDatabase } from './db';
import type { PrescriptionMedicine, MedicineInstruction, PrescriptionInstructions } from './types';

export class PrescriptionService {
  private db = getDatabase();

  /**
   * Get medicine instructions for a patient based on individual medicine schedules
   */
  getMedicineInstructions(patientId: number): PrescriptionInstructions {
    try {
      const instructions: MedicineInstruction[] = [];
      
      // Get all active prescription medicines for the patient with their execution status
      const prescriptionMedicines = this.getPrescriptionMedicinesForPatient(patientId);
      
      for (const pm of prescriptionMedicines) {
        if (this.shouldIncludeMedicine(pm)) {
          const instruction = this.createMedicineInstruction(pm);
          instructions.push(instruction);
        }
      }

      return {
        patient_id: patientId,
        instructions,
        has_instructions: instructions.length > 0
      };
    } catch (error) {
      console.error('Error getting medicine instructions:', error);
      return {
        patient_id: patientId,
        instructions: [],
        has_instructions: false
      };
    }
  }

  /**
   * Mark a specific prescription medicine as executed
   */
  markPrescriptionMedicineExecuted(prescriptionMedicineId: number): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE prescription_medicines 
        SET last_executed_date = DATE('now'), updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      const result = stmt.run(prescriptionMedicineId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error marking prescription medicine executed:', error);
      return false;
    }
  }

  /**
   * Get all active prescription medicines for a patient with prescription details
   */
  private getPrescriptionMedicinesForPatient(patientId: number): (PrescriptionMedicine & { 
    medicine_name: string; 
    medicine_strength: string | null;
    prescription_type: 'daily_monitoring' | 'weekly_refill';
  })[] {
    const stmt = this.db.prepare(`
      SELECT 
        pm.*,
        m.name as medicine_name, 
        m.strength as medicine_strength,
        p.prescription_type
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE p.patient_id = ? 
        AND pm.is_active = 1
        AND (p.valid_till IS NULL OR p.valid_till >= DATE('now'))
      ORDER BY p.prescription_type, m.name
    `);
    return stmt.all(patientId) as (PrescriptionMedicine & { 
      medicine_name: string; 
      medicine_strength: string | null;
      prescription_type: 'daily_monitoring' | 'weekly_refill';
    })[];
  }

  /**
   * Determine if a specific medicine should be included based on its individual execution status
   */
  private shouldIncludeMedicine(
    prescriptionMedicine: PrescriptionMedicine & { prescription_type: 'daily_monitoring' | 'weekly_refill' }
  ): boolean {
    const now = new Date();
    const lastExecuted = prescriptionMedicine.last_executed_date ? new Date(prescriptionMedicine.last_executed_date) : null;

    if (!lastExecuted) {
      return true; // Never executed, include medicine
    }

    const daysDiff = Math.floor((now.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24));

    // Check based on prescription type
    switch (prescriptionMedicine.prescription_type) {
      case 'daily_monitoring':
        // For daily monitoring, check individual medicine recurrence
        switch (prescriptionMedicine.recurrence_type) {
          case 'daily':
            return daysDiff >= prescriptionMedicine.recurrence_interval;
          case 'weekly':
            return daysDiff >= (prescriptionMedicine.recurrence_interval * 7);
          case 'interval':
            return daysDiff >= prescriptionMedicine.recurrence_interval;
          default:
            return false;
        }
      
      case 'weekly_refill':
        // For weekly refill, show if 7+ days have passed
        return daysDiff >= 7;
      
      default:
        return false;
    }
  }

  /**
   * Create a medicine instruction object from prescription medicine data
   */
  private createMedicineInstruction(
    prescriptionMedicine: PrescriptionMedicine & { 
      medicine_name: string; 
      medicine_strength: string | null;
      prescription_type: 'daily_monitoring' | 'weekly_refill';
    }
  ): MedicineInstruction {
    const timing: string[] = [];
    if (prescriptionMedicine.morning_count > 0) timing.push('Morning');
    if (prescriptionMedicine.afternoon_count > 0) timing.push('Afternoon');
    if (prescriptionMedicine.evening_count > 0) timing.push('Evening');

    let totalTablets = prescriptionMedicine.morning_count + 
                      prescriptionMedicine.afternoon_count + 
                      prescriptionMedicine.evening_count;

    // For weekly refill, multiply by the number of days based on recurrence
    if (prescriptionMedicine.prescription_type === 'weekly_refill') {
      const multiplier = this.getWeeklyMultiplier(prescriptionMedicine);
      totalTablets *= multiplier;
    }

    return {
      medicine_id: prescriptionMedicine.medicine_id,
      medicine_name: prescriptionMedicine.medicine_name,
      medicine_strength: prescriptionMedicine.medicine_strength,
      morning_count: prescriptionMedicine.morning_count,
      afternoon_count: prescriptionMedicine.afternoon_count,
      evening_count: prescriptionMedicine.evening_count,
      total_tablets: totalTablets,
      timing,
      prescription_type: prescriptionMedicine.prescription_type,
      prescription_id: prescriptionMedicine.prescription_id,
      prescription_medicine_id: prescriptionMedicine.id
    };
  }

  /**
   * Calculate weekly multiplier based on recurrence type
   */
  private getWeeklyMultiplier(prescriptionMedicine: PrescriptionMedicine): number {
    switch (prescriptionMedicine.recurrence_type) {
      case 'daily':
        return 7 / prescriptionMedicine.recurrence_interval;
      case 'weekly':
        return 1;
      case 'interval':
        return Math.ceil(7 / prescriptionMedicine.recurrence_interval);
      default:
        return 7;
    }
  }
}

export const prescriptionService = new PrescriptionService();
