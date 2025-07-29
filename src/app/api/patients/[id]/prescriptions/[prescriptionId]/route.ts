import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Prescription } from '@/lib/db';

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
    
    // Get specific prescription
    const query = db.prepare(`
      SELECT 
        p.*,
        pt.name as patient_name
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE p.id = ? AND p.patient_id = ?
    `);
    
    const prescription = query.get(prescriptionIdNum, patientId) as (Prescription & { patient_name: string }) | undefined;
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      prescription
    });
    
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { prescription_type, valid_till } = body;

    // Validate required fields
    if (!prescription_type || !['daily_monitoring', 'weekly_refill'].includes(prescription_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid prescription_type is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if prescription exists and belongs to the patient
    const checkQuery = db.prepare('SELECT id FROM prescriptions WHERE id = ? AND patient_id = ?');
    const existingPrescription = checkQuery.get(prescriptionIdNum, patientId);
    
    if (!existingPrescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Update prescription
    const updateQuery = db.prepare(`
      UPDATE prescriptions 
      SET prescription_type = ?, valid_till = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND patient_id = ?
    `);
    
    updateQuery.run(
      prescription_type,
      valid_till || null,
      prescriptionIdNum,
      patientId
    );

    // Fetch the updated prescription
    const selectQuery = db.prepare(`
      SELECT 
        p.*,
        pt.name as patient_name
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE p.id = ? AND p.patient_id = ?
    `);
    
    const prescription = selectQuery.get(prescriptionIdNum, patientId) as Prescription & { patient_name: string };

    return NextResponse.json({
      success: true,
      prescription
    });
    
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Check if prescription exists and belongs to the patient
    const checkQuery = db.prepare('SELECT id FROM prescriptions WHERE id = ? AND patient_id = ?');
    const existingPrescription = checkQuery.get(prescriptionIdNum, patientId);
    
    if (!existingPrescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Delete prescription (this will also delete related prescription_medicines due to CASCADE)
    const deleteQuery = db.prepare('DELETE FROM prescriptions WHERE id = ? AND patient_id = ?');
    deleteQuery.run(prescriptionIdNum, patientId);

    return NextResponse.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prescription' },
      { status: 500 }
    );
  }
}
