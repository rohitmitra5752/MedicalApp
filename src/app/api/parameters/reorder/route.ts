import { NextRequest, NextResponse } from 'next/server';
import { updateParametersSortOrder } from '@/lib/parameters';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { parameters } = body;

    if (!Array.isArray(parameters)) {
      return NextResponse.json(
        { success: false, error: 'Parameters must be an array' },
        { status: 400 }
      );
    }

    // Validate that each parameter has id and sort_order
    for (const param of parameters) {
      if (typeof param.id !== 'number' || typeof param.sort_order !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each parameter must have valid id and sort_order' },
          { status: 400 }
        );
      }
    }

    const result = updateParametersSortOrder(parameters);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update parameter order' },
      { status: 500 }
    );
  }
}
