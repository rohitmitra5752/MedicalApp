import { NextRequest, NextResponse } from 'next/server';
import { prescriptionService } from '@/lib/prescriptions';

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

    const instructions = prescriptionService.getMedicineInstructions(patientId);
    
    return NextResponse.json({
      success: true,
      data: instructions
    });
    
  } catch (error) {
    console.error('Error fetching medicine instructions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medicine instructions' },
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
    const body = await request.json();
    const { prescriptionMedicineId } = body;
    
    if (isNaN(patientId) || !prescriptionMedicineId) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID or prescription medicine ID' },
        { status: 400 }
      );
    }

    const success = prescriptionService.markPrescriptionMedicineExecuted(prescriptionMedicineId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Medicine instruction marked as executed'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to mark medicine instruction as executed' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error marking medicine instruction executed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark medicine instruction as executed' },
      { status: 500 }
    );
  }
}
