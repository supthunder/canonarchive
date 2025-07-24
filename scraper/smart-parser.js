import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CanonSmartParser {
  constructor() {
    this.inputPath = path.join(__dirname, '../data/canon-products-scraped.json');
    this.outputPath = path.join(__dirname, '../data/canon-products-smart.json');
    
    // Regex patterns for intelligent extraction
    this.patterns = {
      // Megapixels - various formats
      megapixels: [
        /(\d+\.?\d*)\s*megapixels?/gi,
        /approx\.?\s*(\d+\.?\d*)\s*megapixels?/gi,
        /(\d+\.?\d*)\s*million\s+(?:effective\s+)?pixels?/gi,
        /approximately\s+(\d+\.?\d*)\s+million\s+(?:effective\s+)?pixels?/gi
      ],
      
      // Sensor information
      sensorSize: [
        /(1\/\d+\.?\d*)-?(?:inch|type)/gi,
        /(full\s*frame|aps-c|aps-h|micro\s*four\s*thirds?)/gi,
        /(super\s*35\s*mm)/gi,
        /(\d+\.?\d*\s*x\s*\d+\.?\d*\s*mm)/gi
      ],
      
      sensorType: [
        /(ccd|cmos|saticon|tube)/gi,
        /(back.?illuminated|bsi)/gi
      ],
      
      // Lens specifications
      focalLength: [
        /(\d+\.?\d*(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+\.?\d*(?:\.\d+)?)\s*mm/gi,
        /(\d+\.?\d*)\s*mm/gi
      ],
      
      aperture: [
        /f\/(\d+\.?\d*)\s*(?:-|–|to)\s*f\/(\d+\.?\d*)/gi,
        /f\/(\d+\.?\d*)/gi
      ],
      
      // ISO sensitivity
      isoRange: [
        /iso\s*(\d+)\s*(?:-|–|to)\s*(\d+)/gi,
        /iso\s*(\d+)/gi,
        /sensitivity.*?(\d+)\s*(?:-|–|to)\s*(\d+)/gi
      ],
      
      // Video capabilities
      videoResolution: [
        /(4k|uhd|ultra\s*hd)/gi,
        /(full\s*hd|1080p?|1920\s*x\s*1080)/gi,
        /(hd|720p?|1280\s*x\s*720)/gi,
        /(\d+)\s*x\s*(\d+)\s*(?:pixels?)?/gi
      ],
      
      // Physical dimensions
      dimensions: [
        /(\d+\.?\d*)\s*(?:mm)?\s*x\s*(\d+\.?\d*)\s*(?:mm)?\s*x\s*(\d+\.?\d*)\s*mm/gi,
        /(\d+\.?\d*)\s*\(\s*w\s*\)\s*x\s*(\d+\.?\d*)\s*\(\s*h\s*\)\s*x\s*(\d+\.?\d*)\s*mm/gi
      ],
      
      weight: [
        /(\d+\.?\d*)\s*g(?:rams?)?/gi,
        /(\d+\.?\d*)\s*kg/gi,
        /weight.*?(\d+\.?\d*)\s*g/gi
      ],
      
      // Dates
      releaseDate: [
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi,
        /(\w+)\s+(\d{4})/gi,
        /(\d{4})/gi
      ]
    };
  }

  async parseProducts() {
    console.log('🧠 Starting intelligent Canon product parsing...\n');
    
    try {
      // Load scraped data
      const rawData = JSON.parse(await fs.promises.readFile(this.inputPath, 'utf-8'));
      console.log(`📊 Processing ${rawData.products.length} products...`);
      
      const smartProducts = [];
      let processed = 0;
      
      for (const product of rawData.products) {
        const smartProduct = await this.parseProduct(product);
        smartProducts.push(smartProduct);
        
        processed++;
        if (processed % 50 === 0) {
          console.log(`⚡ Processed ${processed}/${rawData.products.length} products...`);
        }
      }
      
      // Generate smart data structure
      const smartData = {
        createdAt: new Date().toISOString(),
        sourceFile: 'canon-products-scraped.json',
        totalProducts: smartProducts.length,
        enhancedFields: [
          'smartSpecs', 'extractedMegapixels', 'standardizedSensorSize', 
          'sensorType', 'lensSpecs', 'isoCapabilities', 'videoSpecs', 
          'physicalSpecs', 'searchableText'
        ],
        statistics: this.generateStatistics(smartProducts),
        products: smartProducts
      };
      
      // Save smart data
      await fs.promises.writeFile(
        this.outputPath,
        JSON.stringify(smartData, null, 2),
        'utf-8'
      );
      
      console.log(`\n🎉 Smart parsing completed!`);
      console.log(`📊 Statistics:`);
      console.log(`   Total products: ${smartData.totalProducts}`);
      console.log(`   Products with megapixels: ${smartData.statistics.megapixelProducts}`);
      console.log(`   Products with sensor info: ${smartData.statistics.sensorProducts}`);
      console.log(`   Products with lens specs: ${smartData.statistics.lensProducts}`);
      console.log(`   Categories: ${smartData.statistics.categories.join(', ')}`);
      console.log(`💾 Saved to: ${this.outputPath}\n`);
      
      return smartData;
      
    } catch (error) {
      console.error('❌ Error during smart parsing:', error);
      throw error;
    }
  }

  async parseProduct(product) {
    // Start with original product data
    const smartProduct = { ...product };
    
    // Create searchable text from all fields
    const searchableText = this.createSearchableText(product);
    
    // Extract smart specifications
    const smartSpecs = {
      // Megapixel information
      megapixels: this.extractMegapixels(product, searchableText),
      
      // Sensor specifications
      sensorSize: this.extractSensorSize(product, searchableText),
      sensorType: this.extractSensorType(product, searchableText),
      
      // Lens specifications
      lensSpecs: this.extractLensSpecs(product, searchableText),
      
      // ISO capabilities
      isoRange: this.extractISORange(product, searchableText),
      
      // Video capabilities
      videoSpecs: this.extractVideoSpecs(product, searchableText),
      
      // Physical specifications
      physicalSpecs: this.extractPhysicalSpecs(product, searchableText),
      
      // Enhanced categorization
      deviceType: this.categorizeDevice(product),
      era: this.determineEra(product),
      
      // Search tags
      searchTags: this.generateSearchTags(product, searchableText)
    };
    
    // Add smart fields to product
    smartProduct.smartSpecs = smartSpecs;
    smartProduct.searchableText = searchableText;
    smartProduct.lastEnhanced = new Date().toISOString();
    
    return smartProduct;
  }

  createSearchableText(product) {
    const texts = [
      product.name,
      product.description || '',
      Object.values(product.specifications || {}).join(' '),
      Object.values(product.names || {}).join(' '),
      product.marketedDate || ''
    ];
    
    return texts.join(' ').toLowerCase();
  }

  extractMegapixels(product, searchableText) {
    const megapixels = [];
    
    // Check specifications first
    const specs = product.specifications || {};
    for (const [key, value] of Object.entries(specs)) {
      if (typeof value === 'string') {
        for (const pattern of this.patterns.megapixels) {
          const matches = value.matchAll(pattern);
          for (const match of matches) {
            const mp = parseFloat(match[1]);
            if (mp && mp > 0 && mp < 200) { // Reasonable range
              megapixels.push({
                value: mp,
                source: `spec.${key}`,
                context: value.substring(Math.max(0, match.index - 20), match.index + 50)
              });
            }
          }
        }
      }
    }
    
    // Check description
    for (const pattern of this.patterns.megapixels) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        const mp = parseFloat(match[1]);
        if (mp && mp > 0 && mp < 200) {
          megapixels.push({
            value: mp,
            source: 'description',
            context: searchableText.substring(Math.max(0, match.index - 20), match.index + 50)
          });
        }
      }
    }
    
    // Remove duplicates and return highest value
    const uniqueMegapixels = [...new Set(megapixels.map(m => m.value))];
    return {
      values: uniqueMegapixels.sort((a, b) => b - a),
      primary: uniqueMegapixels.length > 0 ? Math.max(...uniqueMegapixels) : null,
      details: megapixels
    };
  }

  extractSensorSize(product, searchableText) {
    const sizes = [];
    
    for (const pattern of this.patterns.sensorSize) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        sizes.push({
          raw: match[0],
          standardized: this.standardizeSensorSize(match[0]),
          source: 'extracted'
        });
      }
    }
    
    return {
      detected: [...new Set(sizes.map(s => s.standardized))],
      primary: sizes.length > 0 ? sizes[0].standardized : null,
      details: sizes
    };
  }

  extractSensorType(product, searchableText) {
    const types = [];
    
    for (const pattern of this.patterns.sensorType) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        types.push(match[1].toLowerCase());
      }
    }
    
    return [...new Set(types)];
  }

  extractLensSpecs(product, searchableText) {
    const lensSpecs = {
      focalLength: [],
      aperture: [],
      zoom: null
    };
    
    // Extract focal length
    for (const pattern of this.patterns.focalLength) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) { // Range
          lensSpecs.focalLength.push({
            min: parseFloat(match[1]),
            max: parseFloat(match[2]),
            type: 'zoom'
          });
        } else { // Single focal length
          lensSpecs.focalLength.push({
            value: parseFloat(match[1]),
            type: 'prime'
          });
        }
      }
    }
    
    // Extract aperture
    for (const pattern of this.patterns.aperture) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) { // Range
          lensSpecs.aperture.push({
            wide: parseFloat(match[1]),
            tele: parseFloat(match[2])
          });
        } else { // Single aperture
          lensSpecs.aperture.push({
            value: parseFloat(match[1])
          });
        }
      }
    }
    
    return lensSpecs;
  }

  extractISORange(product, searchableText) {
    const isoRanges = [];
    
    for (const pattern of this.patterns.isoRange) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) { // Range
          isoRanges.push({
            min: parseInt(match[1]),
            max: parseInt(match[2])
          });
        } else { // Single ISO
          isoRanges.push({
            value: parseInt(match[1])
          });
        }
      }
    }
    
    return isoRanges;
  }

  extractVideoSpecs(product, searchableText) {
    const videoSpecs = {
      maxResolution: null,
      formats: []
    };
    
    for (const pattern of this.patterns.videoResolution) {
      const matches = searchableText.matchAll(pattern);
      for (const match of matches) {
        videoSpecs.formats.push(match[0].toLowerCase());
      }
    }
    
    // Determine max resolution
    if (videoSpecs.formats.some(f => f.includes('4k') || f.includes('uhd'))) {
      videoSpecs.maxResolution = '4K';
    } else if (videoSpecs.formats.some(f => f.includes('1080') || f.includes('full hd'))) {
      videoSpecs.maxResolution = 'Full HD';
    } else if (videoSpecs.formats.some(f => f.includes('720') || f.includes('hd'))) {
      videoSpecs.maxResolution = 'HD';
    }
    
    return videoSpecs;
  }

  extractPhysicalSpecs(product, searchableText) {
    const physicalSpecs = {
      dimensions: null,
      weight: null
    };
    
    // Extract dimensions
    for (const pattern of this.patterns.dimensions) {
      const match = searchableText.match(pattern);
      if (match) {
        physicalSpecs.dimensions = {
          width: parseFloat(match[1]),
          height: parseFloat(match[2]),
          depth: parseFloat(match[3]),
          unit: 'mm'
        };
        break;
      }
    }
    
    // Extract weight
    for (const pattern of this.patterns.weight) {
      const match = searchableText.match(pattern);
      if (match) {
        physicalSpecs.weight = {
          value: parseFloat(match[1]),
          unit: match[0].includes('kg') ? 'kg' : 'g'
        };
        break;
      }
    }
    
    return physicalSpecs;
  }

  standardizeSensorSize(rawSize) {
    const size = rawSize.toLowerCase();
    
    // Common sensor size mappings
    const mappings = {
      '1/2.3': '1/2.3"',
      '1/1.7': '1/1.7"',
      '1/1.8': '1/1.8"', 
      '2/3': '2/3"',
      'full frame': 'Full Frame',
      'aps-c': 'APS-C',
      'aps-h': 'APS-H',
      'micro four thirds': 'Micro Four Thirds',
      'super 35mm': 'Super 35mm'
    };
    
    for (const [key, value] of Object.entries(mappings)) {
      if (size.includes(key)) {
        return value;
      }
    }
    
    return rawSize;
  }

  categorizeDevice(product) {
    const category = product.category.toLowerCase();
    const name = product.name.toLowerCase();
    
    if (category.includes('dslr')) return 'DSLR Camera';
    if (category.includes('compact') && category.includes('digital')) return 'Compact Digital Camera';
    if (category.includes('camcorder')) return 'Camcorder';
    if (category.includes('cinema')) return 'Cinema Camera';
    if (category.includes('film')) return 'Film Camera';
    
    return product.category;
  }

  determineEra(product) {
    const date = product.marketedDate;
    if (!date) return 'Unknown';
    
    const year = parseInt(date.match(/\d{4}/)?.[0]);
    if (!year) return 'Unknown';
    
    if (year < 1980) return 'Vintage (Pre-1980)';
    if (year < 1990) return '1980s';
    if (year < 2000) return '1990s';
    if (year < 2010) return '2000s';
    if (year < 2020) return '2010s';
    return '2020s';
  }

  generateSearchTags(product, searchableText) {
    const tags = new Set();
    
    // Add category-based tags
    const category = product.category.toLowerCase();
    if (category.includes('digital')) tags.add('digital');
    if (category.includes('film')) tags.add('film');
    if (category.includes('dslr')) tags.add('dslr');
    if (category.includes('compact')) tags.add('compact');
    
    // Add feature-based tags
    if (searchableText.includes('zoom')) tags.add('zoom');
    if (searchableText.includes('macro')) tags.add('macro');
    if (searchableText.includes('stabilization') || searchableText.includes('image stabilizer')) tags.add('stabilization');
    if (searchableText.includes('touch') && searchableText.includes('screen')) tags.add('touchscreen');
    if (searchableText.includes('wifi') || searchableText.includes('wireless')) tags.add('wifi');
    if (searchableText.includes('bluetooth')) tags.add('bluetooth');
    if (searchableText.includes('4k')) tags.add('4k');
    if (searchableText.includes('full hd') || searchableText.includes('1080')) tags.add('full-hd');
    
    return Array.from(tags);
  }

  generateStatistics(products) {
    const stats = {
      megapixelProducts: 0,
      sensorProducts: 0,
      lensProducts: 0,
      categories: [],
      eras: [],
      megapixelDistribution: {},
      sensorSizeDistribution: {}
    };
    
    for (const product of products) {
      const smart = product.smartSpecs;
      
      if (smart.megapixels.primary) {
        stats.megapixelProducts++;
        const mp = Math.floor(smart.megapixels.primary);
        stats.megapixelDistribution[mp] = (stats.megapixelDistribution[mp] || 0) + 1;
      }
      
      if (smart.sensorSize.primary) {
        stats.sensorProducts++;
        const size = smart.sensorSize.primary;
        stats.sensorSizeDistribution[size] = (stats.sensorSizeDistribution[size] || 0) + 1;
      }
      
      if (smart.lensSpecs.focalLength.length > 0) {
        stats.lensProducts++;
      }
      
      if (!stats.categories.includes(product.category)) {
        stats.categories.push(product.category);
      }
      
      if (!stats.eras.includes(smart.era)) {
        stats.eras.push(smart.era);
      }
    }
    
    return stats;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const parser = new CanonSmartParser();
  parser.parseProducts()
    .then(() => console.log('🎉 Smart parsing completed successfully!'))
    .catch(console.error);
}

export { CanonSmartParser }; 