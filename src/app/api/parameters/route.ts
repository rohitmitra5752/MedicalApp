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
    
    const { parameter_name, minimum_male, maximum_male, minimum_female, maximum_female, unit, description, category_id, sort_order } = body;

    if (!parameter_name || minimum_male == null || maximum_male == null || minimum_female == null || maximum_female == null || !unit || !description || !category_id) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'All fields including category_id are required' },
        { status: 400 }
      );
    }

    if (typeof minimum_male !== 'number' || typeof maximum_male !== 'number' || typeof minimum_female !== 'number' || typeof maximum_female !== 'number') {
      console.log('API: Invalid number types for min/max values');
      return NextResponse.json(
        { success: false, error: 'All minimum and maximum values must be numbers' },
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

    if (minimum_male >= maximum_male) {
      console.log('API: Invalid male range - minimum >= maximum');
      return NextResponse.json(
        { success: false, error: 'Male minimum must be less than male maximum' },
        { status: 400 }
      );
    }

    if (minimum_female >= maximum_female) {
      console.log('API: Invalid female range - minimum >= maximum');
      return NextResponse.json(
        { success: false, error: 'Female minimum must be less than female maximum' },
        { status: 400 }
      );
    }

    console.log('API: Adding parameter with data:', { parameter_name, minimum_male, maximum_male, minimum_female, maximum_female, unit, description, category_id, sort_order });

    const result = addParameter({
      parameter_name: parameter_name.trim(),
      minimum_male,
      maximum_male,
      minimum_female,
      maximum_female,
      unit: unit.trim(),
      description: description.trim(),
      category_id,
      sort_order: sort_order || 0
    });
    
    console.log('API: Parameter creation result:', result);
    
    if (!result.success) {
      console.log('API: Parameter creation failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log('API: Parameter created successfully with ID:', result.parameter?.id);
    return NextResponse.json({ success: true, parameter: result.parameter }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add parameter' },
      { status: 500 }
    );
  }
}
