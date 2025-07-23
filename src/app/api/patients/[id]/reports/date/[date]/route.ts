import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Delete all reports for a specific patient and date
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await params;
    const patientId = parseInt(id);
    const reportDate = date;
    
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
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

    // Delete all reports for this patient and date
    const deleteReports = database.prepare(`
      DELETE FROM reports 
      WHERE patient_id = ? AND report_date = ?
    `);
    
    const result = deleteReports.run(patientId, reportDate);

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: 'No reports found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.changes} report(s) for ${reportDate}`,
      deletedCount: result.changes
    });

  } catch (error) {
    console.error('Delete reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reports' },
      { status: 500 }
    );
  }
}
