import { NextRequest, NextResponse } from 'next/server';
import { deleteParameter, updateParameter } from '@/lib/parameters';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameter ID' },
        { status: 400 }
      );
    }

    const success = deleteParameter(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Parameter not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete parameter' },
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
        { success: false, error: 'Invalid parameter ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { parameter_name, minimum_male, maximum_male, minimum_female, maximum_female, unit, description, category_id, sort_order } = body;

    // Validate that at least one field is provided
    if (parameter_name === undefined && minimum_male === undefined && 
        maximum_male === undefined && minimum_female === undefined && 
        maximum_female === undefined && unit === undefined && description === undefined && 
        category_id === undefined && sort_order === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Validate data types if provided
    if (minimum_male !== undefined && typeof minimum_male !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Male minimum must be a number' },
        { status: 400 }
      );
    }

    if (maximum_male !== undefined && typeof maximum_male !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Male maximum must be a number' },
        { status: 400 }
      );
    }

    if (minimum_female !== undefined && typeof minimum_female !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Female minimum must be a number' },
        { status: 400 }
      );
    }

    if (maximum_female !== undefined && typeof maximum_female !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Female maximum must be a number' },
        { status: 400 }
      );
    }

    if (category_id !== undefined && typeof category_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Category ID must be a number' },
        { status: 400 }
      );
    }

    if (sort_order !== undefined && typeof sort_order !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Sort order must be a number' },
        { status: 400 }
      );
    }

    // Validate minimum < maximum for male range if both are provided
    if (minimum_male !== undefined && maximum_male !== undefined && minimum_male >= maximum_male) {
      return NextResponse.json(
        { success: false, error: 'Male minimum must be less than male maximum' },
        { status: 400 }
      );
    }

    // Validate minimum < maximum for female range if both are provided
    if (minimum_female !== undefined && maximum_female !== undefined && minimum_female >= maximum_female) {
      return NextResponse.json(
        { success: false, error: 'Female minimum must be less than female maximum' },
        { status: 400 }
      );
    }

    const updatedParameter = updateParameter(id, {
      parameter_name: parameter_name?.trim(),
      minimum_male,
      maximum_male,
      minimum_female,
      maximum_female,
      unit: unit?.trim(),
      description: description?.trim(),
      category_id,
      sort_order
    });
    
    if (!updatedParameter) {
      return NextResponse.json(
        { success: false, error: 'Parameter not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, parameter: updatedParameter });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update parameter' },
      { status: 500 }
    );
  }
}
