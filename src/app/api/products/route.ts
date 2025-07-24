import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';
import { FilterCriteria, ProductCategory } from '@/types/product';

const dataManager = new DataManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter criteria from query parameters
    const filterCriteria: FilterCriteria = {};

    // Categories filter
    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      filterCriteria.category = categoriesParam.split(',') as ProductCategory[];
    }

    // Sensor types filter
    const sensorTypesParam = searchParams.get('sensorTypes');
    if (sensorTypesParam) {
      filterCriteria.sensorType = sensorTypesParam.split(',');
    }

    // Mounts filter
    const mountsParam = searchParams.get('mounts');
    if (mountsParam) {
      filterCriteria.mount = mountsParam.split(',');
    }

    // Discontinued filter
    const discontinuedParam = searchParams.get('isDiscontinued');
    if (discontinuedParam !== null) {
      filterCriteria.isDiscontinued = discontinuedParam === 'true';
    }

    // Price range filter
    const priceMinParam = searchParams.get('priceMin');
    const priceMaxParam = searchParams.get('priceMax');
    if (priceMinParam || priceMaxParam) {
      filterCriteria.priceRange = {};
      if (priceMinParam) filterCriteria.priceRange.min = parseFloat(priceMinParam);
      if (priceMaxParam) filterCriteria.priceRange.max = parseFloat(priceMaxParam);
    }

    // Date range filter
    const dateStartParam = searchParams.get('dateStart');
    const dateEndParam = searchParams.get('dateEnd');
    if (dateStartParam || dateEndParam) {
      filterCriteria.releaseDateRange = {};
      if (dateStartParam) filterCriteria.releaseDateRange.start = dateStartParam;
      if (dateEndParam) filterCriteria.releaseDateRange.end = dateEndParam;
    }

    // Search filter
    const searchParam = searchParams.get('search');
    if (searchParam) {
      filterCriteria.search = searchParam;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Load all products
    const allProducts = await dataManager.loadAllProducts();
    
    // Apply filters
    const filteredProducts = dataManager.filterProducts(allProducts, filterCriteria);
    
    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      },
      filters: filterCriteria
    });

  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for bulk operations or advanced filtering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, filters, exportFormat } = body;

    if (action === 'export') {
      // Export filtered products
      const allProducts = await dataManager.loadAllProducts();
      const filteredProducts = filters ? dataManager.filterProducts(allProducts, filters) : allProducts;
      
      const format = exportFormat || 'json';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `canon-products-export-${timestamp}.${format}`;
      
      const filePath = await dataManager.exportProducts(filteredProducts, format, filename);
      
      return NextResponse.json({
        message: 'Export completed',
        filename,
        filePath,
        productCount: filteredProducts.length
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing products request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 