import { getDatabase, Medicine, MedicineSheet, MedicineWithInventory } from './db';

export interface CreateMedicineData {
  name: string;
  generic_name?: string;
  brand_name?: string;
  strength?: string;
  tablets_per_sheet: number;
  additional_details?: string;
}

export interface UpdateMedicineData {
  name?: string;
  generic_name?: string;
  brand_name?: string;
  strength?: string;
  tablets_per_sheet?: number;
  additional_details?: string;
}

export interface CreateMedicineSheetData {
  medicine_id: number;
  expiry_date: string;
}

export interface UpdateMedicineSheetData {
  consumed_tablets?: number;
  is_in_use?: boolean;
}

export class MedicineService {
  private db = getDatabase();

  // Get all medicines
  getAllMedicines(): Medicine[] {
    const stmt = this.db.prepare(`
      SELECT * FROM medicines 
      ORDER BY name, strength
    `);
    return stmt.all() as Medicine[];
  }

  // Get medicine by ID
  getMedicineById(id: number): Medicine | null {
    const stmt = this.db.prepare('SELECT * FROM medicines WHERE id = ?');
    const result = stmt.get(id) as Medicine | undefined;
    return result || null;
  }

  // Create new medicine
  createMedicine(data: CreateMedicineData): Medicine {
    const stmt = this.db.prepare(`
      INSERT INTO medicines (name, generic_name, brand_name, strength, tablets_per_sheet, additional_details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.name,
      data.generic_name || null,
      data.brand_name || null,
      data.strength || null,
      data.tablets_per_sheet,
      data.additional_details || null
    );

    const newMedicine = this.getMedicineById(result.lastInsertRowid as number);
    if (!newMedicine) {
      throw new Error('Failed to create medicine');
    }
    
    return newMedicine;
  }

  // Update medicine
  updateMedicine(id: number, data: UpdateMedicineData): Medicine {
    const currentMedicine = this.getMedicineById(id);
    if (!currentMedicine) {
      throw new Error('Medicine not found');
    }

    const updates: string[] = [];
    const values: (string | number | Date | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.generic_name !== undefined) {
      updates.push('generic_name = ?');
      values.push(data.generic_name || null);
    }
    if (data.brand_name !== undefined) {
      updates.push('brand_name = ?');
      values.push(data.brand_name || null);
    }
    if (data.strength !== undefined) {
      updates.push('strength = ?');
      values.push(data.strength || null);
    }
    if (data.tablets_per_sheet !== undefined) {
      updates.push('tablets_per_sheet = ?');
      values.push(data.tablets_per_sheet);
    }
    if (data.additional_details !== undefined) {
      updates.push('additional_details = ?');
      values.push(data.additional_details || null);
    }

    if (updates.length === 0) {
      return currentMedicine;
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE medicines 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);

    const updatedMedicine = this.getMedicineById(id);
    if (!updatedMedicine) {
      throw new Error('Failed to update medicine');
    }
    
    return updatedMedicine;
  }

  // Delete medicine
  deleteMedicine(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM medicines WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Search medicines by name
  searchMedicines(searchTerm: string): Medicine[] {
    const stmt = this.db.prepare(`
      SELECT * FROM medicines 
      WHERE name LIKE ? OR generic_name LIKE ? OR brand_name LIKE ?
      ORDER BY name, strength
    `);
    const searchPattern = `%${searchTerm}%`;
    return stmt.all(searchPattern, searchPattern, searchPattern) as Medicine[];
  }

  // Get medicine with inventory details
  getMedicineWithInventory(id: number): MedicineWithInventory | null {
    const medicine = this.getMedicineById(id);
    if (!medicine) return null;

    const sheets = this.getMedicineSheets(id);
    const total_sheets = sheets.length;
    const sheets_in_use = sheets.filter(sheet => sheet.is_in_use).length;
    const available_tablets = sheets.reduce((sum, sheet) => 
      sum + (medicine.tablets_per_sheet - sheet.consumed_tablets), 0
    );
    const expired_sheets = sheets.filter(sheet => 
      new Date(sheet.expiry_date) < new Date()
    ).length;

    return {
      ...medicine,
      sheets,
      total_sheets,
      sheets_in_use,
      available_tablets,
      expired_sheets
    };
  }

  // Get all medicines with inventory
  getAllMedicinesWithInventory(): MedicineWithInventory[] {
    const medicines = this.getAllMedicines();
    return medicines.map(medicine => {
      const sheets = this.getMedicineSheets(medicine.id);
      const total_sheets = sheets.length;
      const sheets_in_use = sheets.filter(sheet => sheet.is_in_use).length;
      const available_tablets = sheets.reduce((sum, sheet) => 
        sum + (medicine.tablets_per_sheet - sheet.consumed_tablets), 0
      );
      const expired_sheets = sheets.filter(sheet => 
        new Date(sheet.expiry_date) < new Date()
      ).length;

      return {
        ...medicine,
        sheets,
        total_sheets,
        sheets_in_use,
        available_tablets,
        expired_sheets
      };
    });
  }

  // Get medicine sheets
  getMedicineSheets(medicineId: number): MedicineSheet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM medicine_sheets 
      WHERE medicine_id = ? 
      ORDER BY expiry_date ASC
    `);
    return stmt.all(medicineId) as MedicineSheet[];
  }

  // Add new medicine sheet
  addMedicineSheet(data: CreateMedicineSheetData): MedicineSheet {
    const stmt = this.db.prepare(`
      INSERT INTO medicine_sheets (medicine_id, expiry_date)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(data.medicine_id, data.expiry_date);
    
    const newSheet = this.getMedicineSheetById(result.lastInsertRowid as number);
    if (!newSheet) {
      throw new Error('Failed to create medicine sheet');
    }
    
    return newSheet;
  }

  // Get medicine sheet by ID
  getMedicineSheetById(id: number): MedicineSheet | null {
    const stmt = this.db.prepare('SELECT * FROM medicine_sheets WHERE id = ?');
    const result = stmt.get(id) as MedicineSheet | undefined;
    return result || null;
  }

  // Update medicine sheet
  updateMedicineSheet(id: number, data: UpdateMedicineSheetData): MedicineSheet {
    const currentSheet = this.getMedicineSheetById(id);
    if (!currentSheet) {
      throw new Error('Medicine sheet not found');
    }

    const updates: string[] = [];
    const values: (string | number | Date | null)[] = [];

    if (data.consumed_tablets !== undefined) {
      updates.push('consumed_tablets = ?');
      values.push(data.consumed_tablets);
    }
    if (data.is_in_use !== undefined) {
      updates.push('is_in_use = ?');
      values.push(data.is_in_use ? 1 : 0);
    }

    if (updates.length === 0) {
      return currentSheet;
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE medicine_sheets 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);

    const updatedSheet = this.getMedicineSheetById(id);
    if (!updatedSheet) {
      throw new Error('Failed to update medicine sheet');
    }
    
    return updatedSheet;
  }

  // Delete medicine sheet
  deleteMedicineSheet(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM medicine_sheets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const medicineService = new MedicineService();
