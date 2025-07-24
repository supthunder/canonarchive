// Enhanced types for Canon product data with smart specifications

export interface CanonProduct {
  id: string;
  name: string;
  model?: string;
  category: string;
  categoryCode: string;
  productUrl: string;
  
  // Regional names
  names?: {
    japan?: string;
    americas?: string;
    europe?: string;
  };
  
  // Marketing information
  marketedDate?: string;
  releaseDate?: string;
  discontinuedDate?: string;
  isDiscontinued?: boolean;
  
  // Product images
  images: string[];
  
  // Technical specifications (raw from scraping)
  specifications: Record<string, string>;
  
  // Product description
  description?: string;
  
  // Smart extracted specifications
  smartSpecs: SmartSpecifications;
  
  // Searchable text content
  searchableText: string;
  
  // Metadata
  scrapedAt: string;
  lastEnhanced?: string;
  dataQuality: 'high' | 'medium' | 'low' | 'failed';
}

export interface SmartSpecifications {
  // Extracted megapixel information
  megapixels: {
    values: number[];
    primary: number | null;
    details: Array<{
      value: number;
      source: string;
      context: string;
    }>;
  };
  
  // Sensor specifications
  sensorSize: {
    detected: string[];
    primary: string | null;
    details: Array<{
      raw: string;
      standardized: string;
      source: string;
    }>;
  };
  
  sensorType: string[];
  
  // Lens specifications
  lensSpecs: {
    focalLength: Array<{
      min?: number;
      max?: number;
      value?: number;
      type: 'zoom' | 'prime';
    }>;
    aperture: Array<{
      wide?: number;
      tele?: number;
      value?: number;
    }>;
    zoom?: number | null;
  };
  
  // ISO capabilities
  isoRange: Array<{
    min?: number;
    max?: number;
    value?: number;
  }>;
  
  // Video capabilities
  videoSpecs: {
    maxResolution: string | null;
    formats: string[];
  };
  
  // Physical specifications
  physicalSpecs: {
    dimensions: {
      width: number;
      height: number;
      depth: number;
      unit: string;
    } | null;
    weight: {
      value: number;
      unit: string;
    } | null;
  };
  
  // Enhanced categorization
  deviceType: string;
  era: string;
  
  // Search tags for features
  searchTags: string[];
}

export interface AdvancedFilterCriteria {
  // Text search
  search?: string;
  
  // Category filters
  categories?: string[];
  deviceTypes?: string[];
  eras?: string[];
  
  // Megapixel filters
  megapixels?: {
    exact?: number;
    min?: number;
    max?: number;
    values?: number[];
  };
  
  // Sensor filters
  sensorSizes?: string[];
  sensorTypes?: string[];
  
  // Lens filters
  focalLengthMin?: number;
  focalLengthMax?: number;
  apertureMin?: number;
  apertureMax?: number;
  hasZoom?: boolean;
  
  // Feature filters
  features?: string[];
  searchTags?: string[];
  
  // Date filters
  marketedAfter?: string;
  marketedBefore?: string;
  
  // Quality filters
  dataQuality?: ('high' | 'medium' | 'low')[];
  
  // Advanced search operators
  operators?: {
    megapixelsOperator?: 'equals' | 'greater' | 'less' | 'between';
    textOperator?: 'contains' | 'exact' | 'startsWith' | 'endsWith';
    sensorOperator?: 'contains' | 'exact';
  };
}

export interface FilterOption {
  value: string | number;
  label: string;
  count: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'text' | 'number';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface SearchResult {
  products: CanonProduct[];
  total: number;
  filters: {
    categories: FilterOption[];
    megapixels: FilterOption[];
    sensorSizes: FilterOption[];
    sensorTypes: FilterOption[];
    eras: FilterOption[];
    deviceTypes: FilterOption[];
    features: FilterOption[];
  };
  statistics: {
    totalProducts: number;
    filteredCount: number;
    averageMegapixels: number;
    topCategories: FilterOption[];
    megapixelRange: { min: number; max: number };
  };
}

// Legacy types for backwards compatibility
export type ProductCategory = string;

export interface ProductSpecifications {
  sensor?: {
    type: string;
    size: string;
    resolution: string;
    cropFactor?: number;
  };
  mount?: string;
  focalLength?: string;
  aperture?: string;
  stabilization?: boolean;
  weight?: string;
  dimensions?: string;
  batteryLife?: string;
  connectivity?: string[];
  other?: Record<string, string | number | boolean>;
}

export interface ProductMetadata {
  sourceUrl: string;
  lastScraped: string;
  scrapeSource: 'canon' | 'manual' | 'other';
  dataQuality: 'high' | 'medium' | 'low';
  images?: string[];
  description?: string;
  price?: {
    msrp?: number;
    currency: string;
    currentPrice?: number;
  };
}

export interface FilterCriteria {
  category?: ProductCategory[];
  sensorType?: string[];
  mount?: string[];
  isDiscontinued?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  releaseDateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  productCount: number;
  errors: string[];
  source: string;
} 