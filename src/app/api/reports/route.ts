import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, addReport } from '@/lib/reports';

export async function GET() {
  try {
    const reports = getAllReports();
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_id, parameter_id, value, report_date } = body;

    if (!patient_id || !parameter_id || value == null || !report_date) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Value must be a number' },
        { status: 400 }
      );
    }

    const report = addReport({
      patient_id: parseInt(patient_id),
      parameter_id: parseInt(parameter_id),
      value,
      report_date
    });
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Failed to add report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add report' },
      { status: 500 }
    );
  }
}
