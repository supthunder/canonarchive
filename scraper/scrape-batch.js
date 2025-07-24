import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';
import { LinkExtractor } from './extract-links.js';
import { ProductScraper } from './product-scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BatchScraper {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 15; // Process 15 products at a time
    this.concurrency = options.concurrency || 5; // Max 5 concurrent requests 
    this.outputPath = path.join(__dirname, '../data/canon-products-scraped.json');
    this.linkExtractor = new LinkExtractor();
    this.productScraper = new ProductScraper();
    this.limit = pLimit(this.concurrency);
  }

  async startScraping(options = {}) {
    console.log('🚀 Starting Canon Museum batch scraping...\n');
    
    try {
      // Step 1: Extract links if needed
      let productLinks;
      try {
        productLinks = await this.linkExtractor.getSample(999999); // Get all
      } catch (error) {
        console.log('📋 Extracting product links first...');
        productLinks = await this.linkExtractor.extractLinks();
      }
      
      // Step 2: Load existing scraped data
      const existingData = await this.loadExistingData();
      const scrapedIds = new Set(existingData.products.map(p => p.id));
      
      // Step 3: Filter products that need scraping
      let productsToScrape = productLinks.filter(product => !scrapedIds.has(product.id));
      
      // Apply filters if specified
      if (options.categories && options.categories.length > 0) {
        productsToScrape = productsToScrape.filter(p => 
          options.categories.includes(p.categoryCode)
        );
      }
      
      if (options.limit) {
        productsToScrape = productsToScrape.slice(0, options.limit);
      }
      
      console.log(`📊 Found ${productLinks.length} total products`);
      console.log(`✅ Already scraped: ${scrapedIds.size}`);
      console.log(`🎯 Need to scrape: ${productsToScrape.length}\n`);
      
      if (productsToScrape.length === 0) {
        console.log('🎉 All products already scraped!');
        return existingData;
      }
      
      // Step 4: Process in batches
      const progressBar = new cliProgress.SingleBar({
        format: 'Scraping |{bar}| {percentage}% | {value}/{total} products | ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      
      progressBar.start(productsToScrape.length, 0);
      
      const scrapedProducts = [...existingData.products];
      let processedCount = 0;
      
      // Process in batches
      for (let i = 0; i < productsToScrape.length; i += this.batchSize) {
        const batch = productsToScrape.slice(i, i + this.batchSize);
        
        console.log(`\n🔄 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(productsToScrape.length / this.batchSize)}`);
        console.log(`📦 Products in batch: ${batch.map(p => p.name).join(', ')}\n`);
        
        // Process batch with concurrency limit
        const batchPromises = batch.map(product => 
          this.limit(() => this.productScraper.scrapeProduct(product))
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            scrapedProducts.push(result.value);
          } else {
            console.error(`❌ Failed to scrape ${batch[index].name}:`, result.reason);
            // Add failed product with error info
            scrapedProducts.push({
              ...batch[index],
              error: result.reason.message,
              scrapedAt: new Date().toISOString(),
              dataQuality: 'failed'
            });
          }
          
          processedCount++;
          progressBar.update(processedCount);
        });
        
        // Save progress after each batch
        await this.saveData({
          ...existingData,
          products: scrapedProducts,
          lastUpdated: new Date().toISOString(),
          totalProducts: scrapedProducts.length,
          scrapedProducts: scrapedProducts.filter(p => p.dataQuality !== 'failed').length,
          failedProducts: scrapedProducts.filter(p => p.dataQuality === 'failed').length
        });
        
        console.log(`💾 Saved progress: ${scrapedProducts.length} total products`);
        
        // Add delay between batches
        if (i + this.batchSize < productsToScrape.length) {
          console.log('⏸️  Waiting 5 seconds before next batch...');
          await this.sleep(5000);
        }
      }
      
      progressBar.stop();
      
      const finalData = {
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalProducts: scrapedProducts.length,
        scrapedProducts: scrapedProducts.filter(p => p.dataQuality !== 'failed').length,
        failedProducts: scrapedProducts.filter(p => p.dataQuality === 'failed').length,
        categories: [...new Set(scrapedProducts.map(p => p.category))],
        products: scrapedProducts
      };
      
      await this.saveData(finalData);
      
      console.log('\n🎉 Scraping completed!');
      console.log(`📊 Final statistics:`);
      console.log(`   Total products: ${finalData.totalProducts}`);
      console.log(`   Successfully scraped: ${finalData.scrapedProducts}`);
      console.log(`   Failed: ${finalData.failedProducts}`);
      console.log(`   Categories: ${finalData.categories.join(', ')}`);
      console.log(`💾 Saved to: ${this.outputPath}\n`);
      
      return finalData;
      
    } catch (error) {
      console.error('❌ Critical error during scraping:', error);
      throw error;
    }
  }

  async loadExistingData() {
    try {
      const data = await fs.promises.readFile(this.outputPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return empty structure if file doesn't exist
      return {
        scrapedAt: new Date().toISOString(),
        totalProducts: 0,  
        scrapedProducts: 0,
        failedProducts: 0,
        categories: [],
        products: []
      };
    }
  }

  async saveData(data) {
    // Ensure data directory exists
    await fs.promises.mkdir(path.dirname(this.outputPath), { recursive: true });
    
    // Save with pretty formatting
    await fs.promises.writeFile(
      this.outputPath, 
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get statistics about current data
  async getStats() {
    try {
      const data = await this.loadExistingData();
      return {
        totalProducts: data.totalProducts,
        scrapedProducts: data.scrapedProducts,
        failedProducts: data.failedProducts,
        categories: data.categories,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      return null;
    }
  }

  // Resume scraping from where it left off
  async resume(options = {}) {
    console.log('🔄 Resuming scraping from last checkpoint...');
    return this.startScraping(options);
  }

  // Scrape specific categories only
  async scrapeCategories(categories, limit) {
    console.log(`🎯 Scraping specific categories: ${categories.join(', ')}`);
    return this.startScraping({ categories, limit });
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const scraper = new BatchScraper();
  
  // Parse command line arguments
  const options = {};
  let command = 'start';
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--categories':
        options.categories = args[++i].split(',');
        break;
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
      case '--batch-size':
        scraper.batchSize = parseInt(args[++i]);
        break;
      case 'resume':
        command = 'resume';
        break;
      case 'stats':
        command = 'stats';
        break;
    }
  }
  
  // Execute command
  if (command === 'stats') {
    scraper.getStats().then(stats => {
      if (stats) {
        console.log('📊 Scraping Statistics:');
        console.log(`   Total products: ${stats.totalProducts}`);
        console.log(`   Successfully scraped: ${stats.scrapedProducts}`);
        console.log(`   Failed: ${stats.failedProducts}`);
        console.log(`   Categories: ${stats.categories.join(', ')}`);
        console.log(`   Last updated: ${stats.lastUpdated}`);
      } else {
        console.log('📊 No scraping data found');
      }
    });
  } else if (command === 'resume') {
    scraper.resume(options).catch(console.error);
  } else {
    scraper.startScraping(options).catch(console.error);
  }
}

export { BatchScraper }; 