import { NextRequest, NextResponse } from 'next/server';
import { medicineService } from '@/lib/medicines';

// PUT /api/medicines/sheets/[id] - Update a medicine sheet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheetId = parseInt(id);
    
    if (isNaN(sheetId)) {
      return NextResponse.json(
        { error: 'Invalid sheet ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { consumed_tablets, is_in_use } = body;

    // Validate consumed_tablets if provided
    if (consumed_tablets !== undefined && (typeof consumed_tablets !== 'number' || consumed_tablets < 0)) {
      return NextResponse.json(
        { error: 'Consumed tablets must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate is_in_use if provided
    if (is_in_use !== undefined && typeof is_in_use !== 'boolean') {
      return NextResponse.json(
        { error: 'is_in_use must be a boolean' },
        { status: 400 }
      );
    }

    const sheet = medicineService.updateMedicineSheet(sheetId, {
      consumed_tablets,
      is_in_use
    });

    return NextResponse.json({ sheet });
  } catch (error) {
    console.error('Error updating medicine sheet:', error);
    if (error instanceof Error && error.message === 'Medicine sheet not found') {
      return NextResponse.json(
        { error: 'Medicine sheet not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/medicines/sheets/[id] - Delete a medicine sheet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheetId = parseInt(id);
    
    if (isNaN(sheetId)) {
      return NextResponse.json(
        { error: 'Invalid sheet ID' },
        { status: 400 }
      );
    }

    const success = medicineService.deleteMedicineSheet(sheetId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Medicine sheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Medicine sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine sheet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
