import axios from 'axios';
import * as cheerio from 'cheerio';
import { CanonProduct, ProductCategory, ProductSpecifications, ScrapingJob } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

// Base Canon URLs for different regions/categories
const CANON_URLS = {
  US: 'https://www.usa.canon.com',
  CAMERAS: '/cameras',
  LENSES: '/lenses',
  PRINTERS: '/printers',
  ARCHIVE: '/support/discontinued-products'
};

export class CanonScraper {
  private baseUrl: string;
  private headers: Record<string, string>;
  
  constructor(region: 'US' = 'US') {
    this.baseUrl = CANON_URLS[region];
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  // Main scraping entry point
  async scrapeProducts(categories: ProductCategory[] = ['dslr', 'mirrorless', 'lens']): Promise<ScrapingJob> {
    const job: ScrapingJob = {
      id: uuidv4(),
      status: 'running',
      startTime: new Date().toISOString(),
      productCount: 0,
      errors: [],
      source: 'canon'
    };

    try {
      const products: CanonProduct[] = [];
      
      for (const category of categories) {
        console.log(`Scraping ${category} products...`);
        const categoryProducts = await this.scrapeCategory(category);
        products.push(...categoryProducts);
        
        // Add delay between categories to be respectful
        await this.delay(2000);
      }

      // Save products to data files
      await this.saveProducts(products);
      
      job.status = 'completed';
      job.endTime = new Date().toISOString();
      job.productCount = products.length;
      
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date().toISOString();
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return job;
  }

  // Scrape products from a specific category
  private async scrapeCategory(category: ProductCategory): Promise<CanonProduct[]> {
    const products: CanonProduct[] = [];
    
    try {
      const categoryUrl = this.getCategoryUrl(category);
      const response = await axios.get(categoryUrl, { headers: this.headers });
      const $ = cheerio.load(response.data);
      
      // Extract product links - this will need to be adjusted based on Canon's actual HTML structure
      const productLinks = this.extractProductLinks($, category);
      
      for (const link of productLinks) {
        try {
          const product = await this.scrapeProductPage(link, category);
          if (product) {
            products.push(product);
          }
          
          // Add delay between product pages
          await this.delay(1000);
        } catch (error) {
          console.error(`Error scraping product ${link}:`, error);
        }
      }
      
    } catch (error) {
      console.error(`Error scraping category ${category}:`, error);
    }
    
    return products;
  }

  // Extract product links from category page
  private extractProductLinks($: cheerio.CheerioAPI, _category: ProductCategory): string[] {
    const links: string[] = [];
    
    // These selectors will need to be updated based on Canon's actual HTML structure
    // This is a generic approach that should be customized
    const productSelectors = [
      '.product-card a',
      '.product-item a',
      '.product-link',
      'a[href*="/cameras/"]',
      'a[href*="/lenses/"]'
    ];
    
    productSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          if (!links.includes(fullUrl)) {
            links.push(fullUrl);
          }
        }
      });
    });
    
    return links;
  }

  // Scrape individual product page
  private async scrapeProductPage(url: string, category: ProductCategory): Promise<CanonProduct | null> {
    try {
      const response = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(response.data);
      
      // Extract basic product information
      const name = this.extractProductName($);
      const model = this.extractProductModel($, name);
      
      if (!name || !model) {
        return null;
      }
      
      // Extract specifications
      const specifications = this.extractSpecifications($, category);
      
      // Create product object (using legacy structure)
      const product = {
        id: uuidv4(),
        name,
        model,
        category,
        isDiscontinued: this.checkIfDiscontinued($),
        specifications: specifications as Record<string, string>,
        metadata: {
          sourceUrl: url,
          lastScraped: new Date().toISOString(),
          scrapeSource: 'canon',
          dataQuality: 'medium',
          images: this.extractImages($),
          description: this.extractDescription($)
        }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any as CanonProduct;
      
      return product;
      
    } catch (error) {
      console.error(`Error scraping product page ${url}:`, error);
      return null;
    }
  }

  // Helper methods for data extraction
  private extractProductName($: cheerio.CheerioAPI): string {
    const selectors = [
      'h1.product-title',
      '.product-name h1',
      'h1',
      '.hero-title h1',
      '.product-header h1'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    
    return '';
  }

  private extractProductModel($: cheerio.CheerioAPI, name: string): string {
    // Try to extract model from various places
    const modelSelectors = [
      '.product-model',
      '.model-number',
      '[data-model]'
    ];
    
    for (const selector of modelSelectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    
    // Extract from name if no specific model field
    const modelMatch = name.match(/([A-Z0-9]+(?:-[A-Z0-9]+)*)/);
    return modelMatch ? modelMatch[1] : name;
  }

  private extractSpecifications($: cheerio.CheerioAPI, category: ProductCategory): ProductSpecifications {
    const specs: ProductSpecifications = {};
    
    // Extract specifications table/list
    $('.specifications tr, .spec-row, .product-specs li').each((_, element) => {
      const label = $(element).find('.spec-label, td:first-child, .label').text().trim().toLowerCase();
      const value = $(element).find('.spec-value, td:last-child, .value').text().trim();
      
      if (label && value) {
        this.mapSpecification(specs, label, value, category);
      }
    });
    
    return specs;
  }

  private mapSpecification(specs: ProductSpecifications, label: string, value: string, _category: ProductCategory): void {
    // Map common specifications based on label
    if (label.includes('sensor')) {
      if (!specs.sensor) specs.sensor = { type: '', size: '', resolution: '' };
      if (label.includes('type')) specs.sensor.type = value;
      if (label.includes('size')) specs.sensor.size = value;
      if (label.includes('resolution') || label.includes('megapixel')) specs.sensor.resolution = value;
    } else if (label.includes('mount')) {
      specs.mount = value;
    } else if (label.includes('focal') && label.includes('length')) {
      specs.focalLength = value;
    } else if (label.includes('aperture') || label.includes('f-stop')) {
      specs.aperture = value;
    } else if (label.includes('weight')) {
      specs.weight = value;
    } else if (label.includes('dimension')) {
      specs.dimensions = value;
    } else if (label.includes('battery')) {
      specs.batteryLife = value;
    } else {
      // Store as other specification
      if (!specs.other) specs.other = {};
      specs.other[label] = value;
    }
  }

  private checkIfDiscontinued($: cheerio.CheerioAPI): boolean {
    const discontinuedIndicators = [
      'discontinued',
      'no longer available',
      'end of life',
      'replaced by'
    ];
    
    const pageText = $.text().toLowerCase();
    return discontinuedIndicators.some(indicator => pageText.includes(indicator));
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    
    $('.product-image img, .gallery img, .hero-image img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src');
      if (src) {
        const fullUrl = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
        images.push(fullUrl);
      }
    });
    
    return [...new Set(images)]; // Remove duplicates
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    const descriptionSelectors = [
      '.product-description',
      '.product-overview',
      '.hero-description',
      '.product-intro p'
    ];
    
    for (const selector of descriptionSelectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    
    return '';
  }

  private getCategoryUrl(category: ProductCategory): string {
    const categoryPaths: Record<ProductCategory, string> = {
      'dslr': '/cameras/dslr',
      'mirrorless': '/cameras/mirrorless',
      'compact': '/cameras/compact',
      'lens': '/lenses',
      'accessory': '/accessories',
      'printer': '/printers',
      'scanner': '/scanners',
      'camcorder': '/camcorders',
      'professional': '/professional'
    };
    
    return `${this.baseUrl}${categoryPaths[category] || '/cameras'}`;
  }

  private async saveProducts(products: CanonProduct[]): Promise<void> {
    if (products.length === 0) {
      console.log('No products to save');
      return;
    }

    const { DataManager } = await import('@/lib/data-manager');
    const dataManager = new DataManager();
    
    try {
      // Save as both JSON and YAML
      const jsonPath = await dataManager.saveProductsJSON(products);
      const yamlPath = await dataManager.saveProductsYAML(products);
      
      console.log(`Saved ${products.length} products to:`);
      console.log(`- JSON: ${jsonPath}`);
      console.log(`- YAML: ${yamlPath}`);
    } catch (error) {
      console.error('Error saving products:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 