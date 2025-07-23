import { NextRequest, NextResponse } from 'next/server';
import { deletePatient, updatePatient, getPatientById } from '@/lib/patients';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const success = deletePatient(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Patient not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete patient' },
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
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone_number, medical_id_number, gender } = body;

    // Validate that at least one field is provided
    if (name === undefined && phone_number === undefined && medical_id_number === undefined && gender === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (gender !== undefined && gender !== 'male' && gender !== 'female') {
      return NextResponse.json(
        { success: false, error: 'Gender must be either male or female' },
        { status: 400 }
      );
    }

    const updatedPatient = updatePatient(id, {
      name: name?.trim(),
      phone_number: phone_number?.trim(),
      medical_id_number: medical_id_number?.trim(),
      gender
    });
    
    if (!updatedPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found, medical ID already exists, or failed to update' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, patient: updatedPatient });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const patient = getPatientById(id);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
