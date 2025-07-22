import { getDatabase, initializeDatabase } from './db';

export interface ParameterCategory {
  id: number;
  category_name: string;
  created_at: string;
}

// Parameter category operations
export function getAllParameterCategories(): ParameterCategory[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare('SELECT * FROM parameter_categories ORDER BY category_name');
    return stmt.all() as ParameterCategory[];
  } catch (error) {
    console.error('Error fetching parameter categories:', error);
    return [];
  }
}

export function addParameterCategory(categoryData: Omit<ParameterCategory, 'id' | 'created_at'>): { success: boolean; category?: ParameterCategory; error?: string } {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      INSERT INTO parameter_categories (category_name) 
      VALUES (?) RETURNING *
    `);
    const category = stmt.get(categoryData.category_name.trim()) as ParameterCategory;
    
    return { success: true, category };
  } catch (error: any) {
    console.error('Error adding parameter category:', error);
    
    // Check for unique constraint violation on category_name
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('category_name')) {
      return { 
        success: false, 
        error: `Category name "${categoryData.category_name}" already exists. Please choose a different name.` 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to create category. Please try again.' 
    };
  }
}

export function updateParameterCategory(id: number, categoryData: Partial<Omit<ParameterCategory, 'id' | 'created_at'>>): ParameterCategory | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    if (categoryData.category_name === undefined) {
      console.error('No fields to update');
      return null;
    }
    
    const stmt = database.prepare(`
      UPDATE parameter_categories 
      SET category_name = ? 
      WHERE id = ? 
      RETURNING *
    `);
    
    return stmt.get(categoryData.category_name.trim(), id) as ParameterCategory;
  } catch (error) {
    console.error('Error updating parameter category:', error);
    return null;
  }
}

export function deleteParameterCategory(id: number): boolean {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    console.log(`Attempting to delete parameter category with ID: ${id}`);
    
    // Use a transaction to ensure atomicity
    const transaction = database.transaction(() => {
      // First, delete all reports associated with parameters in this category
      const deleteReportsStmt = database.prepare(`
        DELETE FROM reports 
        WHERE parameter_id IN (
          SELECT id FROM parameters WHERE category_id = ?
        )
      `);
      const reportsResult = deleteReportsStmt.run(id);
      console.log(`Deleted ${reportsResult.changes} reports`);
      
      // Then, delete all parameters in this category
      const deleteParametersStmt = database.prepare('DELETE FROM parameters WHERE category_id = ?');
      const parametersResult = deleteParametersStmt.run(id);
      console.log(`Deleted ${parametersResult.changes} parameters`);
      
      // Finally, delete the category itself
      const deleteCategoryStmt = database.prepare('DELETE FROM parameter_categories WHERE id = ?');
      const result = deleteCategoryStmt.run(id);
      console.log(`Deleted category: ${result.changes} rows affected`);
      
      if (result.changes === 0) {
        throw new Error('Category not found');
      }
      
      return result.changes > 0;
    });
    
    const result = transaction();
    console.log(`Transaction completed successfully: ${result}`);
    return result;
  } catch (error) {
    console.error('Error deleting parameter category:', error);
    return false;
  }
}
