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
    const { parameter_name, minimum, maximum, unit, description, category_id } = body;

    // Validate that at least one field is provided
    if (parameter_name === undefined && minimum === undefined && 
        maximum === undefined && unit === undefined && description === undefined && category_id === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Validate data types if provided
    if (minimum !== undefined && typeof minimum !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Minimum must be a number' },
        { status: 400 }
      );
    }

    if (maximum !== undefined && typeof maximum !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Maximum must be a number' },
        { status: 400 }
      );
    }

    if (category_id !== undefined && typeof category_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Category ID must be a number' },
        { status: 400 }
      );
    }

    // Validate minimum < maximum if both are provided
    if (minimum !== undefined && maximum !== undefined && minimum >= maximum) {
      return NextResponse.json(
        { success: false, error: 'Minimum must be less than maximum' },
        { status: 400 }
      );
    }

    const updatedParameter = updateParameter(id, {
      parameter_name: parameter_name?.trim(),
      minimum,
      maximum,
      unit: unit?.trim(),
      description: description?.trim(),
      category_id
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
