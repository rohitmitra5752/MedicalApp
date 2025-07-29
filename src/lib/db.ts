import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create database connection in db folder
const dbDir = path.join(process.cwd(), 'db');
const dbPath = path.join(dbDir, 'hello.db');
let db: Database.Database | null = null;

// Initialize database connection
export function getDatabase() {
  if (!db) {
    // Ensure db directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Initialize database schema
export function initializeDatabase() {
  try {
    const database = getDatabase();
    
    // Create parameter_categories table
    const createParameterCategoriesTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS parameter_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create parameters table
    const createParametersTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS parameters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parameter_name TEXT NOT NULL UNIQUE,
        minimum_male REAL NOT NULL,
        maximum_male REAL NOT NULL,
        minimum_female REAL NOT NULL,
        maximum_female REAL NOT NULL,
        unit TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES parameter_categories (id) ON DELETE CASCADE
      )
    `);
    
    // Create patients table
    const createPatientsTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        medical_id_number TEXT NOT NULL UNIQUE,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        is_taking_medicines BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create reports table
    const createReportsTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        parameter_id INTEGER NOT NULL,
        value REAL NOT NULL,
        report_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (parameter_id) REFERENCES parameters (id) ON DELETE CASCADE
      )
    `);

    // Create medicines table
    const createMedicinesTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        generic_name TEXT,
        brand_name TEXT,
        strength TEXT,
        tablets_per_sheet INTEGER NOT NULL,
        additional_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, strength)
      )
    `);

    // Create medicine_sheets table for inventory tracking
    const createMedicineSheetsTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS medicine_sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id INTEGER NOT NULL,
        expiry_date DATE NOT NULL,
        consumed_tablets INTEGER DEFAULT 0,
        is_in_use BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE CASCADE
      )
    `);

    // Create prescriptions table
    const createPrescriptionsTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        prescription_type TEXT NOT NULL CHECK (prescription_type IN ('daily_monitoring', 'weekly_refill')),
        valid_till DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
      )
    `);

    // Create prescription_medicines table
    const createPrescriptionMedicinesTable = database.prepare(`
      CREATE TABLE IF NOT EXISTS prescription_medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id INTEGER NOT NULL,
        medicine_id INTEGER NOT NULL,
        morning_count INTEGER DEFAULT 0 CHECK (morning_count >= 0),
        afternoon_count INTEGER DEFAULT 0 CHECK (afternoon_count >= 0),
        evening_count INTEGER DEFAULT 0 CHECK (evening_count >= 0),
        recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'interval')),
        recurrence_interval INTEGER DEFAULT 1,
        recurrence_day_of_week INTEGER CHECK (recurrence_day_of_week BETWEEN 0 AND 6),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE CASCADE,
        CHECK (morning_count > 0 OR afternoon_count > 0 OR evening_count > 0)
      )
    `);
    
    // Execute table creation
    createParameterCategoriesTable.run();
    createParametersTable.run();
    createPatientsTable.run();
    createReportsTable.run();
    createMedicinesTable.run();
    createMedicineSheetsTable.run();
    createPrescriptionsTable.run();
    createPrescriptionMedicinesTable.run();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Database interfaces
export interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

export interface Parameter {
  id: number;
  parameter_name: string;
  minimum_male: number;
  maximum_male: number;
  minimum_female: number;
  maximum_female: number;
  unit: string;
  description: string;
  category_id: number;
  sort_order: number;
  created_at: string;
}

export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
  gender: 'male' | 'female';
  is_taking_medicines: boolean;
  created_at: string;
}

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

export interface Medicine {
  id: number;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  tablets_per_sheet: number;
  additional_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineSheet {
  id: number;
  medicine_id: number;
  expiry_date: string;
  consumed_tablets: number;
  is_in_use: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineWithInventory extends Medicine {
  sheets: MedicineSheet[];
  total_sheets: number;
  sheets_in_use: number;
  available_tablets: number;
  expired_sheets: number;
}

export interface Prescription {
  id: number;
  patient_id: number;
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicine {
  id: number;
  prescription_id: number;
  medicine_id: number;
  morning_count: number;
  afternoon_count: number;
  evening_count: number;
  recurrence_type: 'daily' | 'weekly' | 'interval';
  recurrence_interval: number;
  recurrence_day_of_week: number | null; // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionWithDetails extends Prescription {
  patient_name: string;
  medicines: PrescriptionMedicineWithDetails[];
}

export interface PrescriptionMedicineWithDetails extends PrescriptionMedicine {
  medicine_name: string;
  medicine_strength: string | null;
  medicine_generic_name: string | null;
}

export default getDatabase;
