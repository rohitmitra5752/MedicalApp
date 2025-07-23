# Next.js + SQLite3 Medical Tracking Application

A medical tracking application built with Next.js 15 and SQLite3 database integration. This project demonstrates how to create a full-stack web application for managing medical parameters, patients, and reports using modern web technologies.

## Features

- 🚀 **Next.js 15** with App Router and route groups
- 📦 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🗄️ **SQLite3** database with better-sqlite3
- 🏥 **Medical Data Management** (Parameter Categories, Parameters, Patients, Reports)
- ✨ **Real-time data management** (Create, Read, Update, Delete)
- 🔧 **Admin Panel** with comprehensive parameter and category management
- 👥 **Patient Management** with individual patient profiles and medical reports
- ♿ **Accessibility Features** with focus management and keyboard navigation
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter to submit modal forms
- 🌙 **Dark mode support**
- 📱 **Responsive design**

## Database Schema

### Parameter Categories Table
- **Category Name** (TEXT): Name of the parameter category (unique)

### Parameters Table
- **Parameter Name** (TEXT): Name of the medical parameter
- **Minimum** (REAL): Minimum acceptable value
- **Maximum** (REAL): Maximum acceptable value  
- **Unit** (TEXT): Unit of measurement
- **Description** (TEXT): Description of the parameter
- **Category ID** (INTEGER): Foreign key to parameter_categories table

### Patients Table
- **Name** (TEXT): Patient's full name
- **Phone Number** (TEXT): Patient's contact number
- **Medical ID Number** (TEXT): Unique medical identifier (not primary key)

### Reports Table
- **Patient ID** (INTEGER): Foreign key to patients table
- **Parameter ID** (INTEGER): Foreign key to parameters table
- **Value** (REAL): Measured value for the parameter
- **Report Date** (DATE): Date of the measurement

## Project Structure

```
src/
├── app/
│   ├── (pages)/                   # Page routes (UI) - Route group
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin panel - parameter & category management
│   │   └── patients/
│   │       ├── page.tsx          # Patient listing
│   │       └── [id]/
│   │           ├── page.tsx      # Individual patient details
│   │           └── add-report/
│   │               └── page.tsx  # Add medical report form
│   ├── api/                       # API routes (JSON responses)
│   │   ├── parameter-categories/  # Parameter category management
│   │   │   ├── route.ts          # GET & POST categories
│   │   │   └── [id]/route.ts     # GET, PATCH & DELETE category by ID
│   │   ├── parameters/            # Parameter management
│   │   │   ├── route.ts          # GET & POST parameters
│   │   │   └── [id]/route.ts     # GET, PATCH & DELETE parameter by ID
│   │   ├── patients/              # Patient management
│   │   │   ├── route.ts          # GET & POST patients
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH & DELETE patient by ID
│   │   │       └── reports/
│   │   │           └── route.ts  # GET patient reports
│   │   └── reports/               # Report management
│   │       ├── route.ts          # GET & POST reports
│   │       └── [id]/route.ts     # GET, PATCH & DELETE report by ID
│   ├── page.tsx                   # Home page with dashboard tiles
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles and Tailwind imports
│   └── favicon.ico                # Site icon
├── components/
│   ├── Modal.tsx                  # Base modal component with focus management
│   └── ConfirmationModal.tsx      # Specialized confirmation dialog
├── hooks/
│   ├── modalFocusManager.ts       # Global focus manager for modals
│   └── useFocusTrap.ts           # React hook for focus trapping
└── lib/
    ├── db.ts                      # Database connection and schema
    ├── parameter-categories.ts    # Parameter category operations
    ├── parameters.ts              # Parameter operations
    ├── patients.ts                # Patient operations
    ├── reports.ts                 # Report operations
    └── index.ts                   # Centralized exports
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

The application uses SQLite3 with the `better-sqlite3` library for optimal performance. The database file (`hello.db`) is automatically created in a `db/` folder in the project root when you first run the application.

### Database Schema

```sql
-- Parameter categories table
CREATE TABLE parameter_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parameters table
CREATE TABLE parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parameter_name TEXT NOT NULL,
  minimum REAL NOT NULL,
  maximum REAL NOT NULL,
  unit TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES parameter_categories (id) ON DELETE CASCADE
);

-- Patients table  
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  medical_id_number TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  parameter_id INTEGER NOT NULL,
  value REAL NOT NULL,
  report_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  FOREIGN KEY (parameter_id) REFERENCES parameters (id) ON DELETE CASCADE
);
```

### Sample Data

The application initializes with empty tables. You can add your own parameters, patients, and reports through the API endpoints or UI.

### Features

- **View Data**: Display all parameter categories, parameters, patients, and reports from the database
- **Category Management**: Create and organize medical parameters into logical categories
- **Parameter Management**: Define medical parameters with ranges, units, and descriptions
- **Patient Management**: Maintain patient records with contact information and medical IDs
- **Medical Reports**: Record and track medical measurements linking patients to parameters
- **Admin Panel**: Comprehensive administration interface with accordion-style category management
- **Individual Patient Views**: Detailed patient profiles with medical history and report management
- **Add Medical Reports**: User-friendly forms for recording new medical measurements
- **Update Records**: Modify existing records with partial updates (only provide fields you want to change)
- **Delete Records**: Remove records from any table with confirmation dialogs
- **Relationship Management**: Reports link patients with parameters and values with full relational integrity
- **Data Validation**: Proper validation for medical data ranges and types
- **Accessibility**: Full keyboard navigation and screen reader support with focus management
- **Auto-initialization**: Database and tables are created automatically with empty tables ready for data entry

## API Endpoints

### Parameter Categories
- `GET /api/parameter-categories` - Fetch all parameter categories
- `POST /api/parameter-categories` - Add a new parameter category
- `GET /api/parameter-categories/[id]` - Get a specific parameter category
- `PATCH /api/parameter-categories/[id]` - Update an existing parameter category
- `DELETE /api/parameter-categories/[id]` - Delete a parameter category by ID

### Parameters
- `GET /api/parameters` - Fetch all parameters with category information
- `POST /api/parameters` - Add a new parameter
- `GET /api/parameters/[id]` - Get a specific parameter
- `PATCH /api/parameters/[id]` - Update an existing parameter (partial updates supported)
- `DELETE /api/parameters/[id]` - Delete a parameter by ID

### Patients  
- `GET /api/patients` - Fetch all patients
- `POST /api/patients` - Add a new patient
- `GET /api/patients/[id]` - Get a specific patient
- `PATCH /api/patients/[id]` - Update an existing patient (partial updates supported)
- `DELETE /api/patients/[id]` - Delete a patient by ID
- `GET /api/patients/[id]/reports` - Get all reports for a specific patient

### Reports
- `GET /api/reports` - Fetch all reports with patient and parameter details
- `POST /api/reports` - Add a new report
- `GET /api/reports/[id]` - Get a specific report
- `PATCH /api/reports/[id]` - Update an existing report (partial updates supported)
- `DELETE /api/reports/[id]` - Delete a report by ID

## Keyboard Shortcuts

The application includes keyboard shortcuts to improve productivity:

### Modal Dialogs
- **Ctrl+Enter** (or **Cmd+Enter** on Mac) - Submit forms or trigger primary actions in modal dialogs
  - Works with report forms, parameter forms, category forms, confirmation dialogs, and more
  - Automatically detects submit buttons, action buttons (Save, Create, Update, Confirm, OK), or triggers form submission
  - See [MODAL_SHORTCUTS.md](MODAL_SHORTCUTS.md) for detailed documentation

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite3 with better-sqlite3
- **Font**: Geist (optimized with next/font)

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3) - learn about SQLite integration

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
