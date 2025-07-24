import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { CanonProduct, FilterCriteria, ProductCategory } from '@/types/product';

export class DataManager {
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
  }

  // Ensure data directory exists
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  // Save products to JSON file
  async saveProductsJSON(products: CanonProduct[], filename?: string): Promise<string> {
    await this.ensureDataDir();
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = filename || `canon-products-${timestamp}.json`;
    const filePath = path.join(this.dataDir, fileName);
    
    const data = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalProducts: products.length,
        categories: [...new Set(products.map(p => p.category))],
        version: '1.0'
      },
      products
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  // Save products to YAML file
  async saveProductsYAML(products: CanonProduct[], filename?: string): Promise<string> {
    await this.ensureDataDir();
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = filename || `canon-products-${timestamp}.yaml`;
    const filePath = path.join(this.dataDir, fileName);
    
    const data = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalProducts: products.length,
        categories: [...new Set(products.map(p => p.category))],
        version: '1.0'
      },
      products
    };

    const yamlString = yaml.dump(data, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true 
    });
    
    await fs.writeFile(filePath, yamlString);
    return filePath;
  }

  // Load products from JSON file
  async loadProductsJSON(filename: string): Promise<CanonProduct[]> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return data.products || [];
    } catch (error) {
      console.error(`Error loading products from ${filename}:`, error);
      return [];
    }
  }

  // Load products from YAML file
  async loadProductsYAML(filename: string): Promise<CanonProduct[]> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = yaml.load(fileContent) as { products?: CanonProduct[] };
      return data.products || [];
    } catch (error) {
      console.error(`Error loading products from ${filename}:`, error);
      return [];
    }
  }

  // Load all products from data directory
  async loadAllProducts(): Promise<CanonProduct[]> {
    await this.ensureDataDir();
    
    try {
      const files = await fs.readdir(this.dataDir);
      const productFiles = files.filter(file => 
        file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')
      );

      const allProducts: CanonProduct[] = [];

      for (const file of productFiles) {
        let products: CanonProduct[] = [];
        
        if (file.endsWith('.json')) {
          products = await this.loadProductsJSON(file);
        } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          products = await this.loadProductsYAML(file);
        }
        
        allProducts.push(...products);
      }

      // Remove duplicates based on ID
      const uniqueProducts = allProducts.filter((product, index, array) => 
        array.findIndex(p => p.id === product.id) === index
      );

      return uniqueProducts;
    } catch (error) {
      console.error('Error loading all products:', error);
      return [];
    }
  }

  // Filter products based on criteria
  filterProducts(products: CanonProduct[], criteria: FilterCriteria): CanonProduct[] {
    return products.filter(product => {
      // Category filter
      if (criteria.category && criteria.category.length > 0) {
        if (!criteria.category.includes(product.category)) {
          return false;
        }
      }

      // Sensor type filter - disabled for new smart product structure
      // if (criteria.sensorType && criteria.sensorType.length > 0) {
      //   if (!product.specifications.sensor?.type || 
      //       !criteria.sensorType.some(type => 
      //         product.specifications.sensor!.type.toLowerCase().includes(type.toLowerCase())
      //       )) {
      //     return false;
      //   }
      // }

      // Mount filter
      if (criteria.mount && criteria.mount.length > 0) {
        if (!product.specifications.mount || 
            !criteria.mount.some(mount => 
              product.specifications.mount!.toLowerCase().includes(mount.toLowerCase())
            )) {
          return false;
        }
      }

      // Discontinued filter
      if (criteria.isDiscontinued !== undefined) {
        if (product.isDiscontinued !== criteria.isDiscontinued) {
          return false;
        }
      }

      // Price range filter - disabled for new smart product structure
      // if (criteria.priceRange) {
      //   const price = product.metadata.price?.currentPrice || product.metadata.price?.msrp;
      //   if (price) {
      //     if (criteria.priceRange.min && price < criteria.priceRange.min) {
      //       return false;
      //     }
      //     if (criteria.priceRange.max && price > criteria.priceRange.max) {
      //       return false;
      //     }
      //   }
      // }

      // Release date range filter
      if (criteria.releaseDateRange && product.releaseDate) {
        const releaseDate = new Date(product.releaseDate);
        if (criteria.releaseDateRange.start) {
          const startDate = new Date(criteria.releaseDateRange.start);
          if (releaseDate < startDate) {
            return false;
          }
        }
        if (criteria.releaseDateRange.end) {
          const endDate = new Date(criteria.releaseDateRange.end);
          if (releaseDate > endDate) {
            return false;
          }
        }
      }

      // Text search filter
      if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        const searchableText = [
          product.name,
          product.model || '',
          product.description || '',
          JSON.stringify(product.specifications)
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Get unique values for filter options
  async getFilterOptions(): Promise<{
    categories: ProductCategory[];
    sensorTypes: string[];
    mounts: string[];
    priceRange: { min: number; max: number } | null;
    dateRange: { min: string; max: string } | null;
  }> {
    const products = await this.loadAllProducts();

    const categories = [...new Set(products.map(p => p.category))];
    
    // Sensor types disabled for new smart product structure
    const sensorTypes: string[] = [];

    const mounts = [...new Set(
      products
        .map(p => p.specifications.mount)
        .filter(Boolean)
    )] as string[];

    // Price range disabled for new smart product structure
    const priceRange = null;

    // Calculate date range
    const dates = products
      .map(p => p.releaseDate)
      .filter(Boolean) as string[];
    
    const dateRange = dates.length > 0 ? {
      min: dates.sort()[0],
      max: dates.sort().reverse()[0]
    } : null;

    return {
      categories,
      sensorTypes,
      mounts,
      priceRange,
      dateRange
    };
  }

  // Get list of available data files
  async getDataFiles(): Promise<{ filename: string; size: number; modified: Date }[]> {
    await this.ensureDataDir();
    
    try {
      const files = await fs.readdir(this.dataDir);
      const dataFiles = files.filter(file => 
        file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')
      );

      const fileInfo = await Promise.all(
        dataFiles.map(async (filename) => {
          const filePath = path.join(this.dataDir, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            size: stats.size,
            modified: stats.mtime
          };
        })
      );

      return fileInfo.sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch (error) {
      console.error('Error getting data files:', error);
      return [];
    }
  }

  // Export products to specific format
  async exportProducts(products: CanonProduct[], format: 'json' | 'yaml', filename?: string): Promise<string> {
    if (format === 'json') {
      return await this.saveProductsJSON(products, filename);
    } else {
      return await this.saveProductsYAML(products, filename);
    }
  }
} 