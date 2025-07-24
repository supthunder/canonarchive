#!/usr/bin/env node
import { LinkExtractor } from './extract-links.js';
import { BatchScraper } from './scrape-batch.js';

class CanonScraper {
  constructor() {
    this.linkExtractor = new LinkExtractor();
    this.batchScraper = new BatchScraper();
  }

  async showHelp() {
    console.log(`
🎯 Canon Museum Scraper

USAGE:
  node index.js <command> [options]

COMMANDS:
  extract-links    Extract all product links from raw HTML
  scrape          Start full scraping process
  scrape-sample   Scrape first 5 products (for testing)
  scrape-category Scrape specific category
  resume          Resume interrupted scraping
  stats           Show scraping statistics
  help            Show this help message

OPTIONS:
  --limit <num>          Limit number of products to scrape
  --categories <list>    Comma-separated category codes (dcc,dslr,dhc,etc)
  --batch-size <num>     Products per batch (default: 15)

EXAMPLES:
  node index.js extract-links
  node index.js scrape-sample
  node index.js scrape --limit 50
  node index.js scrape-category --categories dcc,dslr
  node index.js resume
  node index.js stats

CATEGORY CODES:
  dslr    - DSLR Cameras
  dcc     - Digital Compact Cameras  
  dhc     - HD Camcorders
  cesc    - Cinema Cameras
  film    - Film Cameras
  dvc     - Digital Camcorders
  colvc   - Color Camcorders
  8mmvc   - 8mm Camcorders
  svc     - Still Video Cameras
  cine    - Movie Cameras
`);
  }

  async extractLinks() {
    console.log('🔗 Extracting Canon product links...\n');
    try {
      const products = await this.linkExtractor.extractLinks();
      console.log(`\n✅ Successfully extracted ${products.length} product links`);
      return products;
    } catch (error) {
      console.error('❌ Failed to extract links:', error);
      process.exit(1);
    }
  }

  async scrapeSample() {
    console.log('🧪 Scraping sample products for testing...\n');
    try {
      const result = await this.batchScraper.startScraping({ limit: 5 });
      console.log('\n✅ Sample scraping completed!');
      return result;
    } catch (error) {
      console.error('❌ Sample scraping failed:', error);
      process.exit(1);
    }
  }

  async scrapeAll(options = {}) {
    console.log('🚀 Starting full Canon Museum scraping...\n');
    try {
      const result = await this.batchScraper.startScraping(options);
      console.log('\n🎉 Full scraping completed!');
      return result;
    } catch (error) {
      console.error('❌ Full scraping failed:', error);
      process.exit(1);
    }
  }

  async scrapeCategory(categories, limit) {
    console.log(`🎯 Scraping categories: ${categories.join(', ')}\n`);
    try {
      const result = await this.batchScraper.scrapeCategories(categories, limit);
      console.log('\n✅ Category scraping completed!');
      return result;
    } catch (error) {
      console.error('❌ Category scraping failed:', error);
      process.exit(1);
    }
  }

  async resume() {
    console.log('🔄 Resuming scraping from last checkpoint...\n');
    try {
      const result = await this.batchScraper.resume();
      console.log('\n✅ Resume scraping completed!');
      return result;
    } catch (error) {
      console.error('❌ Resume scraping failed:', error);
      process.exit(1);
    }
  }

  async showStats() {
    console.log('📊 Canon Museum Scraping Statistics\n');
    try {
      const stats = await this.batchScraper.getStats();
      
      if (!stats) {
        console.log('📊 No scraping data found. Run scraping first.');
        return;
      }

      console.log(`📈 Statistics:`);
      console.log(`   Total products: ${stats.totalProducts}`);
      console.log(`   Successfully scraped: ${stats.scrapedProducts}`);
      console.log(`   Failed products: ${stats.failedProducts}`);
      console.log(`   Success rate: ${((stats.scrapedProducts / stats.totalProducts) * 100).toFixed(1)}%`);
      console.log(`   Categories: ${stats.categories.join(', ')}`);
      console.log(`   Last updated: ${new Date(stats.lastUpdated).toLocaleString()}`);
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      process.exit(1);
    }
  }
}

// CLI Interface
async function main() {
  const scraper = new CanonScraper();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    await scraper.showHelp();
    return;
  }

  const command = args[0];
  const options = {};
  
  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
      case '--categories':
        options.categories = args[++i].split(',');
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]);
        break;
    }
  }

  // Execute command
  try {
    switch (command) {
      case 'extract-links':
        await scraper.extractLinks();
        break;
        
      case 'scrape-sample':
        await scraper.scrapeSample();
        break;
        
      case 'scrape':
        await scraper.scrapeAll(options);
        break;
        
      case 'scrape-category':
        if (!options.categories) {
          console.error('❌ --categories option required for scrape-category command');
          process.exit(1);
        }
        await scraper.scrapeCategory(options.categories, options.limit);
        break;
        
      case 'resume':
        await scraper.resume();
        break;
        
      case 'stats':
        await scraper.showStats();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "node index.js help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Scraping interrupted by user. Progress has been saved.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Scraping terminated. Progress has been saved.');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CanonScraper }; 