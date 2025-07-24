import fs from 'fs';
import path from 'path';
import { CanonProduct, AdvancedFilterCriteria, SearchResult, FilterOption } from '@/types/product';

export class SmartDataManager {
  private smartDataPath: string;
  private cachedData: CanonProduct[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.smartDataPath = path.join(process.cwd(), 'data', 'canon-products-smart.json');
  }

  private async loadSmartData(): Promise<CanonProduct[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedData && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      const data = JSON.parse(await fs.promises.readFile(this.smartDataPath, 'utf-8'));
      this.cachedData = data.products || [];
      this.cacheTimestamp = now;
      
      console.log(`📊 Loaded ${this.cachedData?.length || 0} smart Canon products`);
      return this.cachedData || [];
    } catch (error) {
      console.error('❌ Error loading smart data:', error);
      return [];
    }
  }

  async search(filters: AdvancedFilterCriteria = {}): Promise<SearchResult> {
    const allProducts = await this.loadSmartData();
    let filteredProducts = [...allProducts];

    // Apply text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const operator = filters.operators?.textOperator || 'contains';
      
      filteredProducts = filteredProducts.filter(product => {
        const searchText = product.searchableText;
        const name = product.name.toLowerCase();
        
        switch (operator) {
          case 'exact':
            return name === searchTerm || searchText.includes(searchTerm);
          case 'startsWith':
            return name.startsWith(searchTerm);
          case 'endsWith':
            return name.endsWith(searchTerm);
          case 'contains':
          default:
            return searchText.includes(searchTerm) || name.includes(searchTerm);
        }
      });
    }

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.categories!.includes(product.category)
      );
    }

    // Apply device type filters
    if (filters.deviceTypes && filters.deviceTypes.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.deviceTypes!.includes(product.smartSpecs.deviceType)
      );
    }

    // Apply era filters
    if (filters.eras && filters.eras.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.eras!.includes(product.smartSpecs.era)
      );
    }

    // Apply megapixel filters
    if (filters.megapixels) {
      const mpFilter = filters.megapixels;
      const operator = filters.operators?.megapixelsOperator || 'equals';
      
      filteredProducts = filteredProducts.filter(product => {
        const mp = product.smartSpecs.megapixels.primary;
        if (!mp) return false;
        
        if (mpFilter.exact !== undefined) {
          return operator === 'equals' ? mp === mpFilter.exact : 
                 operator === 'greater' ? mp > mpFilter.exact :
                 operator === 'less' ? mp < mpFilter.exact : false;
        }
        
        if (mpFilter.min !== undefined && mp < mpFilter.min) return false;
        if (mpFilter.max !== undefined && mp > mpFilter.max) return false;
        if (mpFilter.values && !mpFilter.values.includes(mp)) return false;
        
        return true;
      });
    }

    // Apply sensor size filters
    if (filters.sensorSizes && filters.sensorSizes.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const sensorSize = product.smartSpecs.sensorSize.primary;
        if (!sensorSize) return false;
        
        const operator = filters.operators?.sensorOperator || 'contains';
        
        return filters.sensorSizes!.some(filterSize => {
          switch (operator) {
            case 'exact':
              return sensorSize === filterSize;
            case 'contains':
            default:
              return sensorSize.toLowerCase().includes(filterSize.toLowerCase()) ||
                     product.smartSpecs.sensorSize.detected.some(size => 
                       size.toLowerCase().includes(filterSize.toLowerCase())
                     );
          }
        });
      });
    }

    // Apply sensor type filters
    if (filters.sensorTypes && filters.sensorTypes.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.sensorTypes!.some(type =>
          product.smartSpecs.sensorType.some(sensorType =>
            sensorType.toLowerCase().includes(type.toLowerCase())
          )
        )
      );
    }

    // Apply feature/tag filters
    if (filters.searchTags && filters.searchTags.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.searchTags!.some(tag =>
          product.smartSpecs.searchTags.includes(tag)
        )
      );
    }

    // Apply focal length filters
    if (filters.focalLengthMin !== undefined || filters.focalLengthMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        const lensSpecs = product.smartSpecs.lensSpecs.focalLength;
        if (lensSpecs.length === 0) return false;
        
        return lensSpecs.some(lens => {
          const minFocal = lens.min || lens.value || 0;
          const maxFocal = lens.max || lens.value || Infinity;
          
          if (filters.focalLengthMin !== undefined && maxFocal < filters.focalLengthMin) return false;
          if (filters.focalLengthMax !== undefined && minFocal > filters.focalLengthMax) return false;
          
          return true;
        });
      });
    }

    // Apply zoom filter
    if (filters.hasZoom !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        const hasZoomLens = product.smartSpecs.lensSpecs.focalLength.some(lens => lens.type === 'zoom');
        const hasZoomTag = product.smartSpecs.searchTags.includes('zoom');
        return (hasZoomLens || hasZoomTag) === filters.hasZoom;
      });
    }

    // Apply date filters
    if (filters.marketedAfter || filters.marketedBefore) {
      filteredProducts = filteredProducts.filter(product => {
        const marketDate = product.marketedDate;
        if (!marketDate) return false;
        
        const year = parseInt(marketDate.match(/\d{4}/)?.[0] || '0');
        if (year === 0) return false;
        
        if (filters.marketedAfter && year < parseInt(filters.marketedAfter)) return false;
        if (filters.marketedBefore && year > parseInt(filters.marketedBefore)) return false;
        
        return true;
      });
    }

    // Apply data quality filters
    if (filters.dataQuality && filters.dataQuality.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.dataQuality!.includes(product.dataQuality)
      );
    }

    // Generate filter options and statistics
    const filterOptions = this.generateFilterOptions(allProducts, filteredProducts);
    const statistics = this.generateStatistics(allProducts, filteredProducts);

    return {
      products: filteredProducts,
      total: filteredProducts.length,
      filters: filterOptions,
      statistics
    };
  }

  private generateFilterOptions(allProducts: CanonProduct[], filteredProducts: CanonProduct[]) {
    const categories = this.generateOptions(
      filteredProducts.map(p => p.category),
      'Categories'
    );

    const megapixels = this.generateOptions(
      filteredProducts
        .map(p => p.smartSpecs.megapixels.primary)
        .filter((mp): mp is number => mp !== null)
        .map(mp => `${mp}MP`),
      'Megapixels'
    );

    const sensorSizes = this.generateOptions(
      filteredProducts
        .map(p => p.smartSpecs.sensorSize.primary)
        .filter((size): size is string => size !== null),
      'Sensor Sizes'
    );

    const sensorTypes = this.generateOptions(
      filteredProducts.flatMap(p => p.smartSpecs.sensorType),
      'Sensor Types'
    );

    const eras = this.generateOptions(
      filteredProducts.map(p => p.smartSpecs.era),
      'Eras'
    );

    const deviceTypes = this.generateOptions(
      filteredProducts.map(p => p.smartSpecs.deviceType),
      'Device Types'
    );

    const features = this.generateOptions(
      filteredProducts.flatMap(p => p.smartSpecs.searchTags),
      'Features'
    );

    return {
      categories,
      megapixels,
      sensorSizes,
      sensorTypes,
      eras,
      deviceTypes,
      features
    };
  }

  private generateOptions(values: (string | number)[], type: string): FilterOption[] {
    const counts = new Map<string | number, number>();
    
    values.forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([value, count]) => ({
        value,
        label: String(value),
        count
      }))
      .sort((a, b) => {
        // Sort megapixels numerically
        if (type === 'Megapixels') {
          const aNum = parseFloat(String(a.value).replace('MP', ''));
          const bNum = parseFloat(String(b.value).replace('MP', ''));
          return bNum - aNum;
        }
        // Sort others by count, then alphabetically
        return b.count - a.count || String(a.value).localeCompare(String(b.value));
      });
  }

  private generateStatistics(allProducts: CanonProduct[], filteredProducts: CanonProduct[]) {
    const megapixels = filteredProducts
      .map(p => p.smartSpecs.megapixels.primary)
      .filter((mp): mp is number => mp !== null);

    const averageMegapixels = megapixels.length > 0 
      ? megapixels.reduce((sum, mp) => sum + mp, 0) / megapixels.length
      : 0;

    const megapixelRange = megapixels.length > 0
      ? { min: Math.min(...megapixels), max: Math.max(...megapixels) }
      : { min: 0, max: 0 };

    const topCategories = this.generateOptions(
      filteredProducts.map(p => p.category),
      'Categories'
    ).slice(0, 5);

    return {
      totalProducts: allProducts.length,
      filteredCount: filteredProducts.length,
      averageMegapixels: Math.round(averageMegapixels * 10) / 10,
      topCategories,
      megapixelRange
    };
  }

  async getProduct(id: string): Promise<CanonProduct | null> {
    const products = await this.loadSmartData();
    return products.find(p => p.id === id) || null;
  }

  async getRandomProducts(count: number = 6): Promise<CanonProduct[]> {
    const products = await this.loadSmartData();
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getStatistics() {
    const products = await this.loadSmartData();
    return this.generateStatistics(products, products);
  }
} 