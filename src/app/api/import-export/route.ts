import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib';
import { getAllParameterCategories } from '@/lib/parameter-categories';
import { getAllParameters } from '@/lib/parameters';

interface ImportCategory {
  id?: number;
  category_name: string;
}

interface ImportParameter {
  parameter_name: string;
  minimum: number;
  maximum: number;
  unit: string;
  description: string;
  category_id: number;
  category_name?: string;
}

interface ImportData {
  version: string;
  timestamp: string;
  data: {
    categories: ImportCategory[];
    parameters: ImportParameter[];
  };
}

// Export data as JSON
export async function GET() {
  try {
    const categories = getAllParameterCategories();
    const parameters = getAllParameters();

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        categories,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        parameters: parameters.map(({ category_name: _category_name, ...param }) => param) // Remove category_name from export
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// Import data from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: importData, skipDuplicates = false }: { data: ImportData; skipDuplicates?: boolean } = body;

    if (!importData || !importData.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    
    // Start transaction
    const transaction = database.transaction(() => {
      const results = {
        categoriesImported: 0,
        parametersImported: 0,
        categoriesSkipped: 0,
        parametersSkipped: 0,
        errors: [] as string[]
      };

      // Import categories first
      const insertCategory = database.prepare(`
        INSERT INTO parameter_categories (category_name) 
        VALUES (?) RETURNING *
      `);

      const checkCategoryExists = database.prepare(`
        SELECT id FROM parameter_categories WHERE category_name = ?
      `);

      const categoryMap = new Map<string, number>(); // Map category_name to id
      const categoryIdMap = new Map<number, number>(); // Map old category_id to new category_id

      for (const category of importData.data.categories || []) {
        try {
          const existing = checkCategoryExists.get(category.category_name) as { id: number } | undefined;
          
          if (existing) {
            if (skipDuplicates) {
              results.categoriesSkipped++;
              categoryMap.set(category.category_name, existing.id);
              // Map the old category ID to the existing one
              if ('id' in category) {
                categoryIdMap.set((category as { id: number }).id, existing.id);
              }
              continue;
            } else {
              throw new Error(`Category '${category.category_name}' already exists`);
            }
          }

          const newCategory = insertCategory.get(category.category_name) as { id: number };
          categoryMap.set(category.category_name, newCategory.id);
          // Map the old category ID to the new one
          if ('id' in category) {
            categoryIdMap.set((category as { id: number }).id, newCategory.id);
          }
          results.categoriesImported++;
        } catch (error) {
          const errorMsg = `Failed to import category '${category.category_name}': ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          
          if (!skipDuplicates) {
            throw new Error(errorMsg);
          }
        }
      }

      // Import parameters
      const insertParameter = database.prepare(`
        INSERT INTO parameters (parameter_name, minimum, maximum, unit, description, category_id) 
        VALUES (?, ?, ?, ?, ?, ?) RETURNING *
      `);

      const checkParameterExists = database.prepare(`
        SELECT id FROM parameters WHERE parameter_name = ?
      `);

      const getCategoryByName = database.prepare(`
        SELECT id FROM parameter_categories WHERE category_name = ?
      `);

      for (const parameter of importData.data.parameters || []) {
        try {
          const existing = checkParameterExists.get(parameter.parameter_name) as { id: number } | undefined;
          
          if (existing) {
            if (skipDuplicates) {
              results.parametersSkipped++;
              continue;
            } else {
              throw new Error(`Parameter '${parameter.parameter_name}' already exists`);
            }
          }

          // Find the category ID
          let categoryId = parameter.category_id;
          
          // First try to map the old category_id to new category_id
          if (categoryIdMap.has(parameter.category_id)) {
            categoryId = categoryIdMap.get(parameter.category_id)!;
          }
          // If we have a category_name in the parameter, look it up as fallback
          else if (parameter.category_name) {
            const category = getCategoryByName.get(parameter.category_name) as { id: number } | undefined;
            if (!category) {
              throw new Error(`Category '${parameter.category_name}' not found for parameter '${parameter.parameter_name}'`);
            }
            categoryId = category.id;
          }
          // Final fallback: check if the original category_id exists in the database
          else {
            const categoryExists = database.prepare('SELECT id FROM parameter_categories WHERE id = ?').get(categoryId);
            if (!categoryExists) {
              throw new Error(`Category with ID ${categoryId} not found for parameter '${parameter.parameter_name}'`);
            }
          }

          insertParameter.run(
            parameter.parameter_name,
            parameter.minimum,
            parameter.maximum,
            parameter.unit,
            parameter.description,
            categoryId
          );
          
          results.parametersImported++;
        } catch (error) {
          const errorMsg = `Failed to import parameter '${parameter.parameter_name}': ${error instanceof Error ? error.message : 'Unknown error'}`;
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
      message: 'Import completed successfully',
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to import data' },
      { status: 500 }
    );
  }
}
