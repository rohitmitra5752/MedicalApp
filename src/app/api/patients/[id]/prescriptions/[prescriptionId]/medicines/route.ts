import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

interface PrescriptionMedicine {
  id: number;
  prescription_id: number;
  medicine_id: number;
  morning_count: number;
  afternoon_count: number;
  evening_count: number;
  recurrence_type: 'daily' | 'weekly' | 'interval';
  recurrence_interval: number;
  recurrence_day_of_week: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  medicine_name: string;
  medicine_strength: string | null;
  medicine_generic_name: string | null;
  medicine_brand_name: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const { id, prescriptionId } = await params;
    const patientId = parseInt(id);
    const prescriptionIdNum = parseInt(prescriptionId);
    
    if (isNaN(patientId) || isNaN(prescriptionIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID or prescription ID' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verify prescription exists and belongs to patient
    const prescriptionCheck = db.prepare(`
      SELECT id FROM prescriptions 
      WHERE id = ? AND patient_id = ?
    `);
    const prescription = prescriptionCheck.get(prescriptionIdNum, patientId);
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    // Get prescription medicines with medicine details
    const query = db.prepare(`
      SELECT 
        pm.*,
        m.name as medicine_name,
        m.strength as medicine_strength,
        m.generic_name as medicine_generic_name,
        m.brand_name as medicine_brand_name
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ? AND pm.is_active = 1
      ORDER BY m.name
    `);
    
    const medicines = query.all(prescriptionIdNum) as PrescriptionMedicine[];
    
    return NextResponse.json({
      success: true,
      medicines
    });
    
  } catch (error) {
    console.error('Error fetching prescription medicines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription medicines' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const { id, prescriptionId } = await params;
    const patientId = parseInt(id);
    const prescriptionIdNum = parseInt(prescriptionId);
    
    if (isNaN(patientId) || isNaN(prescriptionIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID or prescription ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      medicine_id, 
      morning_count = 0,
      afternoon_count = 0,
      evening_count = 0,
      recurrence_type, 
      recurrence_interval = 1,
      recurrence_day_of_week = null
    } = body;

    // Validate required fields
    if (!medicine_id || !recurrence_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'interval'].includes(recurrence_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recurrence type' },
        { status: 400 }
      );
    }

    if (morning_count < 0 || afternoon_count < 0 || evening_count < 0) {
      return NextResponse.json(
        { success: false, error: 'Counts cannot be negative' },
        { status: 400 }
      );
    }

    if (morning_count === 0 && afternoon_count === 0 && evening_count === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one count must be greater than 0' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verify prescription exists and belongs to patient
    const prescriptionCheck = db.prepare(`
      SELECT id FROM prescriptions 
      WHERE id = ? AND patient_id = ?
    `);
    const prescription = prescriptionCheck.get(prescriptionIdNum, patientId);
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Verify medicine exists
    const medicineCheck = db.prepare('SELECT id FROM medicines WHERE id = ?');
    const medicine = medicineCheck.get(medicine_id);
    
    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Medicine not found' },
        { status: 404 }
      );
    }

    // Check if combination already exists (medicine for this prescription)
    const existingCheck = db.prepare(`
      SELECT id FROM prescription_medicines 
      WHERE prescription_id = ? AND medicine_id = ? AND is_active = 1
    `);
    const existing = existingCheck.get(prescriptionIdNum, medicine_id);
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This medicine is already in this prescription' },
        { status: 409 }
      );
    }

    // Insert new prescription medicine
    const insertQuery = db.prepare(`
      INSERT INTO prescription_medicines (
        prescription_id, medicine_id, morning_count, afternoon_count, evening_count,
        recurrence_type, recurrence_interval, recurrence_day_of_week,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const result = insertQuery.run(
      prescriptionIdNum,
      medicine_id,
      morning_count,
      afternoon_count,
      evening_count,
      recurrence_type,
      recurrence_interval,
      recurrence_day_of_week
    );

    // Fetch the created prescription medicine with medicine details
    const selectQuery = db.prepare(`
      SELECT 
        pm.*,
        m.name as medicine_name,
        m.strength as medicine_strength,
        m.generic_name as medicine_generic_name,
        m.brand_name as medicine_brand_name
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.id = ?
    `);
    
    const newMedicine = selectQuery.get(result.lastInsertRowid) as PrescriptionMedicine;
    
    return NextResponse.json({
      success: true,
      medicine: newMedicine,
      message: 'Medicine added to prescription successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding medicine to prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add medicine to prescription' },
      { status: 500 }
    );
  }
}
