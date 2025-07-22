import { NextRequest, NextResponse } from 'next/server';
import { deleteParameterCategory, updateParameterCategory } from '@/lib/parameter-categories';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameter category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { category_name } = body;

    if (!category_name || typeof category_name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const updatedCategory = updateParameterCategory(id, {
      category_name: category_name.trim()
    });
    
    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Parameter category not found, name already exists, or failed to update' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update parameter category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    console.log(`API: Attempting to delete parameter category with ID: ${id}`);
    
    if (isNaN(id)) {
      console.log('API: Invalid parameter category ID');
      return NextResponse.json(
        { success: false, error: 'Invalid parameter category ID' },
        { status: 400 }
      );
    }

    const success = deleteParameterCategory(id);
    console.log(`API: Delete operation result: ${success}`);
    
    if (!success) {
      console.log('API: Parameter category not found or failed to delete');
      return NextResponse.json(
        { success: false, error: 'Parameter category not found, has associated parameters, or failed to delete' },
        { status: 404 }
      );
    }

    console.log('API: Parameter category deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete parameter category' },
      { status: 500 }
    );
  }
}
