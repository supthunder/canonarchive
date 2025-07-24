import { NextRequest, NextResponse } from 'next/server';
import { SmartDataManager } from '@/lib/smart-data-manager';
import { AdvancedFilterCriteria } from '@/types/product';

const smartDataManager = new SmartDataManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters into filter criteria
    const filters: AdvancedFilterCriteria = {};
    
    // Text search
    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }
    
    // Categories (comma-separated)
    const categories = searchParams.get('categories');
    if (categories) {
      filters.categories = categories.split(',').map(c => c.trim());
    }
    
    // Device types
    const deviceTypes = searchParams.get('deviceTypes');
    if (deviceTypes) {
      filters.deviceTypes = deviceTypes.split(',').map(d => d.trim());
    }
    
    // Eras
    const eras = searchParams.get('eras');
    if (eras) {
      filters.eras = eras.split(',').map(e => e.trim());
    }
    
    // Megapixels
    const megapixelExact = searchParams.get('megapixels');
    const megapixelMin = searchParams.get('megapixelsMin');
    const megapixelMax = searchParams.get('megapixelsMax');
    const megapixelValues = searchParams.get('megapixelValues');
    
    if (megapixelExact || megapixelMin || megapixelMax || megapixelValues) {
      filters.megapixels = {};
      
      if (megapixelExact) {
        filters.megapixels.exact = parseFloat(megapixelExact);
      }
      if (megapixelMin) {
        filters.megapixels.min = parseFloat(megapixelMin);
      }
      if (megapixelMax) {
        filters.megapixels.max = parseFloat(megapixelMax);
      }
      if (megapixelValues) {
        filters.megapixels.values = megapixelValues.split(',').map(v => parseFloat(v.trim()));
      }
    }
    
    // Sensor specifications
    const sensorSizes = searchParams.get('sensorSizes');
    if (sensorSizes) {
      filters.sensorSizes = sensorSizes.split(',').map(s => s.trim());
    }
    
    const sensorTypes = searchParams.get('sensorTypes');
    if (sensorTypes) {
      filters.sensorTypes = sensorTypes.split(',').map(s => s.trim());
    }
    
    // Lens specifications
    const focalLengthMin = searchParams.get('focalLengthMin');
    if (focalLengthMin) {
      filters.focalLengthMin = parseFloat(focalLengthMin);
    }
    
    const focalLengthMax = searchParams.get('focalLengthMax');
    if (focalLengthMax) {
      filters.focalLengthMax = parseFloat(focalLengthMax);
    }
    
    const hasZoom = searchParams.get('hasZoom');
    if (hasZoom) {
      filters.hasZoom = hasZoom === 'true';
    }
    
    // Features/tags
    const searchTags = searchParams.get('features');
    if (searchTags) {
      filters.searchTags = searchTags.split(',').map(t => t.trim());
    }
    
    // Date filters
    const marketedAfter = searchParams.get('marketedAfter');
    if (marketedAfter) {
      filters.marketedAfter = marketedAfter;
    }
    
    const marketedBefore = searchParams.get('marketedBefore');
    if (marketedBefore) {
      filters.marketedBefore = marketedBefore;
    }
    
    // Data quality
    const dataQuality = searchParams.get('dataQuality');
    if (dataQuality) {
      filters.dataQuality = dataQuality.split(',').map(q => q.trim()) as ('high' | 'medium' | 'low')[];
    }
    
    // Operators
    const textOperator = searchParams.get('textOperator');
    const megapixelsOperator = searchParams.get('megapixelsOperator');
    const sensorOperator = searchParams.get('sensorOperator');
    
    if (textOperator || megapixelsOperator || sensorOperator) {
      filters.operators = {};
      
      if (textOperator) {
        filters.operators.textOperator = textOperator as 'contains' | 'exact' | 'startsWith' | 'endsWith';
      }
      if (megapixelsOperator) {
        filters.operators.megapixelsOperator = megapixelsOperator as 'equals' | 'greater' | 'less' | 'between';
      }
      if (sensorOperator) {
        filters.operators.sensorOperator = sensorOperator as 'contains' | 'exact';
      }
    }
    
    // Perform search
    const results = await smartDataManager.search(filters);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Smart search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform smart search' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters: AdvancedFilterCriteria = await request.json();
    const results = await smartDataManager.search(filters);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Smart search POST error:', error);
    return NextResponse.json(
      { error: 'Failed to perform smart search' },
      { status: 500 }
    );
  }
} 