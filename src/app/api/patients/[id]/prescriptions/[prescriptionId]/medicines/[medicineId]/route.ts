import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string; medicineId: string }> }
) {
  try {
    const { id, prescriptionId, medicineId } = await params;
    const patientId = parseInt(id);
    const prescriptionIdNum = parseInt(prescriptionId);
    const medicineIdNum = parseInt(medicineId);
    
    if (isNaN(patientId) || isNaN(prescriptionIdNum) || isNaN(medicineIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID, prescription ID, or medicine ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      morning_count = 0,
      afternoon_count = 0,
      evening_count = 0,
      recurrence_type, 
      recurrence_interval = 1,
      recurrence_day_of_week = null
    } = body;

    // Validate required fields
    if (!recurrence_type) {
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
    
    // Verify prescription medicine exists and belongs to the right prescription/patient
    const checkQuery = db.prepare(`
      SELECT pm.id, pm.medicine_id
      FROM prescription_medicines pm
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE pm.id = ? AND p.id = ? AND p.patient_id = ? AND pm.is_active = 1
    `);
    const existingMedicine = checkQuery.get(medicineIdNum, prescriptionIdNum, patientId) as { id: number; medicine_id: number } | undefined;
    
    if (!existingMedicine) {
      return NextResponse.json(
        { success: false, error: 'Prescription medicine not found' },
        { status: 404 }
      );
    }

    // Update prescription medicine
    const updateQuery = db.prepare(`
      UPDATE prescription_medicines 
      SET morning_count = ?, afternoon_count = ?, evening_count = ?, recurrence_type = ?, 
          recurrence_interval = ?, recurrence_day_of_week = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateQuery.run(
      morning_count,
      afternoon_count,
      evening_count,
      recurrence_type,
      recurrence_interval,
      recurrence_day_of_week,
      medicineIdNum
    );

    // Fetch updated prescription medicine with medicine details
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
    
    const updatedMedicine = selectQuery.get(medicineIdNum);
    
    return NextResponse.json({
      success: true,
      medicine: updatedMedicine,
      message: 'Prescription medicine updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating prescription medicine:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prescription medicine' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string; medicineId: string }> }
) {
  try {
    const { id, prescriptionId, medicineId } = await params;
    const patientId = parseInt(id);
    const prescriptionIdNum = parseInt(prescriptionId);
    const medicineIdNum = parseInt(medicineId);
    
    if (isNaN(patientId) || isNaN(prescriptionIdNum) || isNaN(medicineIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID, prescription ID, or medicine ID' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verify prescription medicine exists and belongs to the right prescription/patient
    const checkQuery = db.prepare(`
      SELECT pm.id
      FROM prescription_medicines pm
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE pm.id = ? AND p.id = ? AND p.patient_id = ? AND pm.is_active = 1
    `);
    const existingMedicine = checkQuery.get(medicineIdNum, prescriptionIdNum, patientId) as { id: number } | undefined;
    
    if (!existingMedicine) {
      return NextResponse.json(
        { success: false, error: 'Prescription medicine not found' },
        { status: 404 }
      );
    }

    // Soft delete (set is_active to 0)
    const deleteQuery = db.prepare(`
      UPDATE prescription_medicines 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    deleteQuery.run(medicineIdNum);
    
    return NextResponse.json({
      success: true,
      message: 'Prescription medicine removed successfully'
    });
    
  } catch (error) {
    console.error('Error deleting prescription medicine:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove prescription medicine' },
      { status: 500 }
    );
  }
}
