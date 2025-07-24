// Types for Canon product data structure

export interface CanonProduct {
  id: string;
  name: string;
  model: string;
  category: ProductCategory;
  releaseDate?: string;
  discontinuedDate?: string;
  isDiscontinued: boolean;
  
  // Technical specifications
  specifications: ProductSpecifications;
  
  // Metadata
  metadata: ProductMetadata;
}

export type ProductCategory = 
  | 'dslr'
  | 'mirrorless'
  | 'compact'
  | 'lens'
  | 'accessory'
  | 'printer'
  | 'scanner'
  | 'camcorder'
  | 'professional';

export interface ProductSpecifications {
  // Camera-specific specs
  sensor?: {
    type: string;
    size: string;
    resolution: string;
    cropFactor?: number;
  };
  
  // Lens-specific specs
  mount?: string;
  focalLength?: string;
  aperture?: string;
  stabilization?: boolean;
  
  // General specs
  weight?: string;
  dimensions?: string;
  batteryLife?: string;
  connectivity?: string[];
  
  // Additional specs as key-value pairs
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