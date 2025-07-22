import { NextRequest, NextResponse } from 'next/server';
import { getAllParameterCategories, addParameterCategory } from '@/lib/parameter-categories';

export async function GET() {
  try {
    const categories = getAllParameterCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parameter categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_name } = body;

    if (!category_name || typeof category_name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = addParameterCategory({
      category_name: category_name.trim()
    });
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Failed to add parameter category. Category name may already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add parameter category' },
      { status: 500 }
    );
  }
}
