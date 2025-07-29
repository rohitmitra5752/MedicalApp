import { NextRequest, NextResponse } from 'next/server';
import { medicineService } from '@/lib/medicines';

// GET /api/medicines/[id]/sheets - Get all sheets for a medicine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicineId = parseInt(id);
    
    if (isNaN(medicineId)) {
      return NextResponse.json(
        { error: 'Invalid medicine ID' },
        { status: 400 }
      );
    }

    const sheets = medicineService.getMedicineSheets(medicineId);
    
    return NextResponse.json({ sheets });
  } catch (error) {
    console.error('Error fetching medicine sheets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/medicines/[id]/sheets - Add new sheet for a medicine
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicineId = parseInt(id);
    
    if (isNaN(medicineId)) {
      return NextResponse.json(
        { error: 'Invalid medicine ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { expiry_date } = body;

    if (!expiry_date) {
      return NextResponse.json(
        { error: 'Expiry date is required' },
        { status: 400 }
      );
    }

    // Validate expiry date format
    if (isNaN(Date.parse(expiry_date))) {
      return NextResponse.json(
        { error: 'Invalid expiry date format' },
        { status: 400 }
      );
    }

    const sheet = medicineService.addMedicineSheet({
      medicine_id: medicineId,
      expiry_date
    });

    return NextResponse.json({ sheet }, { status: 201 });
  } catch (error) {
    console.error('Error adding medicine sheet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
