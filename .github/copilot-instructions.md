# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js application with SQLite3 integration for medical tracking.

## Project Details
- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: SQLite3 with better-sqlite3
- Structure: Uses src/ directory

## Key Components
- Database connection utilities in `src/lib/db.ts`
- API routes for database operations in `src/app/api/`
- Medical data management (parameters, patients, reports)
- React components for the medical tracking interface
- SQLite database schema and initialization

## Database Schema
- **Parameters**: Medical parameter definitions with min/max ranges and units
- **Patients**: Patient information with name, phone, and medical ID
- **Reports**: Medical measurements linking patients to parameters with values and dates

## Development Guidelines
- Use TypeScript for all files
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Handle database operations with proper error handling
- Use environment variables for configuration
- Database initializes with empty tables (no sample data)
