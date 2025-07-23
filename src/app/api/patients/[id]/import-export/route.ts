import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

interface ExportReport {
  parameter_name: string;
  value: number;
  test_date: string;
}

interface ExportData {
  version: string;
  timestamp: string;
  patient: {
    name: string;
    phone: string;
    medical_id: string;
  };
  reports: ExportReport[];
}

interface ImportReport {
  parameter_name: string;
  value: number;
  test_date: string;
}

interface ImportData {
  version: string;
  timestamp: string;
  patient: {
    name: string;
    phone: string;
    medical_id: string;
  };
  reports: ImportReport[];
}

// Export patient data as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);
    
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    
    // Get patient info
    const getPatient = database.prepare(`
      SELECT name, phone_number as phone, medical_id_number as medical_id FROM patients WHERE id = ?
    `);
    
    const patient = getPatient.get(patientId) as { name: string; phone: string; medical_id: string } | undefined;
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get patient reports with parameter names
    const getReports = database.prepare(`
      SELECT 
        p.parameter_name,
        r.value,
        r.report_date as test_date
      FROM reports r
      JOIN parameters p ON r.parameter_id = p.id
      WHERE r.patient_id = ?
      ORDER BY r.report_date DESC, p.parameter_name
    `);

    const reports = getReports.all(patientId) as ExportReport[];

    const exportData: ExportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patient,
      reports
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export patient data' },
      { status: 500 }
    );
  }
}

// Import patient data from JSON
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);
    
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { data: importData, overwriteExisting = false }: { data: ImportData; overwriteExisting?: boolean } = body;

    if (!importData || !importData.reports) {
      return NextResponse.json(
        { success: false, error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    
    // Verify patient exists
    const checkPatient = database.prepare(`
      SELECT id FROM patients WHERE id = ?
    `);
    
    const patient = checkPatient.get(patientId) as { id: number } | undefined;
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Start transaction
    const transaction = database.transaction(() => {
      const results = {
        reportsImported: 0,
        reportsUpdated: 0,
        reportsSkipped: 0,
        errors: [] as string[]
      };

      // Prepare statements
      const getParameterByName = database.prepare(`
        SELECT id FROM parameters WHERE parameter_name = ?
      `);

      const checkExistingReport = database.prepare(`
        SELECT id, value FROM reports 
        WHERE patient_id = ? AND parameter_id = ? AND report_date = ?
      `);

      const insertReport = database.prepare(`
        INSERT INTO reports (patient_id, parameter_id, value, report_date)
        VALUES (?, ?, ?, ?)
      `);

      const updateReport = database.prepare(`
        UPDATE reports 
        SET value = ?
        WHERE id = ?
      `);

      for (const report of importData.reports) {
        try {
          // Find parameter ID by name
          const parameter = getParameterByName.get(report.parameter_name) as { id: number } | undefined;
          
          if (!parameter) {
            results.errors.push(`Parameter '${report.parameter_name}' not found`);
            continue;
          }

          // Check if report already exists (same patient, parameter, and date)
          const existing = checkExistingReport.get(
            patientId,
            parameter.id,
            report.test_date
          ) as { id: number; value: number } | undefined;

          if (existing) {
            if (overwriteExisting) {
              // Update existing report
              updateReport.run(
                report.value,
                existing.id
              );
              results.reportsUpdated++;
            } else {
              // Skip existing report
              results.reportsSkipped++;
            }
          } else {
            // Insert new report
            insertReport.run(
              patientId,
              parameter.id,
              report.value,
              report.test_date
            );
            results.reportsImported++;
          }

        } catch (error) {
          const errorMsg = `Failed to import report for '${report.parameter_name}' on ${report.test_date}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
        }
      }

      return results;
    });

    const results = transaction();

    return NextResponse.json({
      success: true,
      message: 'Import completed successfully',
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to import patient data' },
      { status: 500 }
    );
  }
}
