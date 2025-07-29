import { NextRequest, NextResponse } from 'next/server';
import { medicineService, UpdateMedicineData } from '@/lib/medicines';

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

    const medicine = medicineService.getMedicineById(medicineId);
    
    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ medicine }, { status: 200 });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicine' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    // Validate tablets_per_sheet if provided
    if (body.tablets_per_sheet !== undefined) {
      if (typeof body.tablets_per_sheet !== 'number' || body.tablets_per_sheet <= 0) {
        return NextResponse.json(
          { error: 'Tablets per sheet must be a positive number' },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateMedicineData = {
      name: body.name?.trim(),
      generic_name: body.generic_name?.trim(),
      brand_name: body.brand_name?.trim(),
      strength: body.strength?.trim(),
      tablets_per_sheet: body.tablets_per_sheet,
      additional_details: body.additional_details?.trim(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateMedicineData] === undefined) {
        delete updateData[key as keyof UpdateMedicineData];
      }
    });

    const medicine = medicineService.updateMedicine(medicineId, updateData);
    return NextResponse.json({ medicine }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating medicine:', error);
    
    if (error instanceof Error && error.message === 'Medicine not found') {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    // Handle unique constraint violation
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A medicine with this name and strength already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update medicine' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deleted = medicineService.deleteMedicine(medicineId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Medicine deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { error: 'Failed to delete medicine' },
      { status: 500 }
    );
  }
}
