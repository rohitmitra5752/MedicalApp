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
        minimum REAL NOT NULL,
        maximum REAL NOT NULL,
        unit TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL,
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
    
    // Execute table creation
    createParameterCategoriesTable.run();
    createParametersTable.run();
    createPatientsTable.run();
    createReportsTable.run();

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
  minimum: number;
  maximum: number;
  unit: string;
  description: string;
  category_id: number;
  created_at: string;
}

export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  medical_id_number: string;
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

export default getDatabase;
