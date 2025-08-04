import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib';
import type { Prescription } from '@/lib';

// Export single prescription as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const { id, prescriptionId } = await params;
    const patientId = parseInt(id);
    const prescId = parseInt(prescriptionId);
    
    if (isNaN(patientId) || isNaN(prescId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID or prescription ID' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Get patient info
    const patientQuery = db.prepare('SELECT name FROM patients WHERE id = ?');
    const patient = patientQuery.get(patientId) as { name: string } | undefined;
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get the specific prescription
    const prescriptionQuery = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE id = ? AND patient_id = ?
    `);
    const prescription = prescriptionQuery.get(prescId, patientId) as Prescription | undefined;

    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Get medicines for the prescription
    const medicinesQuery = db.prepare(`
      SELECT 
        pm.*,
        m.name as medicine_name
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
      ORDER BY pm.id
    `);

    const prescriptionWithMedicines = {
      id: prescription.id,
      prescription_type: prescription.prescription_type,
      valid_till: prescription.valid_till || undefined,
      medicines: medicinesQuery.all(prescription.id).map((medicine: any) => ({
        medicine_id: medicine.medicine_id,
        medicine_name: medicine.medicine_name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        instructions: medicine.instructions
      }))
    };

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patient_id: patientId,
      patient_name: patient.name,
      data: {
        prescriptions: [prescriptionWithMedicines]
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    });
  } catch (error) {
    console.error('Prescription export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export prescription' },
      { status: 500 }
    );
  }
}
