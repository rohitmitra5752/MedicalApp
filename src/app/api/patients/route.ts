import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients, addPatient } from '@/lib/patients';

export async function GET() {
  try {
    const patients = getAllPatients();
    return NextResponse.json({ success: true, patients });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone_number, medical_id_number, gender } = body;

    if (!name || !phone_number || !medical_id_number || !gender) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (gender !== 'male' && gender !== 'female') {
      return NextResponse.json(
        { success: false, error: 'Gender must be either male or female' },
        { status: 400 }
      );
    }

    const patient = addPatient({
      name: name.trim(),
      phone_number: phone_number.trim(),
      medical_id_number: medical_id_number.trim(),
      gender
    });
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Failed to add patient. Medical ID may already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add patient' },
      { status: 500 }
    );
  }
}
