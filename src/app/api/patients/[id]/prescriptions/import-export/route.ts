import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib';
import type { Prescription } from '@/lib';

interface ImportPrescription {
  id?: number;
  prescription_type: 'daily_monitoring' | 'weekly_refill';
  valid_till?: string;
  medicines?: ImportPrescriptionMedicine[];
}

interface ImportPrescriptionMedicine {
  medicine_id: number;
  medicine_name?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

interface ImportData {
  version: string;
  timestamp: string;
  patient_id: number;
  patient_name: string;
  data: {
    prescriptions: ImportPrescription[];
  };
}

// Export prescriptions as JSON
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
    
    // Get patient info
    const patientQuery = db.prepare('SELECT name FROM patients WHERE id = ?');
    const patient = patientQuery.get(patientId) as { name: string } | undefined;
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get all prescriptions for the patient
    const prescriptionsQuery = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE patient_id = ? 
      ORDER BY created_at DESC
    `);
    const prescriptions = prescriptionsQuery.all(patientId) as Prescription[];

    // Get medicines for each prescription
    const medicinesQuery = db.prepare(`
      SELECT 
        pm.*,
        m.name as medicine_name
      FROM prescription_medicines pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
      ORDER BY pm.id
    `);

    const prescriptionsWithMedicines = prescriptions.map(prescription => ({
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
    }));

    const exportData: ImportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patient_id: patientId,
      patient_name: patient.name,
      data: {
        prescriptions: prescriptionsWithMedicines
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    });
  } catch (error) {
    console.error('Prescription export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export prescriptions' },
      { status: 500 }
    );
  }
}

// Import prescriptions from JSON
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
    const { data: importData, overwriteExisting = false }: { 
      data: ImportData; 
      overwriteExisting?: boolean;
    } = body;

    if (!importData || !importData.data || !importData.data.prescriptions) {
      return NextResponse.json(
        { success: false, error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const db = getDatabase();
    const patientQuery = db.prepare('SELECT id FROM patients WHERE id = ?');
    const patient = patientQuery.get(patientId);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Start transaction
    const transaction = db.transaction(() => {
      const results = {
        prescriptionsImported: 0,
        prescriptionsUpdated: 0,
        prescriptionsSkipped: 0,
        medicinesImported: 0,
        medicinesUpdated: 0,
        errors: [] as string[]
      };

      const insertPrescription = db.prepare(`
        INSERT INTO prescriptions (patient_id, prescription_type, valid_till) 
        VALUES (?, ?, ?) RETURNING *
      `);

      const updatePrescription = db.prepare(`
        UPDATE prescriptions 
        SET prescription_type = ?, valid_till = ?, updated_at = datetime('now')
        WHERE id = ? RETURNING *
      `);

      const checkPrescriptionExists = db.prepare(`
        SELECT id FROM prescriptions WHERE id = ? AND patient_id = ?
      `);

      const insertPrescriptionMedicine = db.prepare(`
        INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const deletePrescriptionMedicines = db.prepare(`
        DELETE FROM prescription_medicines WHERE prescription_id = ?
      `);

      const checkMedicineExists = db.prepare(`
        SELECT id FROM medicines WHERE id = ?
      `);

      for (const prescription of importData.data.prescriptions) {
        try {
          let prescriptionId: number;
          let isUpdate = false;

          if (prescription.id && overwriteExisting) {
            // Check if prescription exists
            const existing = checkPrescriptionExists.get(prescription.id, patientId) as { id: number } | undefined;
            
            if (existing) {
              // Update existing prescription
              const updated = updatePrescription.get(
                prescription.prescription_type,
                prescription.valid_till || null,
                prescription.id
              ) as Prescription;
              prescriptionId = updated.id;
              isUpdate = true;
              results.prescriptionsUpdated++;
            } else {
              // Create new prescription (ignore provided ID)
              const created = insertPrescription.get(
                patientId,
                prescription.prescription_type,
                prescription.valid_till || null
              ) as Prescription;
              prescriptionId = created.id;
              results.prescriptionsImported++;
            }
          } else {
            // Create new prescription
            const created = insertPrescription.get(
              patientId,
              prescription.prescription_type,
              prescription.valid_till || null
            ) as Prescription;
            prescriptionId = created.id;
            results.prescriptionsImported++;
          }

          // Handle prescription medicines
          if (prescription.medicines && prescription.medicines.length > 0) {
            if (isUpdate) {
              // Clear existing medicines for updated prescription
              deletePrescriptionMedicines.run(prescriptionId);
            }

            for (const medicine of prescription.medicines) {
              try {
                // Verify medicine exists
                const medicineExists = checkMedicineExists.get(medicine.medicine_id);
                if (!medicineExists) {
                  results.errors.push(`Medicine with ID ${medicine.medicine_id} not found, skipping`);
                  continue;
                }

                insertPrescriptionMedicine.run(
                  prescriptionId,
                  medicine.medicine_id,
                  medicine.dosage,
                  medicine.frequency,
                  medicine.duration || null,
                  medicine.instructions || null
                );

                if (isUpdate) {
                  results.medicinesUpdated++;
                } else {
                  results.medicinesImported++;
                }
              } catch (error) {
                const errorMsg = `Failed to import medicine for prescription: ${error instanceof Error ? error.message : 'Unknown error'}`;
                results.errors.push(errorMsg);
              }
            }
          }

        } catch (error) {
          const errorMsg = `Failed to import prescription: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to import prescription data' },
      { status: 500 }
    );
  }
}
