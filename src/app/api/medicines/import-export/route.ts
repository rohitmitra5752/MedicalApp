import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib';
import { medicineService } from '@/lib/medicines';

interface ImportMedicine {
  id?: number;
  name: string;
  generic_name?: string;
  brand_name?: string;
  strength?: string;
  tablets_per_sheet: number;
  additional_details?: string;
}

interface ImportData {
  version: string;
  timestamp: string;
  data: {
    medicines: ImportMedicine[];
  };
}

// Export medicines as JSON
export async function GET() {
  try {
    const medicines = medicineService.getAllMedicines();

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        medicines: medicines.map(medicine => ({
          id: medicine.id,
          name: medicine.name,
          generic_name: medicine.generic_name,
          brand_name: medicine.brand_name,
          strength: medicine.strength,
          tablets_per_sheet: medicine.tablets_per_sheet,
          additional_details: medicine.additional_details
        }))
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    });
  } catch (error) {
    console.error('Medicine export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export medicines' },
      { status: 500 }
    );
  }
}

// Import medicines from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: importData, skipDuplicates = false }: { data: ImportData; skipDuplicates?: boolean } = body;

    if (!importData || !importData.data || !importData.data.medicines) {
      return NextResponse.json(
        { success: false, error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    
    // Start transaction
    const transaction = database.transaction(() => {
      const results = {
        medicinesImported: 0,
        medicinesSkipped: 0,
        errors: [] as string[]
      };

      // Import medicines
      const insertMedicine = database.prepare(`
        INSERT INTO medicines (name, generic_name, brand_name, strength, tablets_per_sheet, additional_details) 
        VALUES (?, ?, ?, ?, ?, ?) RETURNING *
      `);

      const checkMedicineExists = database.prepare(`
        SELECT id FROM medicines WHERE name = ? AND COALESCE(strength, '') = COALESCE(?, '')
      `);

      for (const medicine of importData.data.medicines) {
        try {
          // Check if medicine already exists (by name and strength combination)
          const existing = checkMedicineExists.get(medicine.name, medicine.strength || '') as { id: number } | undefined;
          
          if (existing) {
            if (skipDuplicates) {
              results.medicinesSkipped++;
              continue;
            } else {
              const strengthText = medicine.strength ? ` (${medicine.strength})` : '';
              throw new Error(`Medicine '${medicine.name}${strengthText}' already exists`);
            }
          }

          // Insert medicine (without the old ID, let database generate new one)
          insertMedicine.run(
            medicine.name,
            medicine.generic_name || null,
            medicine.brand_name || null,
            medicine.strength || null,
            medicine.tablets_per_sheet,
            medicine.additional_details || null
          );
          
          results.medicinesImported++;
        } catch (error) {
          const strengthText = medicine.strength ? ` (${medicine.strength})` : '';
          const errorMsg = `Failed to import medicine '${medicine.name}${strengthText}': ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          
          if (!skipDuplicates) {
            throw new Error(errorMsg);
          }
        }
      }

      return results;
    });

    const results = transaction();

    return NextResponse.json({ 
      success: true, 
      message: 'Medicine import completed successfully',
      results
    });

  } catch (error) {
    console.error('Medicine import error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to import medicines' },
      { status: 500 }
    );
  }
}
