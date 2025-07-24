import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

const dataManager = new DataManager();

export async function GET(request: NextRequest) {
  try {
    const filterOptions = await dataManager.getFilterOptions();

    return NextResponse.json({
      ...filterOptions,
      message: 'Filter options retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting filter options:', error);
    return NextResponse.json(
      { error: 'Failed to get filter options' },
      { status: 500 }
    );
  }
} 