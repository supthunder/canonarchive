import { NextResponse } from 'next/server';
import { createSampleData } from '@/lib/test-data';

export async function POST() {
  try {
    await createSampleData();
    
    return NextResponse.json({
      message: 'Sample Canon product data created successfully',
      files: [
        'sample-canon-products.json',
        'sample-canon-products.yaml'
      ]
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
} 