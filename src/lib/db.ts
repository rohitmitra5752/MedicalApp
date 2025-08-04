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
        last_executed_date DATE,
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

export default getDatabase;
