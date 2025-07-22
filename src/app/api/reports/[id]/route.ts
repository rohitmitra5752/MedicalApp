import { NextRequest, NextResponse } from 'next/server';
import { deleteReport, updateReport } from '@/lib/reports';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const success = deleteReport(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Report not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { patient_id, parameter_id, value, report_date } = body;

    // Validate that at least one field is provided
    if (patient_id === undefined && parameter_id === undefined && 
        value === undefined && report_date === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Validate data types if provided
    if (value !== undefined && typeof value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Value must be a number' },
        { status: 400 }
      );
    }

    if (patient_id !== undefined && typeof patient_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Patient ID must be a number' },
        { status: 400 }
      );
    }

    if (parameter_id !== undefined && typeof parameter_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Parameter ID must be a number' },
        { status: 400 }
      );
    }

    const updatedReport = updateReport(id, {
      patient_id,
      parameter_id,
      value,
      report_date
    });
    
    if (!updatedReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a duplicate report error
    if (error instanceof Error && error.message.includes('A report for this date already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 } // Conflict status code
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
