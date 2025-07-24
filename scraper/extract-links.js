import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LinkExtractor {
  constructor() {
    this.baseUrl = 'https://global.canon';
    this.rawHtmlPath = path.join(__dirname, '../data/rawhtml_canon_digital_camera');
    this.outputPath = path.join(__dirname, 'extracted-links.json');
  }

  async extractLinks() {
    console.log('🔍 Extracting Canon product links...');
    
    try {
      // Read the raw HTML file
      const htmlContent = await fs.promises.readFile(this.rawHtmlPath, 'utf-8');
      const $ = cheerio.load(htmlContent);
      
      const products = [];
      
      // Find all product boxes with links
      $('.product_box').each((index, element) => {
        const $element = $(element);
        
        // Extract the main product link
        const linkElement = $element.find('a[href*="/en/c-museum/product/"]').first();
        if (linkElement.length === 0) return;
        
        const href = linkElement.attr('href');
        if (!href) return;
        
        // Extract product ID from href (e.g., dcc580 from /en/c-museum/product/dcc580.html)
        const productIdMatch = href.match(/\/en\/c-museum\/product\/([^.]+)\.html/);
        if (!productIdMatch) return;
        
        const productId = productIdMatch[1];
        
        // Extract product name from the link text
        const nameElement = linkElement.find('.pro_name span.en, span.en');
        let productName = nameElement.text().trim();
        
        // If no name found in link, try to get it from alt text of thumbnail
        if (!productName) {
          const imgElement = $element.find('img').first();
          const altText = imgElement.attr('alt');
          if (altText && altText.startsWith('Photo: ')) {
            productName = altText.replace('Photo: ', '').trim();
          }
        }
        
        // Extract category classes from the product box
        const classes = $element.attr('class') || '';
        const categoryMatch = classes.match(/product_box\s+([^\s]+)/);
        const categoryCode = categoryMatch ? categoryMatch[1] : 'unknown';
        
        // Map category codes to readable categories
        const categoryMap = {
          'dslr': 'DSLR Camera',
          'dcc': 'Digital Compact Camera', 
          'dhc': 'HD Camcorder',
          'cesc': 'Cinema Camera',
          'film': 'Film Camera',
          'dvc': 'Digital Camcorder',
          'colvc': 'Color Camcorder',
          '8mmvc': '8mm Camcorder',
          'svc': 'Still Video Camera',
          'cine': 'Movie Camera'
        };
        
        const category = categoryMap[categoryCode] || 'Other';
        
        // Extract thumbnail image
        const thumbnailImg = $element.find('img').first();
        const thumbnailSrc = thumbnailImg.attr('src');
        
        // Construct full URLs
        const productUrl = `${this.baseUrl}${href}`;
        const thumbnailUrl = thumbnailSrc ? `${this.baseUrl}${thumbnailSrc}` : null;
        
        products.push({
          id: productId,
          name: productName || `Product ${productId}`,
          category: category,
          categoryCode: categoryCode,
          productUrl: productUrl,
          thumbnailUrl: thumbnailUrl,
          scraped: false,
          createdAt: new Date().toISOString()
        });
      });
      
      // Remove duplicates based on ID
      const uniqueProducts = products.filter((product, index, array) => 
        array.findIndex(p => p.id === product.id) === index
      );
      
      // Sort by ID for consistent ordering
      uniqueProducts.sort((a, b) => a.id.localeCompare(b.id));
      
      console.log(`✅ Extracted ${uniqueProducts.length} unique product links`);
      console.log(`📊 Categories found: ${[...new Set(uniqueProducts.map(p => p.category))].join(', ')}`);
      
      // Save to JSON file
      await fs.promises.writeFile(
        this.outputPath, 
        JSON.stringify({
          extractedAt: new Date().toISOString(),
          totalProducts: uniqueProducts.length,
          categories: [...new Set(uniqueProducts.map(p => p.category))],
          products: uniqueProducts
        }, null, 2)
      );
      
      console.log(`💾 Saved links to: ${this.outputPath}`);
      
      return uniqueProducts;
      
    } catch (error) {
      console.error('❌ Error extracting links:', error);
      throw error;
    }
  }

  // Get sample of products for testing
  async getSample(count = 5) {
    const data = JSON.parse(await fs.promises.readFile(this.outputPath, 'utf-8'));
    return data.products.slice(0, count);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new LinkExtractor();
  extractor.extractLinks()
    .then(() => console.log('🎉 Link extraction completed!'))
    .catch(console.error);
}

export { LinkExtractor }; 