import { NextRequest, NextResponse } from 'next/server';
import { getReportsByPatientWithCategories } from '@/lib/reports';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const patientId = parseInt(idParam);
    
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const reports = getReportsByPatientWithCategories(patientId);
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient reports' },
      { status: 500 }
    );
  }
}
