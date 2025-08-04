import { NextRequest, NextResponse } from 'next/server';
import { medicineService, CreateMedicineData } from '@/lib/medicines';
import { initializeDatabase } from '@/lib';

// Initialize database on API load
initializeDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const includeInventory = searchParams.get('includeInventory') === 'true';

    let medicines;
    if (includeInventory) {
      if (search) {
        // For search with inventory, we need to get all medicines with inventory first
        const allMedicinesWithInventory = medicineService.getAllMedicinesWithInventory();
        medicines = allMedicinesWithInventory.filter(medicine => 
          medicine.name.toLowerCase().includes(search.toLowerCase()) ||
          (medicine.generic_name && medicine.generic_name.toLowerCase().includes(search.toLowerCase())) ||
          (medicine.brand_name && medicine.brand_name.toLowerCase().includes(search.toLowerCase()))
        );
      } else {
        medicines = medicineService.getAllMedicinesWithInventory();
      }
    } else {
      if (search) {
        medicines = medicineService.searchMedicines(search);
      } else {
        medicines = medicineService.getAllMedicines();
      }
    }

    return NextResponse.json({ medicines }, { status: 200 });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.tablets_per_sheet || typeof body.tablets_per_sheet !== 'number' || body.tablets_per_sheet <= 0) {
      return NextResponse.json(
        { error: 'Tablets per sheet is required and must be a positive number' },
        { status: 400 }
      );
    }

    const medicineData: CreateMedicineData = {
      name: body.name.trim(),
      generic_name: body.generic_name?.trim() || undefined,
      brand_name: body.brand_name?.trim() || undefined,
      strength: body.strength?.trim() || undefined,
      tablets_per_sheet: body.tablets_per_sheet,
      additional_details: body.additional_details?.trim() || undefined,
    };

    const medicine = medicineService.createMedicine(medicineData);
    return NextResponse.json({ medicine }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating medicine:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A medicine with this name and strength already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}
