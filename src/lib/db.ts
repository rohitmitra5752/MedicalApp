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

    // Add sort_order column to existing parameters table if it doesn't exist
    try {
      database.prepare(`ALTER TABLE parameters ADD COLUMN sort_order INTEGER DEFAULT 0`).run();
    } catch {
      // Column already exists, ignore error
    }

    // Add sex column to existing patients table if it doesn't exist
    try {
      database.prepare(`ALTER TABLE patients ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'))`).run();
      
      // Set a default sex for existing patients that don't have one
      database.prepare(`
        UPDATE patients 
        SET gender = 'male' 
        WHERE gender IS NULL
      `).run();
      
      console.log('Added sex column and set default values for existing patients');
    } catch {
      // Column already exists, ignore error
    }

    // Migrate existing parameters table to have separate male/female ranges
    try {
      const hasOldColumns = database.prepare(`
        SELECT name FROM pragma_table_info('parameters') 
        WHERE name IN ('minimum', 'maximum')
      `).all();
      
      if (hasOldColumns.length === 2) {
        console.log('Found old parameters schema, performing migration...');
        
        // Since SQLite doesn't support ALTER COLUMN to drop NOT NULL,
        // we need to recreate the table with the new schema
        
        // 1. First, add new columns if they don't exist
        try {
          database.prepare(`ALTER TABLE parameters ADD COLUMN minimum_male REAL`).run();
          database.prepare(`ALTER TABLE parameters ADD COLUMN maximum_male REAL`).run();
          database.prepare(`ALTER TABLE parameters ADD COLUMN minimum_female REAL`).run();
          database.prepare(`ALTER TABLE parameters ADD COLUMN maximum_female REAL`).run();
        } catch {
          // Columns might already exist
        }
        
        // 2. Copy data from old columns to new columns
        try {
          database.prepare(`
            UPDATE parameters 
            SET minimum_male = minimum,
                maximum_male = maximum,
                minimum_female = minimum,
                maximum_female = maximum
            WHERE minimum_male IS NULL AND minimum IS NOT NULL
          `).run();
          
          console.log('Copied data to new sex-specific columns');
        } catch (migrationError) {
          console.log('Migration update failed:', migrationError);
        }
        
        // 3. Create new table with correct schema and migrate data
        database.exec(`
          BEGIN TRANSACTION;
          
          -- Create temporary table with new schema
          CREATE TABLE parameters_new (
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
          );
          
          -- Copy data from old table to new table
          INSERT INTO parameters_new (
            id, parameter_name, minimum_male, maximum_male, 
            minimum_female, maximum_female, unit, description, 
            category_id, sort_order, created_at
          )
          SELECT 
            id, parameter_name, 
            COALESCE(minimum_male, minimum, 0) as minimum_male,
            COALESCE(maximum_male, maximum, 0) as maximum_male,
            COALESCE(minimum_female, minimum, 0) as minimum_female,
            COALESCE(maximum_female, maximum, 0) as maximum_female,
            unit, description, category_id, 
            COALESCE(sort_order, 0) as sort_order, 
            created_at
          FROM parameters;
          
          -- Drop old table and rename new table
          DROP TABLE parameters;
          ALTER TABLE parameters_new RENAME TO parameters;
          
          COMMIT;
        `);
        
        console.log('Successfully migrated parameters table to new schema');
      }
    } catch (error) {
      console.log('Parameter migration failed or already completed:', error);
      // If migration fails, we'll fall back to the new schema for new installs
    }

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
