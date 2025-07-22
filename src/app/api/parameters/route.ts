import { NextRequest, NextResponse } from 'next/server';
import { getAllParameters, addParameter } from '@/lib/parameters';

export async function GET() {
  try {
    const parameters = getAllParameters();
    return NextResponse.json({ success: true, parameters });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parameters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('API: POST /api/parameters called');
  
  try {
    const body = await request.json();
    console.log('API: Request body:', body);
    
    const { parameter_name, minimum, maximum, unit, description, category_id } = body;

    if (!parameter_name || minimum == null || maximum == null || !unit || !description || !category_id) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'All fields including category_id are required' },
        { status: 400 }
      );
    }

    if (typeof minimum !== 'number' || typeof maximum !== 'number') {
      console.log('API: Invalid number types for min/max');
      return NextResponse.json(
        { success: false, error: 'Minimum and maximum must be numbers' },
        { status: 400 }
      );
    }

    if (typeof category_id !== 'number') {
      console.log('API: Invalid category_id type');
      return NextResponse.json(
        { success: false, error: 'Category ID must be a number' },
        { status: 400 }
      );
    }

    if (minimum >= maximum) {
      console.log('API: Invalid range - minimum >= maximum');
      return NextResponse.json(
        { success: false, error: 'Minimum must be less than maximum' },
        { status: 400 }
      );
    }

    console.log('API: Adding parameter with data:', { parameter_name, minimum, maximum, unit, description, category_id });

    const parameter = addParameter({
      parameter_name: parameter_name.trim(),
      minimum,
      maximum,
      unit: unit.trim(),
      description: description.trim(),
      category_id
    });
    
    console.log('API: Parameter creation result:', parameter);
    
    if (!parameter) {
      console.log('API: Parameter creation failed');
      return NextResponse.json(
        { success: false, error: 'Failed to add parameter. Category may not exist.' },
        { status: 500 }
      );
    }

    console.log('API: Parameter created successfully with ID:', parameter.id);
    return NextResponse.json({ success: true, parameter }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add parameter' },
      { status: 500 }
    );
  }
}
