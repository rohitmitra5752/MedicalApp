import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib';
import type { Prescription } from '@/lib';

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

    const db = getDatabase();
    
    // Get all prescriptions for the patient
    const query = db.prepare(`
      SELECT 
        p.*,
        pt.name as patient_name
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `);
    
    const prescriptions = query.all(patientId) as (Prescription & { patient_name: string })[];
    
    return NextResponse.json({
      success: true,
      prescriptions
    });
    
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

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
    const { prescription_type, valid_till } = body;

    // Validate required fields
    if (!prescription_type || !['daily_monitoring', 'weekly_refill'].includes(prescription_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid prescription_type is required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const db = getDatabase();
    const patientCheck = db.prepare('SELECT id FROM patients WHERE id = ?');
    const patient = patientCheck.get(patientId);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Insert new prescription
    const insertQuery = db.prepare(`
      INSERT INTO prescriptions (patient_id, prescription_type, valid_till, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const result = insertQuery.run(
      patientId,
      prescription_type,
      valid_till || null
    );

    // Fetch the created prescription
    const selectQuery = db.prepare(`
      SELECT 
        p.*,
        pt.name as patient_name
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE p.id = ?
    `);
    
    const prescription = selectQuery.get(result.lastInsertRowid) as Prescription & { patient_name: string };

    return NextResponse.json({
      success: true,
      prescription
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
