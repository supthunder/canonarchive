import axios from 'axios';
import * as cheerio from 'cheerio';

class ProductScraper {
  constructor() {
    this.baseUrl = 'https://global.canon';
    this.delay = 2000; // 2 second delay between requests
    this.maxRetries = 3;
  }

  async scrapeProduct(productInfo) {
    console.log(`🔍 Scraping ${productInfo.name} (${productInfo.id})`);
    
    try {
      // Fetch the product page
      const response = await this.fetchWithRetry(productInfo.productUrl);
      const $ = cheerio.load(response.data);
      
      // Extract basic product information
      const productData = {
        id: productInfo.id,
        name: productInfo.name,
        category: productInfo.category,
        categoryCode: productInfo.categoryCode,
        productUrl: productInfo.productUrl,
        
        // Extract additional names for different regions
        names: this.extractProductNames($),
        
        // Extract marketing date
        marketedDate: this.extractMarketedDate($),
        
        // Extract all product images
        images: this.extractImages($, productInfo.id),
        
        // Extract detailed specifications
        specifications: this.extractSpecifications($),
        
        // Extract description/outline
        description: this.extractDescription($),
        
        // Metadata
        scrapedAt: new Date().toISOString(),
        dataQuality: 'high'
      };
      
      console.log(`✅ Successfully scraped ${productInfo.name}`);
      return productData;
      
    } catch (error) {
      console.error(`❌ Error scraping ${productInfo.name}:`, error.message);
      return {
        ...productInfo,
        error: error.message,
        scrapedAt: new Date().toISOString(),
        dataQuality: 'failed'
      };
    }
  }

  extractProductNames($) {
    const names = {};
    
    // Extract different regional names
    $('.title_i').each((index, element) => {
      const text = $(element).text().trim();
      const iconImg = $(element).find('img');
      
      if (iconImg.length > 0) {
        const iconSrc = iconImg.attr('src');
        if (iconSrc.includes('icon_07')) {
          names.japan = text;
        } else if (iconSrc.includes('icon_08')) {
          names.americas = text;
        } else if (iconSrc.includes('icon_09')) {
          names.europe = text;
        }
      }
    });
    
    return names;
  }

  extractMarketedDate($) {
    let marketedDate = null;
    
    // Look for "Marketed" in specification tables
    $('table.spec tr').each((index, element) => {
      const label = $(element).find('td').first().text().trim().toLowerCase();
      if (label.includes('marketed')) {
        marketedDate = $(element).find('td').last().text().trim();
        return false; // break
      }
    });
    
    return marketedDate;
  }

  extractImages($, productId) {
    const images = [];
    
    // Extract main product images from gallery
    $('.gallery_lis img, .images img').each((index, element) => {
      const src = $(element).attr('src');
      if (src && src.includes('.jpg') && !src.includes('shadow')) {
        const fullUrl = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
        if (!images.includes(fullUrl)) {
          images.push(fullUrl);
        }
      }
    });
    
    // If no images found in gallery, try to construct from product ID
    if (images.length === 0) {
      // Try common image patterns
      for (let i = 1; i <= 4; i++) {
        const imageUrl = `${this.baseUrl}/ja/c-museum/wp-content/uploads/2015/05/${productId}-${i}_b.jpg`;
        images.push(imageUrl);
      }
    }
    
    return images;
  }

  extractSpecifications($) {
    const specifications = {};
    
    // Extract from specifications table (tab2)
    $('.tab2 table.spec tr').each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim();
        const value = $(cells[1]).html() // Use html() to preserve line breaks
          .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
          .replace(/<[^>]*>/g, '') // Remove other HTML tags
          .trim();
        
        if (label && value) {
          // Clean up the label to make it a valid key
          const key = this.cleanSpecKey(label);
          specifications[key] = value;
        }
      }
    });
    
    // Also check outline table for basic specs
    $('.tab1 table.spec tr').each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim();
        const value = $(cells[1]).text().trim();
        
        if (label && value) {
          const key = this.cleanSpecKey(label);
          if (!specifications[key]) { // Don't overwrite detailed specs
            specifications[key] = value;
          }
        }
      }
    });
    
    return specifications;
  }

  extractDescription($) {
    // Extract description from the outline tab
    const description = $('.tab1 p').not('.ab_sup').map((index, element) => {
      return $(element).text().trim();
    }).get().join('\n\n');
    
    return description || null;
  }

  cleanSpecKey(label) {
    return label
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with one
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  async fetchWithRetry(url, retries = 0) {
    try {
      await this.sleep(this.delay);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 30000 // 30 second timeout
      });
      
      return response;
      
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`⚠️  Retry ${retries + 1}/${this.maxRetries} for ${url}`);
        await this.sleep(this.delay * (retries + 1)); // Exponential backoff
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { ProductScraper }; 