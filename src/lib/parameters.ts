import { getDatabase, initializeDatabase } from './db';

export interface Parameter {
  id: number;
  parameter_name: string;
  minimum_male: number;
  maximum_male: number;
  minimum_female: number;
  maximum_female: number;
  unit: string;
  description: string;
  category_id: number;
  sort_order: number;
  created_at: string;
}

export interface ParameterWithCategory extends Parameter {
  category_name: string;
}

// Parameter operations
export function getAllParameters(): ParameterWithCategory[] {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      SELECT 
        p.*,
        pc.category_name
      FROM parameters p
      JOIN parameter_categories pc ON p.category_id = pc.id
      ORDER BY pc.category_name, p.sort_order, p.parameter_name
    `);
    return stmt.all() as ParameterWithCategory[];
  } catch (error) {
    console.error('Error fetching parameters:', error);
    return [];
  }
}

export function addParameter(parameterData: Omit<Parameter, 'id' | 'created_at'>): { success: boolean; parameter?: Parameter; error?: string } {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    const stmt = database.prepare(`
      INSERT INTO parameters (parameter_name, minimum_male, maximum_male, minimum_female, maximum_female, unit, description, category_id, sort_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `);
    
    const parameter = stmt.get(
      parameterData.parameter_name,
      parameterData.minimum_male,
      parameterData.maximum_male,
      parameterData.minimum_female,
      parameterData.maximum_female,
      parameterData.unit,
      parameterData.description,
      parameterData.category_id,
      parameterData.sort_order
    ) as Parameter;
    
    return { success: true, parameter };
  } catch (error: unknown) {
    console.error('Error adding parameter:', error);
    
    // Check for unique constraint violation on parameter_name
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: string })?.code;
    
    if (errorCode === 'SQLITE_CONSTRAINT_UNIQUE' && errorMessage.includes('parameter_name')) {
      return { 
        success: false, 
        error: `Parameter name "${parameterData.parameter_name}" already exists. Please choose a different name.` 
      };
    }
    
    // Check for foreign key constraint violation (invalid category_id)
    if (errorCode === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return { 
        success: false, 
        error: 'Invalid category selected. Please refresh the page and try again.' 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to create parameter. Please try again.' 
    };
  }
}

export function deleteParameter(id: number): boolean {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Use a transaction to ensure atomicity
    const transaction = database.transaction(() => {
      // First, delete all reports associated with this parameter
      const deleteReportsStmt = database.prepare('DELETE FROM reports WHERE parameter_id = ?');
      deleteReportsStmt.run(id);
      
      // Then, delete the parameter itself
      const deleteParameterStmt = database.prepare('DELETE FROM parameters WHERE id = ?');
      const result = deleteParameterStmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Parameter not found');
      }
      
      return result.changes > 0;
    });
    
    return transaction();
  } catch (error) {
    console.error('Error deleting parameter:', error);
    return false;
  }
}

export function updateParameter(id: number, parameterData: Partial<Omit<Parameter, 'id' | 'created_at'>>): Parameter | null {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Build dynamic UPDATE query based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number)[] = [];
    
    if (parameterData.parameter_name !== undefined) {
      updateFields.push('parameter_name = ?');
      updateValues.push(parameterData.parameter_name);
    }
    
    if (parameterData.minimum_male !== undefined) {
      updateFields.push('minimum_male = ?');
      updateValues.push(parameterData.minimum_male);
    }
    
    if (parameterData.maximum_male !== undefined) {
      updateFields.push('maximum_male = ?');
      updateValues.push(parameterData.maximum_male);
    }
    
    if (parameterData.minimum_female !== undefined) {
      updateFields.push('minimum_female = ?');
      updateValues.push(parameterData.minimum_female);
    }
    
    if (parameterData.maximum_female !== undefined) {
      updateFields.push('maximum_female = ?');
      updateValues.push(parameterData.maximum_female);
    }
    
    if (parameterData.unit !== undefined) {
      updateFields.push('unit = ?');
      updateValues.push(parameterData.unit);
    }
    
    if (parameterData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(parameterData.description);
    }
    
    if (parameterData.category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(parameterData.category_id);
    }
    
    if (parameterData.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(parameterData.sort_order);
    }
    
    if (updateFields.length === 0) {
      console.error('No fields to update');
      return null;
    }
    
    // Add the id to the end of values array
    updateValues.push(id);
    
    const stmt = database.prepare(`
      UPDATE parameters 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `);
    
    return stmt.get(...updateValues) as Parameter;
  } catch (error) {
    console.error('Error updating parameter:', error);
    return null;
  }
}

export function updateParametersSortOrder(parameters: { id: number; sort_order: number }[]): { success: boolean; error?: string } {
  try {
    const database = getDatabase();
    initializeDatabase();
    
    // Use a transaction to update all parameters atomically
    const transaction = database.transaction(() => {
      const stmt = database.prepare('UPDATE parameters SET sort_order = ? WHERE id = ?');
      
      for (const param of parameters) {
        stmt.run(param.sort_order, param.id);
      }
    });
    
    transaction();
    return { success: true };
  } catch (error) {
    console.error('Error updating parameters sort order:', error);
    return { 
      success: false, 
      error: 'Failed to update parameter order. Please try again.' 
    };
  }
}
